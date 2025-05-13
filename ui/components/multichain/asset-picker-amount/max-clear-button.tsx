import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { MetaMetricsEventCategory } from '../../../../shared/constants/metametrics';
import { AssetType } from '../../../../shared/constants/transaction';
import { hexToDecimal } from '../../../../shared/modules/conversion.utils';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  getSendAnalyticProperties,
  getSendMaxModeState,
  toggleSendMaxMode,
} from '../../../ducks/send';
import type { Asset } from '../../../ducks/send';
import { TextVariant } from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ButtonLink } from '../../component-library';

// A button that updates the send amount to max balance or 0.
export default function MaxClearButton({ asset }: { asset: Asset }) {
  const t = useI18nContext();
  const maxModeOn = useSelector(getSendMaxModeState);
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);
  const sendAnalytics = useSelector(getSendAnalyticProperties);

  const onClick = () => {
    trackEvent({
      event: 'Clicked "Amount Max"',
      category: MetaMetricsEventCategory.Transactions,
      properties: {
        ...sendAnalytics,
        action: 'Edit Screen',
        legacy_event: true,
      },
    });
    dispatch(toggleSendMaxMode());
  };

  return asset.type === AssetType.NFT ||
    Number(hexToDecimal(asset.balance || '0x0')) <= 0 ? null : (
    <ButtonLink
      className="asset-picker-amount__max-clear"
      onClick={onClick}
      marginLeft="auto"
      textProps={{ variant: TextVariant.bodySm }}
      data-testid="max-clear-button"
    >
      {maxModeOn ? t('clear') : t('max')}
    </ButtonLink>
  );
}
