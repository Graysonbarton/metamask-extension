import React from 'react';
import { useSelector } from 'react-redux';

import { MultichainNetworks } from '../../../../shared/constants/multichain/networks';
import {
  Display,
  FlexDirection,
} from '../../../helpers/constants/design-system';
import { WalletClientType } from '../../../hooks/accounts/useMultichainWalletSnapClient';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getMetaMaskKeyrings } from '../../../selectors';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
} from '../../component-library';
import { CreateSnapAccount } from '../create-snap-account';
import { SrpList } from '../multi-srp/srp-list';

type CreateSolanaAccountModalProps = {
  onClose: () => void;
};

export const CreateSolanaAccountModal = ({
  onClose,
}: CreateSolanaAccountModalProps) => {
  const t = useI18nContext();
  const [primaryKeyring] = useSelector(getMetaMaskKeyrings);
  const [showSrpSelection, setShowSrpSelection] = React.useState(false);
  const [showCreateAccount, setShowCreateAccount] = React.useState(true);
  const [selectedKeyringId, setSelectedKeyringId] = React.useState(
    primaryKeyring.metadata.id,
  );

  if (showCreateAccount) {
    return (
      <Modal isOpen onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          className="create-solana-account-modal"
          data-testid="create-solana-account-modal"
          modalDialogProps={{
            className: 'create-solana-account-modal__dialog',
            padding: 0,
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
          }}
        >
          <ModalHeader padding={4} onClose={onClose}>
            {t('createSolanaAccount')}
          </ModalHeader>
          <Box paddingLeft={4} paddingRight={4} paddingBottom={4}>
            <CreateSnapAccount
              onActionComplete={async (confirmed: boolean) => {
                if (confirmed) {
                  setShowCreateAccount(false);
                }
                onClose();
              }}
              selectedKeyringId={selectedKeyringId}
              onSelectSrp={() => {
                setShowSrpSelection(true);
                setShowCreateAccount(false);
              }}
              clientType={WalletClientType.Solana}
              chainId={MultichainNetworks.SOLANA}
            />
          </Box>
        </ModalContent>
      </Modal>
    );
  }

  if (showSrpSelection) {
    return (
      <Modal isOpen onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          className="create-solana-account-modal"
          data-testid="create-solana-account-modal"
          modalDialogProps={{
            className: 'create-solana-account-modal__dialog',
            padding: 0,
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
          }}
        >
          <ModalHeader padding={4} onClose={onClose}>
            {t('selectSRP')}
          </ModalHeader>
          <Box paddingLeft={4} paddingRight={4} paddingBottom={4}>
            <SrpList
              onActionComplete={(keyringId: string) => {
                setSelectedKeyringId(keyringId);
                setShowCreateAccount(true);
              }}
            />
          </Box>
        </ModalContent>
      </Modal>
    );
  }

  return null;
};
