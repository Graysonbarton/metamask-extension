import type { TransactionMeta } from '@metamask/transaction-controller';
import {
  TransactionEnvelopeType,
  TransactionType,
} from '@metamask/transaction-controller';
import type { Hex } from '@metamask/utils';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getSelectedNetworkClientId } from '../../../../shared/modules/selectors/networks';
import {
  addTransactionAndRouteToConfirmationPage,
  getCode,
} from '../../../store/actions';
import { useConfirmationNavigation } from './useConfirmationNavigation';

export const EIP_7702_REVOKE_ADDRESS =
  '0x0000000000000000000000000000000000000000';

export function useEIP7702Account({
  onRedirect,
}: { onRedirect?: () => void } = {}) {
  const dispatch = useDispatch();
  const [transactionId, setTransactionId] = useState<string | undefined>();
  const { confirmations, navigateToId } = useConfirmationNavigation();
  const globalNetworkClientId = useSelector(getSelectedNetworkClientId);

  const isRedirectPending = confirmations.some(
    (conf) => conf.id === transactionId,
  );

  const downgradeAccount = useCallback(
    async (address: Hex) => {
      const transactionMeta = (await dispatch(
        addTransactionAndRouteToConfirmationPage(
          {
            authorizationList: [
              {
                address: EIP_7702_REVOKE_ADDRESS,
              },
            ],
            from: address,
            to: address,
            type: TransactionEnvelopeType.setCode,
          },
          {
            networkClientId: globalNetworkClientId,
            type: TransactionType.revokeDelegation,
          },
        ),
      )) as unknown as TransactionMeta;

      setTransactionId(transactionMeta?.id);
    },
    [dispatch, globalNetworkClientId],
  );

  const isUpgraded = useCallback(
    async (address: Hex) => {
      const code = await getCode(address, globalNetworkClientId);
      return code?.length > 2;
    },
    [globalNetworkClientId],
  );

  useEffect(() => {
    if (isRedirectPending) {
      navigateToId(transactionId);
      onRedirect?.();
    }
  }, [isRedirectPending, navigateToId, transactionId, onRedirect]);

  return { isUpgraded, downgradeAccount };
}
