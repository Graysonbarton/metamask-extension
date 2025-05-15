import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './icon-button';
import {
  IconColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Tooltip from '../tooltip/tooltip';
import { Icon, IconName } from '../../component-library';

const meta: Meta<typeof IconButton> = {
  title: 'Components/UI/IconButton',
  component: IconButton,
  argTypes: {
    onClick: { action: 'clicked' },
    Icon: { control: 'object' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    className: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
  args: {
    onClick: () => {},
    Icon: <Icon name={IconName.Add} />,
    disabled: false,
    label: 'Icon Button',
    className: '',
    ariaLabel: '',
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

