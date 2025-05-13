import type { RestrictedMessenger } from '@metamask/base-controller';
import type {
  NameProvider,
  NameProviderMetadata,
  NameProviderRequest,
  NameProviderResult,
  NameProviderSourceResult,
} from '@metamask/name-controller';
import { NameType } from '@metamask/name-controller';
import type { GetPermissionControllerState } from '@metamask/permission-controller';
import type {
  GetAllSnaps,
  GetSnap,
  HandleSnapRequest,
} from '@metamask/snaps-controllers';
import type {
  AddressLookupArgs,
  AddressLookupResult,
  Snap as TruncatedSnap,
} from '@metamask/snaps-sdk';
import { HandlerType } from '@metamask/snaps-utils';
import log from 'loglevel';

type AllowedActions =
  | GetAllSnaps
  | GetSnap
  | HandleSnapRequest
  | GetPermissionControllerState;

export type SnapsNameProviderMessenger = RestrictedMessenger<
  'SnapsNameProvider',
  AllowedActions,
  never,
  AllowedActions['type'],
  never
>;

export class SnapsNameProvider implements NameProvider {
  readonly #messenger: SnapsNameProviderMessenger;

  constructor({ messenger }: { messenger: SnapsNameProviderMessenger }) {
    this.#messenger = messenger;
  }

  getMetadata(): NameProviderMetadata {
    const snaps = this.#getNameLookupSnaps();

    const sourceIds = {
      [NameType.ETHEREUM_ADDRESS]: snaps.map((snap) => snap.id),
    };

    const sourceLabels = snaps.reduce(
      (acc: NameProviderMetadata['sourceLabels'], snap) => {
        const snapDetails = this.#messenger.call('SnapController:get', snap.id);
        const snapName = snapDetails?.manifest.proposedName;

        return {
          ...acc,
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          [snap.id]: snapName || snap.id,
        };
      },
      {},
    );

    return {
      sourceIds,
      sourceLabels,
    };
  }

  async getProposedNames(
    request: NameProviderRequest,
  ): Promise<NameProviderResult> {
    const nameSnaps = this.#getNameLookupSnaps();

    const snapResults = await Promise.all(
      nameSnaps.map(async (snap) => this.#getSnapProposedName(snap, request)),
    );

    const results = snapResults.reduce(
      (acc: Record<string, NameProviderSourceResult>, snapResult) => {
        const { sourceId, result } = snapResult;
        return {
          ...acc,
          [sourceId]: result,
        };
      },
      {},
    );

    return { results };
  }

  #getNameLookupSnaps(): TruncatedSnap[] {
    const permissionSubjects = this.#messenger.call(
      'PermissionController:getState',
    ).subjects;

    const snaps = this.#messenger.call('SnapController:getAll');

    return snaps.filter(
      ({ id }) => permissionSubjects[id]?.permissions['endowment:name-lookup'],
    );
  }

  async #getSnapProposedName(
    snap: TruncatedSnap,
    request: NameProviderRequest,
  ): Promise<{ sourceId: string; result: NameProviderSourceResult }> {
    const { variation: chainIdHex, value } = request;
    const sourceId = snap.id;
    const chainIdDecimal = parseInt(chainIdHex, 16);

    const nameLookupRequest: AddressLookupArgs = {
      chainId: `eip155:${chainIdDecimal}`,
      address: value,
    };

    let proposedNames;
    let resultError;

    try {
      const result = (await this.#messenger.call(
        'SnapController:handleRequest',
        {
          snapId: snap.id,
          origin: 'metamask',
          handler: HandlerType.OnNameLookup,
          request: {
            jsonrpc: '2.0',
            method: ' ',
            params: nameLookupRequest,
          },
        },
      )) as AddressLookupResult;

      const domains = result?.resolvedDomains;

      // TODO: Determine if this is what we want.
      proposedNames = domains
        ? [...new Set(domains.map((domain) => domain.resolvedDomain))]
        : [];
    } catch (error) {
      log.error('Snap name provider request failed', {
        snapId: snap.id,
        request: nameLookupRequest,
        error,
      });

      resultError = error;
    }

    return {
      sourceId,
      result: {
        proposedNames,
        error: resultError,
      },
    };
  }
}
