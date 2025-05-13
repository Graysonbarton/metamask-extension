import React from 'react';

import {
  ConfirmInfoRow,
  ConfirmInfoRowText,
} from '../../../../../../../components/app/confirm/info/row';
import { ConfirmInfoSection } from '../../../../../../../components/app/confirm/info/row/section';
import { Box } from '../../../../../../../components/component-library';
import Preloader from '../../../../../../../components/ui/icon/preloader';
import {
  AlignItems,
  Display,
  JustifyContent,
} from '../../../../../../../helpers/constants/design-system';

const CollapsedSectionStyles = {
  display: Display.Flex,
  alignItems: AlignItems.center,
  justifyContent: JustifyContent.spaceBetween,
};

const StaticSimulation: React.FC<{
  title: string;
  titleTooltip: string;
  description?: string;
  simulationElements: React.ReactNode;
  isLoading?: boolean;
  isCollapsed?: boolean;
}> = ({
  title,
  titleTooltip,
  description,
  simulationElements,
  isLoading,
  isCollapsed = false,
}) => {
  return (
    <ConfirmInfoSection
      data-testid="confirmation__simulation_section"
      style={isCollapsed ? CollapsedSectionStyles : {}}
    >
      <ConfirmInfoRow label={title} tooltip={titleTooltip}>
        {description && <ConfirmInfoRowText text={description} />}
      </ConfirmInfoRow>
      {isLoading ? (
        <Box display={Display.Flex} justifyContent={JustifyContent.center}>
          <Preloader size={20} />
        </Box>
      ) : (
        simulationElements
      )}
    </ConfirmInfoSection>
  );
};

export default StaticSimulation;
