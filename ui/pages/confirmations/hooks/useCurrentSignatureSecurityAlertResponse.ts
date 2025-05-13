import type { TransactionMeta } from '@metamask/transaction-controller';
import { useSelector } from 'react-redux';

import { useConfirmContext } from '../context/confirm';
import type { SecurityAlertResponse } from '../types/confirm';

type SecurityAlertResponsesState = {
  metamask: {
    signatureSecurityAlertResponses: Record<string, SecurityAlertResponse>;
    transactions: TransactionMeta[];
  };
};

const useCurrentSignatureSecurityAlertResponse = ():
  | SecurityAlertResponse
  | undefined => {
  const { currentConfirmation } = useConfirmContext();

  const securityAlertId = (
    currentConfirmation?.securityAlertResponse as SecurityAlertResponse
  )?.securityAlertId as string;

  const signatureSecurityAlertResponse = useSelector(
    (state: SecurityAlertResponsesState) => {
      if (securityAlertId === undefined) {
        return undefined;
      }
      return state.metamask.signatureSecurityAlertResponses?.[securityAlertId];
    },
  );

  return signatureSecurityAlertResponse;
};

export default useCurrentSignatureSecurityAlertResponse;
