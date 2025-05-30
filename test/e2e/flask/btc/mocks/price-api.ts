import { Mockttp } from 'mockttp';
import { DEFAULT_BTC_CONVERSION_RATE } from '../../../constants';

const PRICE_API_URL = 'https://price.api.cx.metamask.io';

export const mockExchangeRates = (mockServer: Mockttp) =>
  mockServer
    .forGet(`${PRICE_API_URL}/exchange-rates`)
    .withQuery({
      baseCurrency: 'btc',
    })
    .thenJson(200, {
      btc: {
        name: 'Bitcoin',
        ticker: 'btc',
        value: 1,
        currencyType: 'crypto',
      },
      eth: {
        name: 'Ether',
        ticker: 'eth',
        value: 43.74,
        currencyType: 'crypto',
      },
      ltc: {
        name: 'Litecoin',
        ticker: 'ltc',
        value: 918.741,
        currencyType: 'crypto',
      },
      bch: {
        name: 'Bitcoin Cash',
        ticker: 'bch',
        value: 249.973,
        currencyType: 'crypto',
      },
      bnb: {
        name: 'Binance Coin',
        ticker: 'bnb',
        value: 142.807,
        currencyType: 'crypto',
      },
      eos: {
        name: 'EOS',
        ticker: 'eos',
        value: 165431.825,
        currencyType: 'crypto',
      },
      xrp: {
        name: 'XRP',
        ticker: 'xrp',
        value: 35783.863,
        currencyType: 'crypto',
      },
      xlm: {
        name: 'Lumens',
        ticker: 'xlm',
        value: 297026.883,
        currencyType: 'crypto',
      },
      link: {
        name: 'Chainlink',
        ticker: 'link',
        value: 5928.614,
        currencyType: 'crypto',
      },
      dot: {
        name: 'Polkadot',
        ticker: 'dot',
        value: 20066.791,
        currencyType: 'crypto',
      },
      yfi: {
        name: 'Yearn.finance',
        ticker: 'yfi',
        value: 16.373,
        currencyType: 'crypto',
      },
      usd: {
        name: 'US Dollar',
        ticker: 'usd',
        value: DEFAULT_BTC_CONVERSION_RATE,
        currencyType: 'fiat',
      },
      aed: {
        name: 'United Arab Emirates Dirham',
        ticker: 'aed',
        value: 304164.18,
        currencyType: 'fiat',
      },
      ars: {
        name: 'Argentine Peso',
        ticker: 'ars',
        value: 88311748.483,
        currencyType: 'fiat',
      },
      aud: {
        name: 'Australian Dollar',
        ticker: 'aud',
        value: 131376.995,
        currencyType: 'fiat',
      },
      bdt: {
        name: 'Bangladeshi Taka',
        ticker: 'bdt',
        value: 10061587.178,
        currencyType: 'fiat',
      },
      bhd: {
        name: 'Bahraini Dinar',
        ticker: 'bhd',
        value: 31216.281,
        currencyType: 'fiat',
      },
      bmd: {
        name: 'Bermudian Dollar',
        ticker: 'bmd',
        value: 82818.722,
        currencyType: 'fiat',
      },
      brl: {
        name: 'Brazil Real',
        ticker: 'brl',
        value: 484290.759,
        currencyType: 'fiat',
      },
      cad: {
        name: 'Canadian Dollar',
        ticker: 'cad',
        value: 119443.728,
        currencyType: 'fiat',
      },
      chf: {
        name: 'Swiss Franc',
        ticker: 'chf',
        value: 73262.683,
        currencyType: 'fiat',
      },
      clp: {
        name: 'Chilean Peso',
        ticker: 'clp',
        value: 77700525.164,
        currencyType: 'fiat',
      },
      cny: {
        name: 'Chinese Yuan',
        ticker: 'cny',
        value: 599002.972,
        currencyType: 'fiat',
      },
      czk: {
        name: 'Czech Koruna',
        ticker: 'czk',
        value: 1911619.095,
        currencyType: 'fiat',
      },
      dkk: {
        name: 'Danish Krone',
        ticker: 'dkk',
        value: 568633.512,
        currencyType: 'fiat',
      },
      eur: {
        name: 'Euro',
        ticker: 'eur',
        value: 76219.974,
        currencyType: 'fiat',
      },
      gbp: {
        name: 'British Pound Sterling',
        ticker: 'gbp',
        value: 64052.91,
        currencyType: 'fiat',
      },
      gel: {
        name: 'Georgian Lari',
        ticker: 'gel',
        value: 229821.954,
        currencyType: 'fiat',
      },
      hkd: {
        name: 'Hong Kong Dollar',
        ticker: 'hkd',
        value: 643760.279,
        currencyType: 'fiat',
      },
      huf: {
        name: 'Hungarian Forint',
        ticker: 'huf',
        value: 30470186.986,
        currencyType: 'fiat',
      },
      idr: {
        name: 'Indonesian Rupiah',
        ticker: 'idr',
        value: 1354594406.83,
        currencyType: 'fiat',
      },
      ils: {
        name: 'Israeli New Shekel',
        ticker: 'ils',
        value: 305013.237,
        currencyType: 'fiat',
      },
      inr: {
        name: 'Indian Rupee',
        ticker: 'inr',
        value: 7201912.521,
        currencyType: 'fiat',
      },
      jpy: {
        name: 'Japanese Yen',
        ticker: 'jpy',
        value: 12325786.196,
        currencyType: 'fiat',
      },
      krw: {
        name: 'South Korean Won',
        ticker: 'krw',
        value: 120481008.513,
        currencyType: 'fiat',
      },
      kwd: {
        name: 'Kuwaiti Dinar',
        ticker: 'kwd',
        value: 25519.926,
        currencyType: 'fiat',
      },
      lkr: {
        name: 'Sri Lankan Rupee',
        ticker: 'lkr',
        value: 24495502.581,
        currencyType: 'fiat',
      },
      mmk: {
        name: 'Burmese Kyat',
        ticker: 'mmk',
        value: 173753679.168,
        currencyType: 'fiat',
      },
      mxn: {
        name: 'Mexican Peso',
        ticker: 'mxn',
        value: 1657620.285,
        currencyType: 'fiat',
      },
      myr: {
        name: 'Malaysian Ringgit',
        ticker: 'myr',
        value: 368253.448,
        currencyType: 'fiat',
      },
      ngn: {
        name: 'Nigerian Naira',
        ticker: 'ngn',
        value: 127011620.548,
        currencyType: 'fiat',
      },
      nok: {
        name: 'Norwegian Krone',
        ticker: 'nok',
        value: 884944.134,
        currencyType: 'fiat',
      },
      nzd: {
        name: 'New Zealand Dollar',
        ticker: 'nzd',
        value: 144718.263,
        currencyType: 'fiat',
      },
      php: {
        name: 'Philippine Peso',
        ticker: 'php',
        value: 4745678.75,
        currencyType: 'fiat',
      },
      pkr: {
        name: 'Pakistani Rupee',
        ticker: 'pkr',
        value: 23221863.681,
        currencyType: 'fiat',
      },
      pln: {
        name: 'Polish Zloty',
        ticker: 'pln',
        value: 318352.352,
        currencyType: 'fiat',
      },
      rub: {
        name: 'Russian Ruble',
        ticker: 'rub',
        value: 7105816.466,
        currencyType: 'fiat',
      },
      sar: {
        name: 'Saudi Riyal',
        ticker: 'sar',
        value: 310625.117,
        currencyType: 'fiat',
      },
      sek: {
        name: 'Swedish Krona',
        ticker: 'sek',
        value: 843739.915,
        currencyType: 'fiat',
      },
      sgd: {
        name: 'Singapore Dollar',
        ticker: 'sgd',
        value: 110598.026,
        currencyType: 'fiat',
      },
      thb: {
        name: 'Thai Baht',
        ticker: 'thb',
        value: 2786021.814,
        currencyType: 'fiat',
      },
      try: {
        name: 'Turkish Lira',
        ticker: 'try',
        value: 3037467.405,
        currencyType: 'fiat',
      },
      twd: {
        name: 'New Taiwan Dollar',
        ticker: 'twd',
        value: 2730640.852,
        currencyType: 'fiat',
      },
      uah: {
        name: 'Ukrainian hryvnia',
        ticker: 'uah',
        value: 3443684.956,
        currencyType: 'fiat',
      },
      vef: {
        name: 'Venezuelan bolívar fuerte',
        ticker: 'vef',
        value: 8292.638,
        currencyType: 'fiat',
      },
      vnd: {
        name: 'Vietnamese đồng',
        ticker: 'vnd',
        value: 2112992878.941,
        currencyType: 'fiat',
      },
      zar: {
        name: 'South African Rand',
        ticker: 'zar',
        value: 1507971.492,
        currencyType: 'fiat',
      },
      xdr: {
        name: 'IMF Special Drawing Rights',
        ticker: 'xdr',
        value: 62320.757,
        currencyType: 'fiat',
      },
      xag: {
        name: 'Silver - Troy Ounce',
        ticker: 'xag',
        value: 2437.157,
        currencyType: 'commodity',
      },
      xau: {
        name: 'Gold - Troy Ounce',
        ticker: 'xau',
        value: 27.568,
        currencyType: 'commodity',
      },
      bits: {
        name: 'Bits',
        ticker: 'bits',
        value: 1000000,
        currencyType: 'crypto',
      },
      sats: {
        name: 'Satoshi',
        ticker: 'sats',
        value: 100000000,
        currencyType: 'crypto',
      },
    });
