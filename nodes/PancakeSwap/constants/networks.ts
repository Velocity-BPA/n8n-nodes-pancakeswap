/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Network configuration for all chains supported by PancakeSwap
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  subgraphs: {
    v2?: string;
    v3?: string;
    stableSwap?: string;
    blocks?: string;
  };
}

export const NETWORKS: Record<string, NetworkConfig> = {
  bsc: {
    name: 'BNB Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    subgraphs: {
      v2: 'https://proxy-worker-api.pancakeswap.com/bsc-exchange',
      v3: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc',
      stableSwap: 'https://api.thegraph.com/subgraphs/name/pancakeswap/stableswap-bsc',
      blocks: 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks-bsc',
    },
  },
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-eth',
      blocks: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    },
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-arb',
      blocks: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
    },
  },
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://api.studio.thegraph.com/query/45376/exchange-v3-base/version/latest',
    },
  },
  zksync: {
    name: 'zkSync Era',
    chainId: 324,
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://api.studio.thegraph.com/query/45376/exchange-v3-zksync/version/latest',
    },
  },
  linea: {
    name: 'Linea',
    chainId: 59144,
    rpcUrl: 'https://rpc.linea.build',
    explorerUrl: 'https://lineascan.build',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://graph-query.linea.build/subgraphs/name/pancakeswap/exchange-v3-linea',
    },
  },
  polygonZkEvm: {
    name: 'Polygon zkEVM',
    chainId: 1101,
    rpcUrl: 'https://zkevm-rpc.com',
    explorerUrl: 'https://zkevm.polygonscan.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://api.studio.thegraph.com/query/45376/exchange-v3-polygon-zkevm/version/latest',
    },
  },
  opbnb: {
    name: 'opBNB',
    chainId: 204,
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnbscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    subgraphs: {
      v3: 'https://opbnb-mainnet-graph.nodereal.io/subgraphs/name/pancakeswap/exchange-v3',
    },
  },
};

export const CHAIN_ID_TO_NETWORK: Record<number, string> = {
  56: 'bsc',
  1: 'ethereum',
  42161: 'arbitrum',
  8453: 'base',
  324: 'zksync',
  59144: 'linea',
  1101: 'polygonZkEvm',
  204: 'opbnb',
};

export function getNetworkConfig(network: string): NetworkConfig {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config;
}

export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  const networkKey = CHAIN_ID_TO_NETWORK[chainId];
  return networkKey ? NETWORKS[networkKey] : undefined;
}
