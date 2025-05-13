import { Messenger } from '@metamask/base-controller';
import { MultichainNetworkController } from '@metamask/multichain-network-controller';

import type { MultichainNetworkControllerMessenger } from '../messengers/multichain';
import { getMultichainNetworkControllerMessenger } from '../messengers/multichain';
import { buildControllerInitRequestMock } from '../test/utils';
import type { ControllerInitRequest } from '../types';
import { MultichainNetworkControllerInit } from './multichain-network-controller-init';

jest.mock('@metamask/multichain-network-controller');

type InitRequestMock = jest.Mocked<
  ControllerInitRequest<MultichainNetworkControllerMessenger>
> & {
  fetchFunction: typeof window.fetch;
};

const buildInitRequestMock = (): InitRequestMock => {
  const baseControllerMessenger = new Messenger();

  return {
    ...buildControllerInitRequestMock(),
    controllerMessenger: getMultichainNetworkControllerMessenger(
      baseControllerMessenger,
    ),
    initMessenger: undefined,
    fetchFunction: window.fetch.bind(window),
  };
};

describe('MultichainNetworkControllerInit', () => {
  const multichainNetworkControllerClassMock = jest.mocked(
    MultichainNetworkController,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    window.fetch = jest.fn();
  });

  it('returns controller instance', () => {
    const requestMock = buildInitRequestMock();
    expect(
      MultichainNetworkControllerInit(requestMock).controller,
    ).toBeInstanceOf(MultichainNetworkController);
  });

  it('initializes with correct messenger and state', () => {
    const requestMock = buildInitRequestMock();
    MultichainNetworkControllerInit(requestMock);

    expect(multichainNetworkControllerClassMock).toHaveBeenCalledWith({
      messenger: requestMock.controllerMessenger,
      state: requestMock.persistedState.MultichainNetworkController,
      networkService: expect.any(Object),
    });
  });
});
