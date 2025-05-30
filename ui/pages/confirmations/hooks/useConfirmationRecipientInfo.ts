import { useSelector } from 'react-redux';
import { getAccountByAddress } from '../../../helpers/utils/util';
import { accountsWithSendEtherInfoSelector } from '../../../selectors';
import { getConfirmationSender } from '../components/confirm/utils';
import { useConfirmContext } from '../context/confirm';

function useConfirmationRecipientInfo() {
  const { currentConfirmation } = useConfirmContext();
  const allAccounts = useSelector(accountsWithSendEtherInfoSelector);

  let senderAddress, senderName;
  if (currentConfirmation) {
    const { from } = getConfirmationSender(currentConfirmation);
    const fromAccount = getAccountByAddress(allAccounts, from);

    senderAddress = from;
    senderName = fromAccount?.metadata?.name;
  }

  return {
    // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31880
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    senderAddress: senderAddress || '',
    senderName: senderName || '',
  };
}

export default useConfirmationRecipientInfo;
