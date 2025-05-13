import React, { useState } from 'react';

import {
  Severity,
  TextColor,
} from '../../../../../../helpers/constants/design-system';
import useAlerts from '../../../../../../hooks/useAlerts';
import { Box } from '../../../../../component-library';
import { useAlertMetrics } from '../../../../alert-system/contexts/alertMetricsContext';
import InlineAlert from '../../../../alert-system/inline-alert/inline-alert';
import { MultipleAlertModal } from '../../../../alert-system/multiple-alert-modal';
import { ConfirmInfoRow, ConfirmInfoRowVariant } from '../row';
import type { ConfirmInfoRowProps } from '../row';

export type ConfirmInfoAlertRowProps = ConfirmInfoRowProps & {
  alertKey: string;
  ownerId: string;
  /** Determines whether to display the row only when an alert is present. */
  isShownWithAlertsOnly?: boolean;
};

function getAlertTextColors(
  variant?: ConfirmInfoRowVariant | Severity,
): TextColor {
  switch (variant) {
    case ConfirmInfoRowVariant.Critical:
    case Severity.Danger:
      return TextColor.errorDefault;
    case ConfirmInfoRowVariant.Warning:
    case Severity.Warning:
      return TextColor.warningDefault;
    case ConfirmInfoRowVariant.Default:
    default:
      return TextColor.textDefault;
  }
}

export const ConfirmInfoAlertRow = ({
  alertKey,
  ownerId,
  variant,
  isShownWithAlertsOnly = false,
  ...rowProperties
}: ConfirmInfoAlertRowProps) => {
  const { trackInlineAlertClicked } = useAlertMetrics();
  const { getFieldAlerts } = useAlerts(ownerId);
  const fieldAlerts = getFieldAlerts(alertKey);
  const hasFieldAlert = fieldAlerts.length > 0;
  const selectedAlertSeverity = fieldAlerts[0]?.severity;
  const selectedAlertKey = fieldAlerts[0]?.key;

  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);

  const handleModalClose = () => {
    setAlertModalVisible(false);
  };

  const handleInlineAlertClick = () => {
    setAlertModalVisible(true);
    trackInlineAlertClicked(selectedAlertKey);
  };

  const confirmInfoRowProps = {
    ...rowProperties,
    style: { background: 'transparent', ...rowProperties.style },
    color: getAlertTextColors(variant ?? selectedAlertSeverity),
    variant,
  };

  if (isShownWithAlertsOnly && !hasFieldAlert) {
    return null;
  }

  const inlineAlert = hasFieldAlert ? (
    <Box marginLeft={1}>
      <InlineAlert
        onClick={handleInlineAlertClick}
        severity={selectedAlertSeverity}
      />
    </Box>
  ) : null;

  return (
    <>
      {alertModalVisible && (
        <MultipleAlertModal
          alertKey={selectedAlertKey}
          ownerId={ownerId}
          onFinalAcknowledgeClick={handleModalClose}
          onClose={handleModalClose}
          showCloseIcon={false}
          skipAlertNavigation={true}
        />
      )}
      <ConfirmInfoRow {...confirmInfoRowProps} labelChildren={inlineAlert} />
    </>
  );
};
