/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * PancakeSwap Network Credentials
 * 
 * Supports multiple blockchain networks where PancakeSwap is deployed:
 * - BNB Chain (BSC) - Primary network
 * - Ethereum Mainnet
 * - Arbitrum One
 * - Base
 * - zkSync Era
 * - Linea
 * - Polygon zkEVM
 * - opBNB
 */
export class PancakeSwapNetwork implements ICredentialType {
  name = 'pancakeSwapNetwork';
  displayName = 'PancakeSwap Network';
  documentationUrl = 'https://docs.pancakeswap.finance/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'bsc',
      description: 'Select the blockchain network to connect to',
      options: [
        {
          name: 'BNB Chain (BSC)',
          value: 'bsc',
          description: 'Binance Smart Chain - Primary PancakeSwap network',
        },
        {
          name: 'Ethereum Mainnet',
          value: 'ethereum',
          description: 'Ethereum Mainnet',
        },
        {
          name: 'Arbitrum One',
          value: 'arbitrum',
          description: 'Arbitrum Layer 2 network',
        },
        {
          name: 'Base',
          value: 'base',
          description: 'Base Layer 2 network by Coinbase',
        },
        {
          name: 'zkSync Era',
          value: 'zksync',
          description: 'zkSync Era Layer 2 network',
        },
        {
          name: 'Linea',
          value: 'linea',
          description: 'Linea Layer 2 network by ConsenSys',
        },
        {
          name: 'Polygon zkEVM',
          value: 'polygonZkEvm',
          description: 'Polygon zkEVM Layer 2 network',
        },
        {
          name: 'opBNB',
          value: 'opbnb',
          description: 'opBNB Layer 2 network',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom RPC endpoint',
        },
      ],
    },
    {
      displayName: 'RPC Endpoint URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://bsc-dataseed1.binance.org/',
      description: 'Custom RPC endpoint URL. Leave empty to use default public endpoints.',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 56,
      description: 'Chain ID for the custom network',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Private key for signing transactions. Required for write operations (swaps, liquidity, staking).',
      hint: 'Never share your private key. It provides full control over your wallet.',
    },
    {
      displayName: 'Custom RPC URL Override',
      name: 'customRpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://your-rpc-provider.com/',
      description: 'Override the default RPC URL for the selected network. Useful for premium RPC providers.',
      displayOptions: {
        hide: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Subgraph Endpoint',
      name: 'subgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.thegraph.com/subgraphs/name/pancakeswap/...',
      description: 'Custom subgraph endpoint for analytics queries',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.customRpcUrl || "https://bsc-dataseed1.binance.org/"}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    },
  };
}
