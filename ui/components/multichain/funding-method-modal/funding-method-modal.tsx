import type { CaipChainId } from '@metamask/utils';
import React, { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import type { ChainId } from '../../../../shared/constants/network';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  TextVariant,
  TextAlign,
} from '../../../helpers/constants/design-system';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import useRamps, {
  RampsMetaMaskEntry,
} from '../../../hooks/ramps/useRamps/useRamps';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getMetaMetricsId,
  getParticipateInMetaMetrics,
  getDataCollectionForMarketing,
  getSelectedAccount,
} from '../../../selectors';
import {
  getMultichainCurrentNetwork,
  getMultichainDefaultToken,
} from '../../../selectors/multichain';
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  Text,
  IconName,
} from '../../component-library';
import FundingMethodItem from './funding-method-item';

type FundingMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onClickReceive: () => void;
};

export const FundingMethodModal: React.FC<FundingMethodModalProps> = ({
  isOpen,
  onClose,
  title,
  onClickReceive,
}) => {
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);
  const { openBuyCryptoInPdapp } = useRamps();
  const { address: accountAddress } = useSelector(getSelectedAccount);
  const { chainId } = useSelector(getMultichainCurrentNetwork);
  const { symbol } = useSelector(getMultichainDefaultToken);
  const metaMetricsId = useSelector(getMetaMetricsId);
  const isMetaMetricsEnabled = useSelector(getParticipateInMetaMetrics);
  const isMarketingEnabled = useSelector(getDataCollectionForMarketing);

  const handleTransferCryptoClick = useCallback(() => {
    trackEvent({
      event: MetaMetricsEventName.NavSendButtonClicked,
      category: MetaMetricsEventCategory.Navigation,
      properties: {
        location: RampsMetaMaskEntry?.TokensBanner,
        text: 'Transfer crypto',
        chain_id: chainId,
        token_symbol: symbol,
      },
    });

    const url = getPortfolioUrl(
      'transfer',
      'ext_funding_method_modal',
      metaMetricsId,
      isMetaMetricsEnabled,
      isMarketingEnabled,
      accountAddress,
      'transfer',
    );
    global.platform.openTab({ url });
  }, [
    metaMetricsId,
    isMetaMetricsEnabled,
    isMarketingEnabled,
    chainId,
    symbol,
    accountAddress,
  ]);

  const handleBuyCryptoClick = useCallback(() => {
    trackEvent({
      event: MetaMetricsEventName.NavBuyButtonClicked,
      category: MetaMetricsEventCategory.Navigation,
      properties: {
        location: RampsMetaMaskEntry?.TokensBanner,
        text: 'Buy crypto',
        chain_id: chainId,
        token_symbol: symbol,
      },
    });
    openBuyCryptoInPdapp(chainId as ChainId | CaipChainId);
  }, [chainId, symbol]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} data-testid="funding-method-modal">
      <ModalOverlay />
      <ModalContent modalDialogProps={{ padding: 0 }}>
        <ModalHeader paddingBottom={2} onClose={onClose}>
          <Text variant={TextVariant.headingSm} textAlign={TextAlign.Center}>
            {title}
          </Text>
        </ModalHeader>
        <FundingMethodItem
          icon={IconName.Card}
          title={t('tokenMarketplace')}
          description={t('debitCreditPurchaseOptions')}
          onClick={handleBuyCryptoClick}
        />
        <FundingMethodItem
          icon={IconName.Received}
          title={t('receiveCrypto')}
          description={t('depositCrypto')}
          onClick={onClickReceive}
        />
        <FundingMethodItem
          icon={IconName.Link}
          title={t('transferCrypto')}
          description={t('linkCentralizedExchanges')}
          onClick={handleTransferCryptoClick}
        />
      </ModalContent>
    </Modal>
  );
};
