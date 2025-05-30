import { TransactionMeta } from '@metamask/transaction-controller';
import { TransactionMetricsRequest } from '../types/metametrics';

type SmartTransactionMetricsProperties = {
  is_smart_transaction: boolean;
  gas_included: boolean;
  smart_transaction_timed_out?: boolean;
  smart_transaction_proxied?: boolean;
};

export const getSmartTransactionMetricsProperties = (
  transactionMetricsRequest: TransactionMetricsRequest,
  transactionMeta: TransactionMeta,
) => {
  const isSmartTransaction = transactionMetricsRequest.getIsSmartTransaction(
    transactionMeta.chainId,
  );
  const properties = {
    is_smart_transaction: isSmartTransaction,
  } as SmartTransactionMetricsProperties;
  if (!isSmartTransaction) {
    return properties;
  }
  properties.gas_included = transactionMeta.swapMetaData?.gas_included;
  const smartTransaction =
    transactionMetricsRequest.getSmartTransactionByMinedTxHash(
      transactionMeta.hash,
    );
  const smartTransactionStatusMetadata = smartTransaction?.statusMetadata;
  if (!smartTransactionStatusMetadata) {
    return properties;
  }
  properties.smart_transaction_timed_out =
    smartTransactionStatusMetadata.timedOut;
  properties.smart_transaction_proxied = smartTransactionStatusMetadata.proxied;
  return properties;
};
