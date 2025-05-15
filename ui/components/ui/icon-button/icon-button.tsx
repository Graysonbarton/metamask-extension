import React, { forwardRef, memo } from 'react';
import classNames from 'classnames';
import { Text, ButtonBase } from '../../component-library';
import type { ButtonBaseProps } from '../../component-library/button-base/button-base.types';
import { AlignItems, Display, FlexDirection, JustifyContent, TextVariant } from '../../../helpers/constants/design-system';
import Tooltip from '../tooltip/tooltip';

export type IconButtonProps = ButtonBaseProps<'button'> & {
  onClick: () => void;
  Icon: React.ReactNode;
  label: string;
  className?: string;
  ariaLabel?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      onClick,
      Icon,
      disabled = false,
      label,
      className = '',
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const buttonAriaLabel = ariaLabel || label;

    return (
      <ButtonBase
        className={classNames('icon-button', className)}
        onClick={onClick}
        disabled={disabled}
        ref={ref}
        aria-label={buttonAriaLabel}
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        alignItems={AlignItems.center}
        justifyContent={JustifyContent.center}
        paddingTop={3}
        paddingBottom={3}
        paddingLeft={4}
        paddingRight={4}
        textProps={{
          ellipsis: true,
          className: 'icon-button__label',
        }}
        {...props}
      >
        {Icon}
        {label.length > 10 ? (
          <Tooltip title={label} position="bottom">
            <Text variant={TextVariant.bodySmMedium} ellipsis>{label}</Text>
          </Tooltip>
        ) : (
          <Text variant={TextVariant.bodySmMedium} ellipsis>{label}</Text>
        )}
      </ButtonBase>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
