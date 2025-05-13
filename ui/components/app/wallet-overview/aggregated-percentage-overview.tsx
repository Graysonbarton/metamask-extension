import { getNativeTokenAddress } from '@metamask/assets-controllers';
import { toChecksumAddress } from 'ethereumjs-util';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatValue, isValidAmount } from '../../../../app/scripts/lib/util';
import { getCurrentChainId } from '../../../../shared/modules/selectors/networks';
import { getIntlLocale } from '../../../ducks/locale/locale';
import { getCurrentCurrency } from '../../../ducks/metamask/metamask';
import {
  Display,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { getCalculatedTokenAmount1dAgo } from '../../../helpers/utils/util';
import { useAccountTotalFiatBalance } from '../../../hooks/useAccountTotalFiatBalance';
import {
  getSelectedAccount,
  getShouldHideZeroBalanceTokens,
  getTokensMarketData,
  getPreferences,
} from '../../../selectors';

// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { Box, SensitiveText } from '../../component-library';

// core already has this exported type but its not yet available in this version
// todo remove this and use core type once available
type MarketDataDetails = {
  tokenAddress: string;
  pricePercentChange1d: number;
};

export const AggregatedPercentageOverview = () => {
  const tokensMarketData: Record<string, MarketDataDetails> =
    useSelector(getTokensMarketData);
  const locale = useSelector(getIntlLocale);
  const fiatCurrency = useSelector(getCurrentCurrency);
  const { privacyMode } = useSelector(getPreferences);
  const selectedAccount = useSelector(getSelectedAccount);
  const currentChainId = useSelector(getCurrentChainId);
  const shouldHideZeroBalanceTokens = useSelector(
    getShouldHideZeroBalanceTokens,
  );
  // Get total balance (native + tokens)
  const { totalFiatBalance, orderedTokenList } = useAccountTotalFiatBalance(
    selectedAccount,
    shouldHideZeroBalanceTokens,
  );

  // Memoize the calculation to avoid recalculating unless orderedTokenList or tokensMarketData changes
  const totalFiat1dAgo = useMemo(() => {
    return orderedTokenList.reduce((total1dAgo, item) => {
      if (item.address) {
        // This is a regular ERC20 token
        // find the relevant pricePercentChange1d in tokensMarketData
        // Find the corresponding market data for the token by filtering the values of the tokensMarketData object
        const found = tokensMarketData?.[toChecksumAddress(item.address)];

        const tokenFiat1dAgo = getCalculatedTokenAmount1dAgo(
          item.fiatBalance,
          found?.pricePercentChange1d,
        );
        return total1dAgo + Number(tokenFiat1dAgo);
      }
      // native token
      const nativePricePercentChange1d =
        tokensMarketData?.[getNativeTokenAddress(currentChainId)]
          ?.pricePercentChange1d;
      const nativeFiat1dAgo = getCalculatedTokenAmount1dAgo(
        item.fiatBalance,
        nativePricePercentChange1d,
      );
      return total1dAgo + Number(nativeFiat1dAgo);
    }, 0); // Initial total1dAgo is 0
  }, [orderedTokenList, tokensMarketData, currentChainId]); // Dependencies: recalculate if orderedTokenList or tokensMarketData changes

  const totalBalance: number = Number(totalFiatBalance);
  const totalBalance1dAgo = totalFiat1dAgo;

  const amountChange = totalBalance - totalBalance1dAgo;
  const percentageChange = (amountChange / totalBalance1dAgo) * 100 || 0;

  const formattedPercentChange = formatValue(
    amountChange === 0 ? 0 : percentageChange,
    true,
  );

  let formattedAmountChange = '';
  if (isValidAmount(amountChange)) {
    formattedAmountChange = amountChange >= 0 ? '+' : '';

    const options = {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2,
    } as const;

    try {
      // For currencies compliant with ISO 4217 Standard
      formattedAmountChange += `${Intl.NumberFormat(locale, {
        ...options,
        style: 'currency',
        currency: fiatCurrency,
      }).format(amountChange)} `;
    } catch {
      // Non-standard Currency Codes
      formattedAmountChange += `${Intl.NumberFormat(locale, {
        ...options,
        minimumFractionDigits: 2,
        style: 'decimal',
      }).format(amountChange)} `;
    }
  }

  let color = TextColor.textAlternative;

  if (!privacyMode && isValidAmount(amountChange)) {
    if (amountChange === 0) {
      color = TextColor.textAlternative;
    } else if (amountChange > 0) {
      color = TextColor.successDefault;
    } else {
      color = TextColor.errorDefault;
    }
  } else {
    color = TextColor.textAlternative;
  }

  return (
    <Box display={Display.Flex}>
      <SensitiveText
        variant={TextVariant.bodyMdMedium}
        color={color}
        data-testid="aggregated-value-change"
        style={{ whiteSpace: 'pre' }}
        isHidden={privacyMode}
        ellipsis
        length="10"
      >
        {formattedAmountChange}
      </SensitiveText>
      <SensitiveText
        variant={TextVariant.bodyMdMedium}
        color={color}
        data-testid="aggregated-percentage-change"
        isHidden={privacyMode}
        ellipsis
        length="10"
      >
        {formattedPercentChange}
      </SensitiveText>
    </Box>
  );
};
