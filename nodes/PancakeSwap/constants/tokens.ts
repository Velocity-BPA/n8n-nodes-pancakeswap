/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Common token addresses across PancakeSwap networks
 */

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export const COMMON_TOKENS: Record<string, Record<string, TokenInfo>> = {
  bsc: {
    CAKE: {
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    },
    WBNB: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      symbol: 'WBNB',
      name: 'Wrapped BNB',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png',
    },
    BUSD: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png',
    },
    USDT: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png',
    },
    USDC: {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
    },
    ETH: {
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      symbol: 'ETH',
      name: 'Ethereum Token',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png',
    },
    BTCB: {
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      symbol: 'BTCB',
      name: 'BTCB Token',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png',
    },
    DAI: {
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      symbol: 'DAI',
      name: 'Dai Token',
      decimals: 18,
      logoURI: 'https://tokens.pancakeswap.finance/images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png',
    },
  },
  ethereum: {
    CAKE: {
      address: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EesefcD131F6F6',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
    WBTC: {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
    },
  },
  arbitrum: {
    CAKE: {
      address: '0x1b896893dfc86bb67Cf57767b0bA97a8f2EB9b96',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WETH: {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    USDT: {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    USDC: {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    ARB: {
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      symbol: 'ARB',
      name: 'Arbitrum',
      decimals: 18,
    },
  },
  base: {
    CAKE: {
      address: '0x3055913c90Fcc1A6CE9a358911721eEb942013A1',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WETH: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    USDC: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  },
  zksync: {
    CAKE: {
      address: '0x3A287a06c66f9E95a56327185cA2BDF5f031cEcD',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WETH: {
      address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    USDC: {
      address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  },
  linea: {
    CAKE: {
      address: '0x0D1E753a25eBda689453309112904807625bEFBe',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WETH: {
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
    USDC: {
      address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  },
  polygonZkEvm: {
    CAKE: {
      address: '0x0D1E753a25eBda689453309112904807625bEFBe',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WETH: {
      address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
  },
  opbnb: {
    CAKE: {
      address: '0x2779106e4F4A8115E6D6a8F296a5d9D5cB74f4ee',
      symbol: 'CAKE',
      name: 'PancakeSwap Token',
      decimals: 18,
    },
    WBNB: {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WBNB',
      name: 'Wrapped BNB',
      decimals: 18,
    },
  },
};

export function getToken(network: string, symbol: string): TokenInfo | undefined {
  return COMMON_TOKENS[network]?.[symbol];
}

export function getTokenByAddress(network: string, address: string): TokenInfo | undefined {
  const tokens = COMMON_TOKENS[network];
  if (!tokens) return undefined;
  
  const normalizedAddress = address.toLowerCase();
  return Object.values(tokens).find(
    (token) => token.address.toLowerCase() === normalizedAddress
  );
}
