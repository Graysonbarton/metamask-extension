import classnames from 'classnames';
import React from 'react';

import {
  BackgroundColor,
  BlockSize,
} from '../../../helpers/constants/design-system';
import { Box } from '../box';
import type { PolymorphicRef, BoxProps } from '../box';
import type {
  ModalOverlayProps,
  ModalOverlayComponent,
} from './modal-overlay.types';

export const ModalOverlay: ModalOverlayComponent = React.forwardRef(
  <C extends React.ElementType = 'div'>(
    { onClick, className = '', ...props }: ModalOverlayProps<C>,
    ref?: PolymorphicRef<C>,
  ) => (
    <Box
      className={classnames('mm-modal-overlay', className)}
      ref={ref}
      backgroundColor={BackgroundColor.overlayDefault}
      width={BlockSize.Full}
      height={BlockSize.Full}
      onClick={onClick}
      aria-hidden="true"
      {...(props as BoxProps<C>)}
    />
  ),
);

export default ModalOverlay;
