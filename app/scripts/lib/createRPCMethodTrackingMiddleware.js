import { ApprovalType, detectSIWE } from '@metamask/controller-utils';
import { errorCodes } from '@metamask/rpc-errors';
import { isValidAddress } from 'ethereumjs-util';
import { MESSAGE_TYPE, ORIGIN_METAMASK } from '../../../shared/constants/app';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsEventUiCustomization,
  MetaMetricsRequestedThrough,
} from '../../../shared/constants/metametrics';
import { parseTypedDataMessage } from '../../../shared/modules/transaction.utils';

import {
  BlockaidResultType,
  BlockaidReason,
} from '../../../shared/constants/security-provider';
import {
  PRIMARY_TYPES_ORDER,
  PRIMARY_TYPES_PERMIT,
} from '../../../shared/constants/signatures';
import { SIGNING_METHODS } from '../../../shared/constants/transaction';
import { getErrorMessage } from '../../../shared/modules/error';
import {
  generateSignatureUniqueId,
  getBlockaidMetricsProps,
  // TODO: Remove restricted import
  // eslint-disable-next-line import/no-restricted-paths
} from '../../../ui/helpers/utils/metrics';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { shouldUseRedesignForSignatures } from '../../../shared/lib/confirmation.utils';
import { isSnapPreinstalled } from '../../../shared/lib/snaps/snaps';
import { getSnapAndHardwareInfoForMetrics } from './snap-keyring/metrics';

/**
 * These types determine how the method tracking middleware handles incoming
 * requests based on the method name.
 */
const RATE_LIMIT_TYPES = {
  TIMEOUT: 'timeout',
  BLOCKED: 'blocked',
  NON_RATE_LIMITED: 'non_rate_limited',
  RANDOM_SAMPLE: 'random_sample',
};

const STAGE = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

/**
 * This object maps a method name to a RATE_LIMIT_TYPE. If not in this map the
 * default is RANDOM_SAMPLE
 */
const RATE_LIMIT_MAP = {
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V3]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V4]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.PERSONAL_SIGN]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.ETH_DECRYPT]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.ETH_GET_ENCRYPTION_PUBLIC_KEY]:
    RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.ADD_ETHEREUM_CHAIN]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.SWITCH_ETHEREUM_CHAIN]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.ETH_REQUEST_ACCOUNTS]: RATE_LIMIT_TYPES.TIMEOUT,
  [MESSAGE_TYPE.WALLET_REQUEST_PERMISSIONS]: RATE_LIMIT_TYPES.TIMEOUT,
  [MESSAGE_TYPE.WALLET_CREATE_SESSION]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.SEND_METADATA]: RATE_LIMIT_TYPES.BLOCKED,
  [MESSAGE_TYPE.ETH_CHAIN_ID]: RATE_LIMIT_TYPES.BLOCKED,
  [MESSAGE_TYPE.ETH_ACCOUNTS]: RATE_LIMIT_TYPES.BLOCKED,
  [MESSAGE_TYPE.LOG_WEB3_SHIM_USAGE]: RATE_LIMIT_TYPES.BLOCKED,
  [MESSAGE_TYPE.GET_PROVIDER_STATE]: RATE_LIMIT_TYPES.BLOCKED,
  [MESSAGE_TYPE.WALLET_GET_CALLS_STATUS]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.WALLET_GET_CAPABILITIES]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
  [MESSAGE_TYPE.WALLET_SEND_CALLS]: RATE_LIMIT_TYPES.NON_RATE_LIMITED,
};

const MESSAGE_TYPE_TO_APPROVAL_TYPE = {
  [MESSAGE_TYPE.PERSONAL_SIGN]: ApprovalType.PersonalSign,
  [MESSAGE_TYPE.SIGN]: ApprovalType.SignTransaction,
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA]: ApprovalType.EthSignTypedData,
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V1]: ApprovalType.EthSignTypedData,
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V3]: ApprovalType.EthSignTypedData,
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V4]: ApprovalType.EthSignTypedData,
};

/**
 * For events with user interaction (approve / reject | cancel) this map will
 * return an object with APPROVED, REJECTED, REQUESTED, and FAILED keys that map to the
 * appropriate event names.
 */
const EVENT_NAME_MAP = {
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA]: {
    APPROVED: MetaMetricsEventName.SignatureApproved,
    REJECTED: MetaMetricsEventName.SignatureRejected,
    REQUESTED: MetaMetricsEventName.SignatureRequested,
  },
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V3]: {
    APPROVED: MetaMetricsEventName.SignatureApproved,
    REJECTED: MetaMetricsEventName.SignatureRejected,
    REQUESTED: MetaMetricsEventName.SignatureRequested,
  },
  [MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V4]: {
    APPROVED: MetaMetricsEventName.SignatureApproved,
    REJECTED: MetaMetricsEventName.SignatureRejected,
    REQUESTED: MetaMetricsEventName.SignatureRequested,
  },
  [MESSAGE_TYPE.PERSONAL_SIGN]: {
    APPROVED: MetaMetricsEventName.SignatureApproved,
    REJECTED: MetaMetricsEventName.SignatureRejected,
    REQUESTED: MetaMetricsEventName.SignatureRequested,
  },
  [MESSAGE_TYPE.ETH_DECRYPT]: {
    APPROVED: MetaMetricsEventName.DecryptionApproved,
    REJECTED: MetaMetricsEventName.DecryptionRejected,
    REQUESTED: MetaMetricsEventName.DecryptionRequested,
  },
  [MESSAGE_TYPE.ETH_GET_ENCRYPTION_PUBLIC_KEY]: {
    APPROVED: MetaMetricsEventName.EncryptionPublicKeyApproved,
    REJECTED: MetaMetricsEventName.EncryptionPublicKeyRejected,
    REQUESTED: MetaMetricsEventName.EncryptionPublicKeyRequested,
  },
  [MESSAGE_TYPE.ETH_REQUEST_ACCOUNTS]: {
    APPROVED: MetaMetricsEventName.PermissionsApproved,
    REJECTED: MetaMetricsEventName.PermissionsRejected,
    REQUESTED: MetaMetricsEventName.PermissionsRequested,
  },
  [MESSAGE_TYPE.WALLET_REQUEST_PERMISSIONS]: {
    APPROVED: MetaMetricsEventName.PermissionsApproved,
    REJECTED: MetaMetricsEventName.PermissionsRejected,
    REQUESTED: MetaMetricsEventName.PermissionsRequested,
  },
  [MESSAGE_TYPE.WALLET_CREATE_SESSION]: {
    APPROVED: MetaMetricsEventName.PermissionsApproved,
    REJECTED: MetaMetricsEventName.PermissionsRejected,
    REQUESTED: MetaMetricsEventName.PermissionsRequested,
  },
  [MESSAGE_TYPE.WALLET_GET_CALLS_STATUS]: {
    REQUESTED: MetaMetricsEventName.Wallet5792Called,
  },
  [MESSAGE_TYPE.WALLET_GET_CAPABILITIES]: {
    REQUESTED: MetaMetricsEventName.Wallet5792Called,
  },
  [MESSAGE_TYPE.WALLET_SEND_CALLS]: {
    REQUESTED: MetaMetricsEventName.Wallet5792Called,
  },
};

/**
 * This object maps a method name to a function that accept the method params and
 * returns a non-sensitive version that can be included in tracked events.
 * The default is to return undefined.
 */
const TRANSFORM_PARAMS_MAP = {
  [MESSAGE_TYPE.WATCH_ASSET]: ({ type }) => ({ type }),
  [MESSAGE_TYPE.ADD_ETHEREUM_CHAIN]: ([{ chainId }]) => ({ chainId }),
  [MESSAGE_TYPE.SWITCH_ETHEREUM_CHAIN]: ([{ chainId }]) => ({ chainId }),
};

const CUSTOM_PROPERTIES_MAP = {
  [MESSAGE_TYPE.WALLET_SEND_CALLS]: getWalletSendCallsProperties,
  [MESSAGE_TYPE.WALLET_CREATE_SESSION]: getWalletCreateSessionProperties,
};

const rateLimitTimeoutsByMethod = {};
let globalRateLimitCount = 0;

/**
 * Create signature request event fragment with an assigned unique identifier
 *
 * @param {MetaMetricsController} metaMetricsController
 * @param {OriginalRequest} req
 * @param {Partial<MetaMetricsEventFragment>} fragmentPayload
 * @param {MetaMetricsEventCategory} eventCategory
 */
function createSignatureFragment(
  metaMetricsController,
  req,
  fragmentPayload,
  eventCategory,
) {
  metaMetricsController.createEventFragment({
    category: eventCategory,

    initialEvent: MetaMetricsEventName.SignatureRequested,
    successEvent: MetaMetricsEventName.SignatureApproved,
    failureEvent: MetaMetricsEventName.SignatureRejected,

    uniqueIdentifier: generateSignatureUniqueId(req.id),
    persist: true,
    referrer: {
      url: req.origin,
    },
    ...fragmentPayload,
  });
}

/**
 * Updates and finalizes event fragment for signature requests
 *
 * @param {MetaMetricsController} metaMetricsController
 * @param {OriginalRequest} req
 * @param {MetaMetricsFinalizeEventFragmentOptions}  finalizeEventOptions
 * @param {Partial<MetaMetricsEventFragment>} fragmentPayload
 */
function finalizeSignatureFragment(
  metaMetricsController,
  req,
  finalizeEventOptions,
  fragmentPayload,
) {
  const signatureUniqueId = generateSignatureUniqueId(req.id);

  metaMetricsController.updateEventFragment(signatureUniqueId, fragmentPayload);

  metaMetricsController.finalizeEventFragment(
    signatureUniqueId,
    finalizeEventOptions,
  );
}

function isMultichainRequestMethod(method) {
  return [
    MESSAGE_TYPE.WALLET_CREATE_SESSION,
    MESSAGE_TYPE.WALLET_INVOKE_METHOD,
  ].includes(method);
}

/**
 * Returns a middleware that tracks inpage_provider usage using sampling for
 * each type of event except those that require user interaction, such as
 * signature requests
 *
 * @param {object} opts - options for the rpc method tracking middleware
 * @param {number} [opts.rateLimitTimeout] - time, in milliseconds, to wait before
 *  allowing another set of events to be tracked for methods rate limited by timeout.
 * @param {number} [opts.rateLimitSamplePercent] - percentage, in decimal, of events
 *  that should be tracked for methods rate limited by random sample.
 * @param {Function} opts.getAccountType
 * @param {Function} opts.getDeviceModel
 * @param {Function} opts.getHardwareTypeForMetric
 * @param {RestrictedMessenger} opts.snapAndHardwareMessenger
 * @param {number} [opts.globalRateLimitTimeout] - time, in milliseconds, of the sliding
 * time window that should limit the number of method calls tracked to globalRateLimitMaxAmount.
 * @param {number} [opts.globalRateLimitMaxAmount] - max number of method calls that should
 * tracked within the globalRateLimitTimeout time window.
 * @param {AppStateController} [opts.appStateController]
 * @param {MetaMetricsController} [opts.metaMetricsController]
 * @returns {Function}
 */

export default function createRPCMethodTrackingMiddleware({
  rateLimitTimeout = 60 * 5 * 1000, // 5 minutes
  rateLimitSamplePercent = 0.001, // 0.1%
  globalRateLimitTimeout = 60 * 5 * 1000, // 5 minutes
  globalRateLimitMaxAmount = 10, // max of events in the globalRateLimitTimeout window. pass 0 for no global rate limit
  getAccountType,
  getDeviceModel,
  getHardwareTypeForMetric,
  snapAndHardwareMessenger,
  appStateController,
  metaMetricsController,
  getHDEntropyIndex,
}) {
  return async function rpcMethodTrackingMiddleware(
    /** @type {any} */ req,
    /** @type {any} */ res,
    /** @type {Function} */ next,
  ) {
    const { origin, method, params } = req;

    const isMultichainRequest = isMultichainRequestMethod(method);
    // requestedThrough and eventCategory are currently redundant so we will want to
    // disentangle them in the future
    const requestedThrough = isMultichainRequest
      ? MetaMetricsRequestedThrough.MultichainApi
      : MetaMetricsRequestedThrough.EthereumProvider;

    const eventCategory = isMultichainRequest
      ? MetaMetricsEventCategory.MultichainApi
      : MetaMetricsEventCategory.InpageProvider;

    let invokedMethod = method;
    let multichainApiRequestScope;
    // if the request is through the multichain api, the method is nested in the params
    if (method === MESSAGE_TYPE.WALLET_INVOKE_METHOD) {
      invokedMethod = params?.request?.method;
      multichainApiRequestScope = params?.scope;
    }

    const rateLimitType = RATE_LIMIT_MAP[invokedMethod];

    let isRateLimited;
    switch (rateLimitType) {
      case RATE_LIMIT_TYPES.TIMEOUT:
        isRateLimited =
          typeof rateLimitTimeoutsByMethod[invokedMethod] !== 'undefined';
        break;
      case RATE_LIMIT_TYPES.NON_RATE_LIMITED:
        isRateLimited = false;
        break;
      case RATE_LIMIT_TYPES.BLOCKED:
        isRateLimited = true;
        break;
      default:
      case RATE_LIMIT_TYPES.RANDOM_SAMPLE:
        isRateLimited = Math.random() >= rateLimitSamplePercent;
        break;
    }

    const isGlobalRateLimited =
      globalRateLimitMaxAmount > 0 &&
      globalRateLimitCount >= globalRateLimitMaxAmount;

    // Get the participateInMetaMetrics state to determine if we should track
    // anything. This is extra redundancy because this value is checked in
    // the metametrics controller's trackEvent method as well.
    const userParticipatingInMetaMetrics =
      metaMetricsController.state.participateInMetaMetrics === true;

    // Get the event type, each of which has APPROVED, REJECTED and REQUESTED
    // keys for the various events in the flow.
    const eventType = EVENT_NAME_MAP[invokedMethod];

    const eventProperties = {
      api_source: requestedThrough,
    };

    if (multichainApiRequestScope) {
      eventProperties.chain_id_caip = multichainApiRequestScope;
    }

    let sensitiveEventProperties;

    const isPreinstalledSnap = isSnapPreinstalled(origin);

    // Boolean variable that reduces code duplication and increases legibility
    const shouldTrackEvent =
      // Don't track if the request came from our own UI or background
      origin !== ORIGIN_METAMASK &&
      // Don't track requests coming from preinstalled Snaps
      !isPreinstalledSnap &&
      // Don't track if the rate limit has been hit
      !isRateLimited &&
      // Don't track if the global rate limit has been hit
      !isGlobalRateLimited &&
      // Don't track if the user isn't participating in metametrics
      userParticipatingInMetaMetrics === true;

    if (shouldTrackEvent) {
      // We track an initial "requested" event as soon as the dapp calls the
      // provider method. For the events not special cased this is the only
      // event that will be fired and the event name will be
      // 'Provider Method Called'.
      const event = eventType
        ? eventType.REQUESTED
        : MetaMetricsEventName.ProviderMethodCalled;

      if (event === MetaMetricsEventName.SignatureRequested) {
        eventProperties.signature_type = invokedMethod;
        eventProperties.hd_entropy_index = getHDEntropyIndex();

        // In personal messages the first param is data while in typed messages second param is data
        // if condition below is added to ensure that the right params are captured as data and address.
        let data;
        if (isValidAddress(req?.params?.[1])) {
          data = req?.params?.[0];
        } else {
          data = req?.params?.[1];
        }

        if (req.securityAlertResponse?.providerRequestsCount) {
          Object.keys(req.securityAlertResponse.providerRequestsCount).forEach(
            (key) => {
              const metricKey = `ppom_${key}_count`;
              eventProperties[metricKey] =
                req.securityAlertResponse.providerRequestsCount[key];
            },
          );
        }

        eventProperties.security_alert_response =
          req.securityAlertResponse?.result_type ??
          BlockaidResultType.NotApplicable;
        eventProperties.security_alert_reason =
          req.securityAlertResponse?.reason ?? BlockaidReason.notApplicable;

        if (req.securityAlertResponse?.description) {
          eventProperties.security_alert_description =
            req.securityAlertResponse.description;
        }

        if (
          shouldUseRedesignForSignatures({
            approvalType: MESSAGE_TYPE_TO_APPROVAL_TYPE[invokedMethod],
          })
        ) {
          eventProperties.ui_customizations = [
            ...(eventProperties.ui_customizations || []),
            MetaMetricsEventUiCustomization.RedesignedConfirmation,
          ];
        }

        const snapAndHardwareInfo = await getSnapAndHardwareInfoForMetrics(
          getAccountType,
          getDeviceModel,
          getHardwareTypeForMetric,
          snapAndHardwareMessenger,
        );

        // merge the snapAndHardwareInfo into eventProperties
        Object.assign(eventProperties, snapAndHardwareInfo);

        try {
          if (invokedMethod === MESSAGE_TYPE.PERSONAL_SIGN) {
            const { isSIWEMessage } = detectSIWE({ data });
            if (isSIWEMessage) {
              eventProperties.ui_customizations = [
                ...(eventProperties.ui_customizations || []),
                MetaMetricsEventUiCustomization.Siwe,
              ];
            }
          } else if (invokedMethod === MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V4) {
            const parsedMessageData = parseTypedDataMessage(data);
            sensitiveEventProperties = {};

            eventProperties.eip712_primary_type = parsedMessageData.primaryType;
            sensitiveEventProperties.eip712_verifyingContract =
              parsedMessageData.domain.verifyingContract;
            sensitiveEventProperties.eip712_domain_version =
              parsedMessageData.domain.version;
            sensitiveEventProperties.eip712_domain_name =
              parsedMessageData.domain.name;

            if (PRIMARY_TYPES_PERMIT.includes(parsedMessageData.primaryType)) {
              eventProperties.ui_customizations = [
                ...(eventProperties.ui_customizations || []),
                MetaMetricsEventUiCustomization.Permit,
              ];
            } else if (
              PRIMARY_TYPES_ORDER.includes(parsedMessageData.primaryType)
            ) {
              eventProperties.ui_customizations = [
                ...(eventProperties.ui_customizations || []),
                MetaMetricsEventUiCustomization.Order,
              ];
            }
          }
        } catch (e) {
          console.warn(`createRPCMethodTrackingMiddleware: Errored - ${e}`);
        }
      } else {
        eventProperties.method = invokedMethod;
      }

      const transformParams = TRANSFORM_PARAMS_MAP[invokedMethod];
      if (transformParams) {
        eventProperties.params = transformParams(params);
      }

      CUSTOM_PROPERTIES_MAP[invokedMethod]?.(
        req,
        undefined,
        STAGE.REQUESTED,
        eventProperties,
      );

      if (event === MetaMetricsEventName.SignatureRequested) {
        const fragmentPayload = {
          properties: eventProperties,
          sensitiveProperties: sensitiveEventProperties,
        };

        createSignatureFragment(
          metaMetricsController,
          req,
          fragmentPayload,
          eventCategory,
        );
      } else {
        metaMetricsController.trackEvent({
          event,
          category: eventCategory,
          referrer: {
            url: origin,
          },
          properties: eventProperties,
        });
      }

      if (rateLimitType === RATE_LIMIT_TYPES.TIMEOUT) {
        rateLimitTimeoutsByMethod[invokedMethod] = setTimeout(() => {
          delete rateLimitTimeoutsByMethod[invokedMethod];
        }, rateLimitTimeout);
      }

      globalRateLimitCount += 1;
      setTimeout(() => {
        globalRateLimitCount -= 1;
      }, globalRateLimitTimeout);
    }

    next(async (callback) => {
      if (shouldTrackEvent === false || typeof eventType === 'undefined') {
        return callback();
      }
      const location = res.error?.data?.location;

      let event;
      let stage;

      const errorMessage = getErrorMessage(res.error);

      if (res.error?.code === errorCodes.provider.userRejectedRequest) {
        event = eventType.REJECTED;
        stage = STAGE.REJECTED;
      } else if (
        res.error?.code === errorCodes.rpc.internal &&
        [errorMessage, res.error.message].includes(
          'Request rejected by user or snap.',
        )
      ) {
        // The signature was approved in MetaMask but rejected in the snap
        event = eventType.REJECTED;
        stage = STAGE.REJECTED;
        eventProperties.status = errorMessage;
      } else {
        event = eventType.APPROVED;
        stage = STAGE.APPROVED;
      }

      if (!event) {
        return callback();
      }

      CUSTOM_PROPERTIES_MAP[invokedMethod]?.(req, res, stage, eventProperties);

      let blockaidMetricProps = {};
      if (SIGNING_METHODS.includes(invokedMethod)) {
        const securityAlertResponse =
          appStateController.getSignatureSecurityAlertResponse(
            req.securityAlertResponse?.securityAlertId,
          );

        blockaidMetricProps = getBlockaidMetricsProps({
          securityAlertResponse,
        });
      }
      const properties = {
        ...eventProperties,
        ...blockaidMetricProps,
        location,
      };

      if (
        event === MetaMetricsEventName.SignatureRejected ||
        event === MetaMetricsEventName.SignatureApproved
      ) {
        const finalizeOptions = {
          abandoned: event === eventType.REJECTED,
        };
        const fragmentPayload = {
          properties: {
            ...properties,
            hd_entropy_index: getHDEntropyIndex(),
          },
          sensitiveProperties: sensitiveEventProperties,
        };

        finalizeSignatureFragment(
          metaMetricsController,
          req,
          finalizeOptions,
          fragmentPayload,
        );
      } else {
        metaMetricsController.trackEvent({
          event,
          category: eventCategory,
          referrer: {
            url: origin,
          },
          properties,
        });
      }
      return callback();
    });
  };
}

function getWalletSendCallsProperties(req, _res, stage, eventProperties) {
  if (stage !== STAGE.REQUESTED) {
    return;
  }

  const { params } = req;
  const callCount = params?.[0]?.calls?.length;

  if (callCount) {
    eventProperties.batch_transaction_count = callCount;
  }
}

function getWalletCreateSessionProperties(req, res, stage, eventProperties) {
  if (stage === STAGE.REQUESTED) {
    const { params } = req;
    const requiredScopes = params?.requiredScopes || {};
    const optionalScopes = params?.optionalScopes || {};

    const scopeSet = new Set();

    for (const key of Object.keys(requiredScopes)) {
      scopeSet.add(key);
    }

    for (const key of Object.keys(optionalScopes)) {
      scopeSet.add(key);
    }

    eventProperties.chain_id_list = Array.from(scopeSet);
  } else if (stage === STAGE.APPROVED) {
    const { result } = res;
    const scopes = Object.keys(result?.sessionScopes || {});
    eventProperties.chain_id_list = scopes;
  }
}
