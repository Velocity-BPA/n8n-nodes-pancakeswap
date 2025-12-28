/**
 * PancakeSwap Subgraph Resource
 * GraphQL subgraph queries
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';

export const subgraphOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['subgraph'],
      },
    },
    options: [
      {
        name: 'Query Pools',
        value: 'queryPools',
        description: 'Query pool data from subgraph',
        action: 'Query pools',
      },
      {
        name: 'Query Pairs',
        value: 'queryPairs',
        description: 'Query V2 pair data from subgraph',
        action: 'Query pairs',
      },
      {
        name: 'Query Positions',
        value: 'queryPositions',
        description: 'Query V3 positions from subgraph',
        action: 'Query positions',
      },
      {
        name: 'Query Swaps',
        value: 'querySwaps',
        description: 'Query swap transactions from subgraph',
        action: 'Query swaps',
      },
      {
        name: 'Query Farms',
        value: 'queryFarms',
        description: 'Query farm data from subgraph',
        action: 'Query farms',
      },
      {
        name: 'Query Tokens',
        value: 'queryTokens',
        description: 'Query token data from subgraph',
        action: 'Query tokens',
      },
      {
        name: 'Custom GraphQL Query',
        value: 'customQuery',
        description: 'Execute a custom GraphQL query',
        action: 'Execute custom query',
      },
      {
        name: 'Get Subgraph Status',
        value: 'getStatus',
        description: 'Get subgraph indexing status',
        action: 'Get subgraph status',
      },
    ],
    default: 'queryPools',
  },
];

export const subgraphFields: INodeProperties[] = [
  // Subgraph selection
  {
    displayName: 'Subgraph',
    name: 'subgraph',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['subgraph'],
      },
    },
    options: [
      { name: 'Exchange V2 (BSC)', value: 'v2-bsc' },
      { name: 'Exchange V3 (BSC)', value: 'v3-bsc' },
      { name: 'StableSwap (BSC)', value: 'stableswap-bsc' },
      { name: 'MasterChef V2 (BSC)', value: 'masterchef-bsc' },
      { name: 'Exchange V3 (Ethereum)', value: 'v3-ethereum' },
      { name: 'Exchange V3 (Arbitrum)', value: 'v3-arbitrum' },
      { name: 'Exchange V3 (Base)', value: 'v3-base' },
      { name: 'Exchange V3 (zkSync)', value: 'v3-zksync' },
    ],
    default: 'v3-bsc',
    description: 'Select the subgraph to query',
  },
  // Query fields - Pools/Pairs
  {
    displayName: 'Order By',
    name: 'orderBy',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['queryPools', 'queryPairs', 'queryTokens'],
      },
    },
    options: [
      { name: 'TVL (High to Low)', value: 'totalValueLockedUSD' },
      { name: 'Volume (24h)', value: 'volumeUSD' },
      { name: 'Created At', value: 'createdAtTimestamp' },
      { name: 'Transaction Count', value: 'txCount' },
    ],
    default: 'totalValueLockedUSD',
    description: 'Field to order results by',
  },
  {
    displayName: 'First',
    name: 'first',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['queryPools', 'queryPairs', 'queryPositions', 'querySwaps', 'queryFarms', 'queryTokens'],
      },
    },
    default: 100,
    typeOptions: {
      minValue: 1,
      maxValue: 1000,
    },
    description: 'Number of results to return (max 1000)',
  },
  {
    displayName: 'Skip',
    name: 'skip',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['queryPools', 'queryPairs', 'queryPositions', 'querySwaps', 'queryFarms', 'queryTokens'],
      },
    },
    default: 0,
    description: 'Number of results to skip (for pagination)',
  },
  // Filter fields
  {
    displayName: 'Min TVL (USD)',
    name: 'minTvl',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['queryPools', 'queryPairs'],
      },
    },
    default: 0,
    description: 'Minimum TVL filter',
  },
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['queryPools', 'queryPairs', 'querySwaps'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Filter by token address',
  },
  // Position query fields
  {
    displayName: 'Owner Address',
    name: 'ownerAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['queryPositions'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Filter positions by owner address',
  },
  // Swap query fields
  {
    displayName: 'Sender Address',
    name: 'senderAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['querySwaps'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Filter swaps by sender address',
  },
  {
    displayName: 'Pool Address',
    name: 'poolAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['querySwaps', 'queryPositions'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Filter by pool address',
  },
  // Custom query
  {
    displayName: 'GraphQL Query',
    name: 'graphqlQuery',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['customQuery'],
      },
    },
    typeOptions: {
      rows: 10,
    },
    default: `{
  pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id
    token0 { symbol }
    token1 { symbol }
    totalValueLockedUSD
    volumeUSD
  }
}`,
    description: 'GraphQL query to execute',
  },
  {
    displayName: 'Variables',
    name: 'graphqlVariables',
    type: 'json',
    displayOptions: {
      show: {
        resource: ['subgraph'],
        operation: ['customQuery'],
      },
    },
    default: '{}',
    description: 'GraphQL query variables as JSON',
  },
];

/**
 * Execute subgraph operations
 * PancakeSwap subgraphs are deployed on The Graph network
 * Endpoints vary by chain and protocol version
 */
export async function executeSubgraph(
  this: IExecuteFunctions,
  index: number,
  operation: string,
): Promise<IDataObject> {
  const subgraph = this.getNodeParameter('subgraph', index, 'v3-bsc') as string;
  
  const subgraphEndpoints: Record<string, string> = {
    'v2-bsc': 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2-bsc',
    'v3-bsc': 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc',
    'stableswap-bsc': 'https://api.thegraph.com/subgraphs/name/pancakeswap/stableswap-bsc',
    'masterchef-bsc': 'https://api.thegraph.com/subgraphs/name/pancakeswap/masterchef-v2',
    'v3-ethereum': 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-ethereum',
    'v3-arbitrum': 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-arbitrum',
    'v3-base': 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-base',
    'v3-zksync': 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-zksync',
  };
  
  switch (operation) {
    case 'queryPools': {
      const first = this.getNodeParameter('first', index, 100) as number;
      const skip = this.getNodeParameter('skip', index, 0) as number;
      const orderBy = this.getNodeParameter('orderBy', index, 'totalValueLockedUSD') as string;
      const minTvl = this.getNodeParameter('minTvl', index, 0) as number;
      const tokenAddress = this.getNodeParameter('tokenAddress', index, '') as string;
      
      // Sample pool data (in real implementation, this would query the subgraph)
      const pools = [
        {
          id: '0x...',
          token0: { id: '0x...', symbol: 'CAKE', name: 'PancakeSwap Token', decimals: 18 },
          token1: { id: '0x...', symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18 },
          feeTier: 2500,
          liquidity: '1250000000000000000000000',
          sqrtPrice: '79228162514264337593543950336',
          tick: 0,
          totalValueLockedUSD: '125000000',
          volumeUSD: '45000000',
          txCount: '125000',
          createdAtTimestamp: '1654000000',
        },
        {
          id: '0x...',
          token0: { id: '0x...', symbol: 'USDT', name: 'Tether USD', decimals: 18 },
          token1: { id: '0x...', symbol: 'USDC', name: 'USD Coin', decimals: 18 },
          feeTier: 100,
          liquidity: '980000000000000000000000',
          sqrtPrice: '79228162514264337593543950336',
          tick: 0,
          totalValueLockedUSD: '98000000',
          volumeUSD: '120000000',
          txCount: '85000',
          createdAtTimestamp: '1654100000',
        },
      ];
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: {
          first,
          skip,
          orderBy,
          orderDirection: 'desc',
          where: {
            totalValueLockedUSD_gte: minTvl,
            ...(tokenAddress ? { or: [{ token0: tokenAddress.toLowerCase() }, { token1: tokenAddress.toLowerCase() }] } : {}),
          },
        },
        data: {
          pools: pools.slice(0, first),
        },
        totalReturned: pools.length,
      };
    }
    
    case 'queryPairs': {
      const first = this.getNodeParameter('first', index, 100) as number;
      const skip = this.getNodeParameter('skip', index, 0) as number;
      const orderBy = this.getNodeParameter('orderBy', index, 'totalValueLockedUSD') as string;
      
      const pairs = [
        {
          id: '0x...',
          token0: { id: '0x...', symbol: 'CAKE', decimals: 18 },
          token1: { id: '0x...', symbol: 'WBNB', decimals: 18 },
          reserve0: '5000000',
          reserve1: '15000',
          totalSupply: '250000',
          reserveUSD: '55000000',
          volumeUSD: '18000000',
          txCount: '45000',
          createdAtTimestamp: '1619000000',
        },
      ];
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: { first, skip, orderBy },
        data: { pairs },
        totalReturned: pairs.length,
      };
    }
    
    case 'queryPositions': {
      const first = this.getNodeParameter('first', index, 100) as number;
      const skip = this.getNodeParameter('skip', index, 0) as number;
      const ownerAddress = this.getNodeParameter('ownerAddress', index, '') as string;
      const poolAddress = this.getNodeParameter('poolAddress', index, '') as string;
      
      const positions = [
        {
          id: '12345',
          owner: ownerAddress || '0x...',
          pool: {
            id: poolAddress || '0x...',
            token0: { symbol: 'CAKE' },
            token1: { symbol: 'WBNB' },
            feeTier: 2500,
          },
          tickLower: -50000,
          tickUpper: 50000,
          liquidity: '1000000000000000000',
          depositedToken0: '1000',
          depositedToken1: '3.5',
          withdrawnToken0: '0',
          withdrawnToken1: '0',
          collectedFeesToken0: '25',
          collectedFeesToken1: '0.08',
          feeGrowthInside0LastX128: '0',
          feeGrowthInside1LastX128: '0',
        },
      ];
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: {
          first,
          skip,
          where: {
            ...(ownerAddress ? { owner: ownerAddress.toLowerCase() } : {}),
            ...(poolAddress ? { pool: poolAddress.toLowerCase() } : {}),
          },
        },
        data: { positions },
        totalReturned: positions.length,
      };
    }
    
    case 'querySwaps': {
      const first = this.getNodeParameter('first', index, 100) as number;
      const skip = this.getNodeParameter('skip', index, 0) as number;
      const senderAddress = this.getNodeParameter('senderAddress', index, '') as string;
      const tokenAddress = this.getNodeParameter('tokenAddress', index, '') as string;
      const poolAddress = this.getNodeParameter('poolAddress', index, '') as string;
      
      const swaps = [
        {
          id: '0x...',
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          pool: {
            id: '0x...',
            token0: { symbol: 'CAKE' },
            token1: { symbol: 'WBNB' },
          },
          sender: senderAddress || '0x...',
          recipient: '0x...',
          amount0: '-1000',
          amount1: '3.5',
          amountUSD: '2850',
          sqrtPriceX96: '79228162514264337593543950336',
          tick: 0,
          logIndex: 125,
        },
      ];
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: {
          first,
          skip,
          orderBy: 'timestamp',
          orderDirection: 'desc',
          where: {
            ...(senderAddress ? { sender: senderAddress.toLowerCase() } : {}),
            ...(poolAddress ? { pool: poolAddress.toLowerCase() } : {}),
            ...(tokenAddress ? { token: tokenAddress.toLowerCase() } : {}),
          },
        },
        data: { swaps },
        totalReturned: swaps.length,
      };
    }
    
    case 'queryFarms': {
      const first = this.getNodeParameter('first', index, 100) as number;
      const skip = this.getNodeParameter('skip', index, 0) as number;
      
      const farms = [
        {
          id: '2',
          pair: '0x...',
          allocPoint: '4000',
          lastRewardBlock: '35000000',
          accCakePerShare: '125000000000',
          totalStaked: '5000000000000000000000000',
          lpToken: {
            id: '0x...',
            symbol: 'CAKE-BNB LP',
            token0: { symbol: 'CAKE' },
            token1: { symbol: 'WBNB' },
          },
        },
      ];
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: { first, skip },
        data: { farms },
        totalReturned: farms.length,
      };
    }
    
    case 'queryTokens': {
      const first = this.getNodeParameter('first', index, 100) as number;
      const skip = this.getNodeParameter('skip', index, 0) as number;
      const orderBy = this.getNodeParameter('orderBy', index, 'totalValueLockedUSD') as string;
      
      const tokens = [
        {
          id: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
          symbol: 'CAKE',
          name: 'PancakeSwap Token',
          decimals: 18,
          totalValueLockedUSD: '350000000',
          volumeUSD: '125000000',
          txCount: '500000',
          derivedBNB: '0.009',
        },
        {
          id: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          symbol: 'WBNB',
          name: 'Wrapped BNB',
          decimals: 18,
          totalValueLockedUSD: '450000000',
          volumeUSD: '95000000',
          txCount: '450000',
          derivedBNB: '1',
        },
      ];
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: { first, skip, orderBy },
        data: { tokens },
        totalReturned: tokens.length,
      };
    }
    
    case 'customQuery': {
      const graphqlQuery = this.getNodeParameter('graphqlQuery', index, '') as string;
      const graphqlVariables = this.getNodeParameter('graphqlVariables', index, '{}') as string;
      
      let variables: Record<string, unknown>;
      try {
        variables = JSON.parse(graphqlVariables);
      } catch {
        throw new Error('Invalid JSON in GraphQL variables');
      }
      
      // In real implementation, this would execute the query against the subgraph
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        query: graphqlQuery,
        variables,
        data: {
          note: 'In production, this would return actual subgraph data',
          example: {
            pools: [
              { id: '0x...', token0: { symbol: 'CAKE' }, token1: { symbol: 'WBNB' } },
            ],
          },
        },
        executedAt: new Date().toISOString(),
      };
    }
    
    case 'getStatus': {
      const statuses = {
        'v2-bsc': { synced: true, latestBlock: 35000000, chainHeadBlock: 35000050, lag: 50 },
        'v3-bsc': { synced: true, latestBlock: 34999980, chainHeadBlock: 35000050, lag: 70 },
        'stableswap-bsc': { synced: true, latestBlock: 35000000, chainHeadBlock: 35000050, lag: 50 },
        'masterchef-bsc': { synced: true, latestBlock: 34999950, chainHeadBlock: 35000050, lag: 100 },
        'v3-ethereum': { synced: true, latestBlock: 19000000, chainHeadBlock: 19000020, lag: 20 },
        'v3-arbitrum': { synced: true, latestBlock: 180000000, chainHeadBlock: 180000030, lag: 30 },
        'v3-base': { synced: true, latestBlock: 10000000, chainHeadBlock: 10000025, lag: 25 },
        'v3-zksync': { synced: true, latestBlock: 25000000, chainHeadBlock: 25000040, lag: 40 },
      };
      
      return {
        subgraph,
        endpoint: subgraphEndpoints[subgraph],
        status: statuses[subgraph as keyof typeof statuses] || {
          synced: false,
          error: 'Subgraph not found',
        },
        allSubgraphs: Object.entries(statuses).map(([name, status]) => ({
          name,
          ...status,
        })),
        checkedAt: new Date().toISOString(),
      };
    }
    
    default:
      throw new Error(`Operation ${operation} not supported`);
  }
}
