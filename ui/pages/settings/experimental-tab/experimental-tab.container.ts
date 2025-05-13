import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import {
  ///: BEGIN:ONLY_INCLUDE_IF(bitcoin)
  getIsBitcoinSupportEnabled,
  getIsBitcoinTestnetSupportEnabled,
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
  getIsAddSnapAccountEnabled,
  ///: END:ONLY_INCLUDE_IF
  getFeatureNotificationsEnabled,
  getIsWatchEthereumAccountEnabled,
} from '../../../selectors';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(bitcoin)
  setBitcoinSupportEnabled,
  setBitcoinTestnetSupportEnabled,
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
  setAddSnapAccountEnabled,
  ///: END:ONLY_INCLUDE_IF
  setFeatureNotificationsEnabled,
  setWatchEthereumAccountEnabled,
} from '../../../store/actions';
import type {
  MetaMaskReduxDispatch,
  MetaMaskReduxState,
} from '../../../store/store';
import ExperimentalTab from './experimental-tab.component';

const mapStateToProps = (state: MetaMaskReduxState) => {
  const featureNotificationsEnabled = getFeatureNotificationsEnabled(state);
  return {
    watchAccountEnabled: getIsWatchEthereumAccountEnabled(state),
    ///: BEGIN:ONLY_INCLUDE_IF(bitcoin)
    bitcoinSupportEnabled: getIsBitcoinSupportEnabled(state),
    bitcoinTestnetSupportEnabled: getIsBitcoinTestnetSupportEnabled(state),
    ///: END:ONLY_INCLUDE_IF
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    addSnapAccountEnabled: getIsAddSnapAccountEnabled(state),
    ///: END:ONLY_INCLUDE_IF
    featureNotificationsEnabled,
  };
};

const mapDispatchToProps = (dispatch: MetaMaskReduxDispatch) => {
  return {
    setWatchAccountEnabled: async (value: boolean) =>
      setWatchEthereumAccountEnabled(value),
    ///: BEGIN:ONLY_INCLUDE_IF(bitcoin)
    setBitcoinSupportEnabled: async (value: boolean) =>
      setBitcoinSupportEnabled(value),
    setBitcoinTestnetSupportEnabled: async (value: boolean) =>
      setBitcoinTestnetSupportEnabled(value),
    ///: END:ONLY_INCLUDE_IF
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    setAddSnapAccountEnabled: async (value: boolean) =>
      setAddSnapAccountEnabled(value),
    ///: END:ONLY_INCLUDE_IF
    setFeatureNotificationsEnabled: async (value: boolean) => {
      return dispatch(setFeatureNotificationsEnabled(value));
    },
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(ExperimentalTab);
