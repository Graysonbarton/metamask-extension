import type { CSSProperties } from 'react';
import React, { useCallback } from 'react';

import { IconColor } from '../../../../../helpers/constants/design-system';
import { useCopyToClipboard } from '../../../../../hooks/useCopyToClipboard';
import {
  ButtonIcon,
  ButtonIconSize,
  IconName,
} from '../../../../component-library';

type CopyCallback = (text: string) => void;

export const CopyIcon: React.FC<{
  copyText: string;
  color?: IconColor;
  style?: CSSProperties;
}> = ({ copyText, color, style = {} }) => {
  const [copied, handleCopy] = useCopyToClipboard();

  const handleClick = useCallback(async () => {
    (handleCopy as CopyCallback)(copyText);
  }, [copyText]);

  return (
    <ButtonIcon
      color={color ?? IconColor.iconAlternative}
      iconName={copied ? IconName.CopySuccess : IconName.Copy}
      size={ButtonIconSize.Sm}
      style={{
        cursor: 'pointer',
        position: 'absolute',
        right: 0,
        top: 2,
        ...style,
      }}
      onClick={handleClick}
      ariaLabel="copy-button"
    />
  );
};
