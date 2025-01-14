export const App = {
  stackup: {
    backendUrl: process.env.NEXT_PUBLIC_STACKUP_BACKEND_URL || '',
  },
  pusher: {
    appKey: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
    appCluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '',
  },
  amplitude: {
    apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '',
  },
  web3: {
    explorer: process.env.NEXT_PUBLIC_WEB3_EXPLORER || '',
    paymaster: process.env.NEXT_PUBLIC_WEB3_PAYMASTER || '',
    rpc: process.env.NEXT_PUBLIC_WEB3_RPC || '',
    usdc: process.env.NEXT_PUBLIC_WEB3_USDC || '',
    usdcPriceFeed: process.env.NEXT_PUBLIC_WEB3_USDC_PRICE_FEED || '',
    usdcUnits: 'mwei',
    nativeSymbol: 'MATIC',
  },
  intercom: {
    appId: process.env.NEXT_PUBLIC_INTERCOM_APP_ID || '',
  },
  featureFlag: {
    whitelist: process.env.NEXT_PUBLIC_FEATURE_FLAG_WHITELIST === 'true',
    alphaBanner: process.env.NEXT_PUBLIC_FEATURE_FLAG_ALPHA_BANNER === 'true',
  },
};
