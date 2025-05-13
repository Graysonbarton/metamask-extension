import { useCallback } from 'react';

import type { MetaMetricsEventFragment } from '../../../../shared/constants/metametrics';
import { generateSignatureUniqueId } from '../../../helpers/utils/metrics';
import { updateEventFragment } from '../../../store/actions';
import { useConfirmContext } from '../context/confirm';
import type { SignatureRequestType } from '../types/confirm';
import { isSignatureTransactionType } from '../utils';

/**
 * When a signature has been requested, there should be an event fragment created for it in
 * {@see {@link app/scripts/lib/createRPCMethodTrackingMiddleware.js}.
 * This hook method is used to update an existing signature event fragment for a signature confirmation.
 */
export const useSignatureEventFragment = () => {
  const { currentConfirmation } = useConfirmContext();

  const requestId =
    isSignatureTransactionType(currentConfirmation) &&
    ((currentConfirmation as SignatureRequestType)?.msgParams
      ?.requestId as number);
  const fragmentId = requestId ? generateSignatureUniqueId(requestId) : null;

  const updateSignatureEventFragment = useCallback(
    async (fragmentPayload: Partial<MetaMetricsEventFragment>) => {
      if (!fragmentId) {
        return;
      }

      updateEventFragment(fragmentId, fragmentPayload);
    },
    [fragmentId],
  );

  return { updateSignatureEventFragment };
};
