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
 * PancakeSwap API Credentials
 * 
 * Configuration for accessing PancakeSwap APIs and Subgraph endpoints:
 * - REST API endpoints
 * - V2 Subgraph (legacy pools)
 * - V3 Subgraph (concentrated liquidity pools)
 * - StableSwap Subgraph
 */
export class PancakeSwapApi implements ICredentialType {
  name = 'pancakeSwapApi';
  displayName = 'PancakeSwap API';
  documentationUrl = 'https://docs.pancakeswap.finance/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'bsc',
      description: 'Select the network for API endpoints',
      options: [
        {
          name: 'BNB Chain (BSC)',
          value: 'bsc',
        },
        {
          name: 'Ethereum Mainnet',
          value: 'ethereum',
        },
        {
          name: 'Arbitrum One',
          value: 'arbitrum',
        },
        {
          name: 'Base',
          value: 'base',
        },
        {
          name: 'zkSync Era',
          value: 'zksync',
        },
        {
          name: 'Linea',
          value: 'linea',
        },
        {
          name: 'Polygon zkEVM',
          value: 'polygonZkEvm',
        },
        {
          name: 'opBNB',
          value: 'opbnb',
        },
      ],
    },
    {
      displayName: 'API Base URL',
      name: 'apiBaseUrl',
      type: 'string',
      default: 'https://pancakeswap.finance/api',
      description: 'Base URL for PancakeSwap REST API',
    },
    {
      displayName: 'V2 Subgraph URL',
      name: 'subgraphV2Url',
      type: 'string',
      default: '',
      placeholder: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v2',
      description: 'Subgraph endpoint for V2 (legacy) pool data',
    },
    {
      displayName: 'V3 Subgraph URL',
      name: 'subgraphV3Url',
      type: 'string',
      default: '',
      placeholder: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc',
      description: 'Subgraph endpoint for V3 (concentrated liquidity) pool data',
    },
    {
      displayName: 'StableSwap Subgraph URL',
      name: 'subgraphStableUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.thegraph.com/subgraphs/name/pancakeswap/stableswap',
      description: 'Subgraph endpoint for StableSwap pool data',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for rate-limited or premium API access (if applicable)',
    },
    {
      displayName: 'Graph API Key',
      name: 'graphApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The Graph API key for subgraph queries (for decentralized network)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiBaseUrl || "https://pancakeswap.finance/api"}}',
      url: '/v1/tokens/prices',
      method: 'GET',
    },
  };
}
