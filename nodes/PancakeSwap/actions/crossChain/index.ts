/**
 * PancakeSwap Cross-Chain Resource
 * Cross-chain bridging operations
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';

export const crossChainOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['crossChain'],
      },
    },
    options: [
      {
        name: 'Get Bridge Quote',
        value: 'getBridgeQuote',
        description: 'Get quote for bridging tokens',
        action: 'Get bridge quote',
      },
      {
        name: 'Bridge Tokens',
        value: 'bridgeTokens',
        description: 'Bridge tokens to another chain',
        action: 'Bridge tokens',
      },
      {
        name: 'Get Bridge Status',
        value: 'getBridgeStatus',
        description: 'Check status of a bridge transaction',
        action: 'Get bridge status',
      },
      {
        name: 'Get Supported Chains',
        value: 'getSupportedChains',
        description: 'Get list of supported chains for bridging',
        action: 'Get supported chains',
      },
      {
        name: 'Get Supported Tokens',
        value: 'getSupportedTokens',
        description: 'Get tokens supported for bridging between chains',
        action: 'Get supported tokens',
      },
      {
        name: 'Get Bridge Fee',
        value: 'getBridgeFee',
        description: 'Get bridging fees for a route',
        action: 'Get bridge fee',
      },
    ],
    default: 'getBridgeQuote',
  },
];

export const crossChainFields: INodeProperties[] = [
  // Source chain
  {
    displayName: 'Source Chain',
    name: 'sourceChain',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['getBridgeQuote', 'bridgeTokens', 'getSupportedTokens', 'getBridgeFee'],
      },
    },
    options: [
      { name: 'BNB Chain', value: 'bsc' },
      { name: 'Ethereum', value: 'ethereum' },
      { name: 'Arbitrum', value: 'arbitrum' },
      { name: 'Base', value: 'base' },
      { name: 'zkSync Era', value: 'zksync' },
      { name: 'Linea', value: 'linea' },
      { name: 'Polygon zkEVM', value: 'polygonZkEvm' },
      { name: 'opBNB', value: 'opbnb' },
    ],
    default: 'bsc',
    description: 'Source blockchain network',
  },
  // Destination chain
  {
    displayName: 'Destination Chain',
    name: 'destinationChain',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['getBridgeQuote', 'bridgeTokens', 'getSupportedTokens', 'getBridgeFee'],
      },
    },
    options: [
      { name: 'BNB Chain', value: 'bsc' },
      { name: 'Ethereum', value: 'ethereum' },
      { name: 'Arbitrum', value: 'arbitrum' },
      { name: 'Base', value: 'base' },
      { name: 'zkSync Era', value: 'zksync' },
      { name: 'Linea', value: 'linea' },
      { name: 'Polygon zkEVM', value: 'polygonZkEvm' },
      { name: 'opBNB', value: 'opbnb' },
    ],
    default: 'ethereum',
    description: 'Destination blockchain network',
  },
  // Token address
  {
    displayName: 'Token',
    name: 'token',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['getBridgeQuote', 'bridgeTokens', 'getBridgeFee'],
      },
    },
    default: 'CAKE',
    placeholder: 'CAKE or 0x...',
    description: 'Token symbol or address to bridge',
  },
  // Amount
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['getBridgeQuote', 'bridgeTokens'],
      },
    },
    default: 100,
    description: 'Amount of tokens to bridge',
  },
  // Recipient address
  {
    displayName: 'Recipient Address',
    name: 'recipientAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['bridgeTokens'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Recipient address on destination chain (leave empty for same address)',
  },
  // Slippage
  {
    displayName: 'Slippage Tolerance (%)',
    name: 'slippage',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['bridgeTokens'],
      },
    },
    default: 0.5,
    typeOptions: {
      minValue: 0.01,
      maxValue: 5,
    },
    description: 'Maximum acceptable slippage percentage',
  },
  // Bridge transaction ID
  {
    displayName: 'Transaction ID',
    name: 'transactionId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['crossChain'],
        operation: ['getBridgeStatus'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Bridge transaction hash or ID',
  },
];

/**
 * Execute cross-chain operations
 * PancakeSwap supports cross-chain bridging through various providers:
 * - Native bridge for CAKE between BSC and other chains
 * - Integration with LayerZero/Stargate for wider asset support
 * - Bridge fees vary by route and token
 */
export async function executeCrossChain(
  this: IExecuteFunctions,
  index: number,
  operation: string,
): Promise<IDataObject> {
  const chainNames: Record<string, string> = {
    bsc: 'BNB Chain',
    ethereum: 'Ethereum',
    arbitrum: 'Arbitrum One',
    base: 'Base',
    zksync: 'zkSync Era',
    linea: 'Linea',
    polygonZkEvm: 'Polygon zkEVM',
    opbnb: 'opBNB',
  };
  
  const chainIds: Record<string, number> = {
    bsc: 56,
    ethereum: 1,
    arbitrum: 42161,
    base: 8453,
    zksync: 324,
    linea: 59144,
    polygonZkEvm: 1101,
    opbnb: 204,
  };
  
  switch (operation) {
    case 'getBridgeQuote': {
      const sourceChain = this.getNodeParameter('sourceChain', index, 'bsc') as string;
      const destinationChain = this.getNodeParameter('destinationChain', index, 'ethereum') as string;
      const token = this.getNodeParameter('token', index, 'CAKE') as string;
      const amount = this.getNodeParameter('amount', index, 100) as number;
      
      if (sourceChain === destinationChain) {
        throw new Error('Source and destination chains must be different');
      }
      
      // Simulated bridge quote
      const bridgeFee = amount * 0.001; // 0.1%
      const gasFee = 0.5; // In source chain native token
      const estimatedTime = sourceChain === 'bsc' || destinationChain === 'bsc' ? 15 : 30;
      
      return {
        quote: {
          sourceChain: chainNames[sourceChain],
          destinationChain: chainNames[destinationChain],
          token,
          inputAmount: amount,
          outputAmount: amount - bridgeFee,
          bridgeFee,
          bridgeFeePercentage: 0.1,
          gasFee,
          gasFeeToken: sourceChain === 'bsc' ? 'BNB' : 'ETH',
          estimatedTime: `${estimatedTime} minutes`,
          exchangeRate: 1,
        },
        route: {
          provider: 'PancakeSwap Bridge',
          protocol: 'LayerZero',
          path: [sourceChain, destinationChain],
        },
        limits: {
          minAmount: 1,
          maxAmount: 100000,
          dailyLimit: 1000000,
        },
        validUntil: new Date(Date.now() + 300000).toISOString(),
        quoteId: `quote_${Date.now()}`,
      };
    }
    
    case 'bridgeTokens': {
      const sourceChain = this.getNodeParameter('sourceChain', index, 'bsc') as string;
      const destinationChain = this.getNodeParameter('destinationChain', index, 'ethereum') as string;
      const token = this.getNodeParameter('token', index, 'CAKE') as string;
      const amount = this.getNodeParameter('amount', index, 100) as number;
      const recipientAddress = this.getNodeParameter('recipientAddress', index, '') as string;
      const slippage = this.getNodeParameter('slippage', index, 0.5) as number;
      
      if (sourceChain === destinationChain) {
        throw new Error('Source and destination chains must be different');
      }
      
      const bridgeFee = amount * 0.001;
      const minReceived = (amount - bridgeFee) * (1 - slippage / 100);
      
      return {
        status: 'pending',
        bridge: {
          sourceChain: chainNames[sourceChain],
          sourceChainId: chainIds[sourceChain],
          destinationChain: chainNames[destinationChain],
          destinationChainId: chainIds[destinationChain],
          token,
          amount,
          minReceived: Math.round(minReceived * 100) / 100,
          recipient: recipientAddress || '0x...sender_address',
          slippage,
        },
        fees: {
          bridgeFee,
          estimatedGas: '0.005',
          gasToken: sourceChain === 'bsc' ? 'BNB' : 'ETH',
        },
        estimatedTime: '15-30 minutes',
        steps: [
          'Approve token (if not already approved)',
          'Initiate bridge transaction',
          'Wait for source chain confirmation',
          'Wait for destination chain relay',
          'Receive tokens on destination',
        ],
        note: 'Bridge transactions are irreversible. Double-check recipient address.',
      };
    }
    
    case 'getBridgeStatus': {
      const transactionId = this.getNodeParameter('transactionId', index, '') as string;
      
      // Simulated status check
      const statuses = ['pending', 'confirming', 'relaying', 'completed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * 4)]; // Mostly not failed
      
      return {
        transactionId,
        status: randomStatus,
        statusDetails: {
          pending: 'Transaction submitted, awaiting confirmation',
          confirming: 'Confirming on source chain',
          relaying: 'Relaying to destination chain',
          completed: 'Successfully bridged',
          failed: 'Bridge transaction failed',
        }[randomStatus],
        sourceChain: {
          name: 'BNB Chain',
          txHash: transactionId,
          confirmations: randomStatus === 'pending' ? 0 : 15,
          requiredConfirmations: 15,
          confirmed: randomStatus !== 'pending',
        },
        destinationChain: {
          name: 'Ethereum',
          txHash: randomStatus === 'completed' ? '0x...dest_tx' : null,
          confirmed: randomStatus === 'completed',
        },
        token: 'CAKE',
        amount: 100,
        receivedAmount: randomStatus === 'completed' ? 99.9 : null,
        initiatedAt: new Date(Date.now() - 600000).toISOString(),
        completedAt: randomStatus === 'completed' ? new Date().toISOString() : null,
        estimatedCompletion: randomStatus !== 'completed' 
          ? new Date(Date.now() + 900000).toISOString() 
          : null,
      };
    }
    
    case 'getSupportedChains': {
      return {
        chains: [
          {
            id: 'bsc',
            name: 'BNB Chain',
            chainId: 56,
            nativeCurrency: 'BNB',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '10-15 min',
          },
          {
            id: 'ethereum',
            name: 'Ethereum',
            chainId: 1,
            nativeCurrency: 'ETH',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '15-20 min',
          },
          {
            id: 'arbitrum',
            name: 'Arbitrum One',
            chainId: 42161,
            nativeCurrency: 'ETH',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '10-15 min',
          },
          {
            id: 'base',
            name: 'Base',
            chainId: 8453,
            nativeCurrency: 'ETH',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '10-15 min',
          },
          {
            id: 'zksync',
            name: 'zkSync Era',
            chainId: 324,
            nativeCurrency: 'ETH',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '15-30 min',
          },
          {
            id: 'linea',
            name: 'Linea',
            chainId: 59144,
            nativeCurrency: 'ETH',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '15-20 min',
          },
          {
            id: 'polygonZkEvm',
            name: 'Polygon zkEVM',
            chainId: 1101,
            nativeCurrency: 'ETH',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '15-30 min',
          },
          {
            id: 'opbnb',
            name: 'opBNB',
            chainId: 204,
            nativeCurrency: 'BNB',
            bridgeContract: '0x...',
            enabled: true,
            avgBridgeTime: '5-10 min',
          },
        ],
        totalChains: 8,
        note: 'Bridge availability may vary by token',
      };
    }
    
    case 'getSupportedTokens': {
      const sourceChain = this.getNodeParameter('sourceChain', index, 'bsc') as string;
      const destinationChain = this.getNodeParameter('destinationChain', index, 'ethereum') as string;
      
      const tokens = [
        {
          symbol: 'CAKE',
          name: 'PancakeSwap Token',
          sourceAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
          destinationAddress: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898',
          minAmount: 1,
          maxAmount: 100000,
          bridgeFee: '0.1%',
          supported: true,
        },
        {
          symbol: 'USDT',
          name: 'Tether USD',
          sourceAddress: sourceChain === 'bsc' 
            ? '0x55d398326f99059fF775485246999027B3197955'
            : '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          destinationAddress: destinationChain === 'bsc'
            ? '0x55d398326f99059fF775485246999027B3197955'
            : '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          minAmount: 10,
          maxAmount: 1000000,
          bridgeFee: '0.05%',
          supported: true,
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          minAmount: 10,
          maxAmount: 1000000,
          bridgeFee: '0.05%',
          supported: true,
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          minAmount: 0.01,
          maxAmount: 1000,
          bridgeFee: '0.1%',
          supported: true,
        },
        {
          symbol: 'BNB',
          name: 'BNB',
          minAmount: 0.1,
          maxAmount: 10000,
          bridgeFee: '0.1%',
          supported: true,
        },
      ];
      
      return {
        sourceChain: chainNames[sourceChain],
        destinationChain: chainNames[destinationChain],
        tokens,
        totalTokens: tokens.length,
        note: 'Token addresses vary by chain. Always verify before bridging.',
      };
    }
    
    case 'getBridgeFee': {
      const sourceChain = this.getNodeParameter('sourceChain', index, 'bsc') as string;
      const destinationChain = this.getNodeParameter('destinationChain', index, 'ethereum') as string;
      const token = this.getNodeParameter('token', index, 'CAKE') as string;
      
      const baseFee = token === 'CAKE' ? 0.1 : 0.05;
      const gasEstimate = sourceChain === 'ethereum' || destinationChain === 'ethereum' ? 0.01 : 0.002;
      
      return {
        route: {
          sourceChain: chainNames[sourceChain],
          destinationChain: chainNames[destinationChain],
          token,
        },
        fees: {
          bridgeFeePercentage: baseFee,
          bridgeFeeMin: token === 'CAKE' ? 0.1 : 0.01,
          bridgeFeeMax: token === 'CAKE' ? 100 : 1000,
          estimatedGasFee: gasEstimate,
          gasFeeToken: sourceChain === 'bsc' || sourceChain === 'opbnb' ? 'BNB' : 'ETH',
          relayerFee: 0.5,
          relayerFeeToken: 'USD',
        },
        example: {
          amount: 1000,
          bridgeFee: 1000 * (baseFee / 100),
          gasFee: gasEstimate,
          totalFees: 1000 * (baseFee / 100) + gasEstimate + 0.5,
          receiveAmount: 1000 - 1000 * (baseFee / 100),
        },
        note: 'Gas fees fluctuate based on network congestion',
      };
    }
    
    default:
      throw new Error(`Operation ${operation} not supported`);
  }
}
