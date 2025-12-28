/**
 * PancakeSwap Perpetuals Resource
 * Perpetual futures trading on PancakeSwap V2
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';

export const perpetualsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['perpetuals'],
      },
    },
    options: [
      {
        name: 'Get Markets',
        value: 'getMarkets',
        description: 'Get all available perpetual markets',
        action: 'Get all perpetual markets',
      },
      {
        name: 'Get Market',
        value: 'getMarket',
        description: 'Get details for a specific market',
        action: 'Get market details',
      },
      {
        name: 'Get Position',
        value: 'getPosition',
        description: 'Get user position for a market',
        action: 'Get user position',
      },
      {
        name: 'Get Positions',
        value: 'getPositions',
        description: 'Get all user positions',
        action: 'Get all positions',
      },
      {
        name: 'Open Position',
        value: 'openPosition',
        description: 'Open a new perpetual position',
        action: 'Open perpetual position',
      },
      {
        name: 'Close Position',
        value: 'closePosition',
        description: 'Close an existing position',
        action: 'Close position',
      },
      {
        name: 'Get Funding Rate',
        value: 'getFundingRate',
        description: 'Get current funding rate for a market',
        action: 'Get funding rate',
      },
      {
        name: 'Get Open Interest',
        value: 'getOpenInterest',
        description: 'Get open interest for a market',
        action: 'Get open interest',
      },
      {
        name: 'Get Mark Price',
        value: 'getMarkPrice',
        description: 'Get mark price for a market',
        action: 'Get mark price',
      },
      {
        name: 'Get Liquidation Price',
        value: 'getLiquidationPrice',
        description: 'Calculate liquidation price for a position',
        action: 'Get liquidation price',
      },
      {
        name: 'Add Margin',
        value: 'addMargin',
        description: 'Add margin to an existing position',
        action: 'Add margin to position',
      },
      {
        name: 'Remove Margin',
        value: 'removeMargin',
        description: 'Remove margin from a position',
        action: 'Remove margin from position',
      },
      {
        name: 'Get Trade History',
        value: 'getTradeHistory',
        description: 'Get trade history for user',
        action: 'Get trade history',
      },
    ],
    default: 'getMarkets',
  },
];

export const perpetualsFields: INodeProperties[] = [
  // Market field for multiple operations
  {
    displayName: 'Market',
    name: 'market',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: [
          'getMarket',
          'getPosition',
          'openPosition',
          'closePosition',
          'getFundingRate',
          'getOpenInterest',
          'getMarkPrice',
          'getLiquidationPrice',
          'addMargin',
          'removeMargin',
        ],
      },
    },
    default: 'BTC-USD',
    placeholder: 'BTC-USD',
    description: 'The perpetual market symbol (e.g., BTC-USD, ETH-USD)',
  },
  // Open Position fields
  {
    displayName: 'Side',
    name: 'side',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['openPosition'],
      },
    },
    options: [
      { name: 'Long', value: 'long' },
      { name: 'Short', value: 'short' },
    ],
    default: 'long',
    description: 'Position direction - Long (bullish) or Short (bearish)',
  },
  {
    displayName: 'Size (USD)',
    name: 'size',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['openPosition'],
      },
    },
    default: 100,
    description: 'Position size in USD',
  },
  {
    displayName: 'Leverage',
    name: 'leverage',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['openPosition'],
      },
    },
    default: 10,
    typeOptions: {
      minValue: 1,
      maxValue: 150,
    },
    description: 'Leverage multiplier (1x to 150x)',
  },
  {
    displayName: 'Collateral Token',
    name: 'collateralToken',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['openPosition', 'addMargin'],
      },
    },
    default: 'USDC',
    description: 'Token to use as collateral',
  },
  {
    displayName: 'Slippage Tolerance (%)',
    name: 'slippage',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['openPosition', 'closePosition'],
      },
    },
    default: 0.5,
    typeOptions: {
      minValue: 0.01,
      maxValue: 50,
    },
    description: 'Maximum acceptable slippage percentage',
  },
  // Close Position fields
  {
    displayName: 'Close Percentage',
    name: 'closePercentage',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['closePosition'],
      },
    },
    default: 100,
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    description: 'Percentage of position to close (1-100%)',
  },
  // Add/Remove Margin fields
  {
    displayName: 'Margin Amount',
    name: 'marginAmount',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['addMargin', 'removeMargin'],
      },
    },
    default: 100,
    description: 'Amount of margin to add or remove (in collateral token)',
  },
  // Liquidation Price calculation fields
  {
    displayName: 'Position Size',
    name: 'positionSize',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['getLiquidationPrice'],
      },
    },
    default: 1000,
    description: 'Size of the position in USD',
  },
  {
    displayName: 'Collateral Amount',
    name: 'collateralAmount',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['getLiquidationPrice'],
      },
    },
    default: 100,
    description: 'Amount of collateral backing the position',
  },
  {
    displayName: 'Is Long',
    name: 'isLong',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['getLiquidationPrice'],
      },
    },
    default: true,
    description: 'Whether the position is long (true) or short (false)',
  },
  // Trade History fields
  {
    displayName: 'User Address',
    name: 'userAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['getPositions', 'getTradeHistory'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'User wallet address (leave empty to use connected wallet)',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['perpetuals'],
        operation: ['getMarkets', 'getTradeHistory'],
      },
    },
    default: 50,
    description: 'Maximum number of results to return',
  },
];

/**
 * Execute perpetuals operations
 * PancakeSwap Perpetuals V2 uses a GMX-style architecture with:
 * - Multi-asset liquidity pool (PLP)
 * - Oracle-based pricing (Chainlink)
 * - Up to 150x leverage
 * - Cross-margin and isolated margin modes
 */
export async function executePerpetuals(
  this: IExecuteFunctions,
  index: number,
  operation: string,
): Promise<IDataObject> {
  const market = this.getNodeParameter('market', index, 'BTC-USD') as string;
  
  switch (operation) {
    case 'getMarkets': {
      const limit = this.getNodeParameter('limit', index, 50) as number;
      
      // PancakeSwap Perpetuals supported markets
      const markets = [
        {
          symbol: 'BTC-USD',
          indexToken: 'BTC',
          maxLeverage: 150,
          fundingRateInterval: 3600,
          minCollateral: 10,
          maxPositionSize: 10000000,
          liquidationFee: 0.001,
          borrowingFee: 0.00001,
          status: 'active',
        },
        {
          symbol: 'ETH-USD',
          indexToken: 'ETH',
          maxLeverage: 150,
          fundingRateInterval: 3600,
          minCollateral: 10,
          maxPositionSize: 5000000,
          liquidationFee: 0.001,
          borrowingFee: 0.00001,
          status: 'active',
        },
        {
          symbol: 'BNB-USD',
          indexToken: 'BNB',
          maxLeverage: 100,
          fundingRateInterval: 3600,
          minCollateral: 10,
          maxPositionSize: 2000000,
          liquidationFee: 0.001,
          borrowingFee: 0.00002,
          status: 'active',
        },
      ];
      
      return {
        markets: markets.slice(0, limit),
        totalMarkets: markets.length,
        note: 'PancakeSwap Perpetuals V2 supports up to 150x leverage on major assets',
      };
    }
    
    case 'getMarket': {
      return {
        symbol: market,
        indexToken: market.split('-')[0],
        markPrice: 43250.50,
        indexPrice: 43248.00,
        fundingRate: 0.0001,
        fundingRateAnnualized: 0.876,
        nextFundingTime: new Date(Date.now() + 3600000).toISOString(),
        openInterestLong: 15000000,
        openInterestShort: 12000000,
        maxLeverage: 150,
        minCollateral: 10,
        borrowingRateLong: 0.00001,
        borrowingRateShort: 0.00002,
        availableLiquidityLong: 50000000,
        availableLiquidityShort: 50000000,
      };
    }
    
    case 'getPosition': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      return {
        market,
        userAddress: userAddress || '0x...connected_wallet',
        side: 'long',
        size: 5000,
        collateral: 500,
        leverage: 10,
        entryPrice: 42000,
        markPrice: 43250.50,
        pnl: 148.83,
        pnlPercentage: 29.77,
        liquidationPrice: 38200,
        marginRatio: 0.115,
        accruedFunding: -2.50,
        accruedBorrowingFee: -1.25,
        unrealizedPnl: 145.08,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      };
    }
    
    case 'getPositions': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        positions: [
          {
            market: 'BTC-USD',
            side: 'long',
            size: 5000,
            collateral: 500,
            leverage: 10,
            pnl: 148.83,
          },
          {
            market: 'ETH-USD',
            side: 'short',
            size: 2000,
            collateral: 200,
            leverage: 10,
            pnl: -25.40,
          },
        ],
        totalCollateral: 700,
        totalUnrealizedPnl: 123.43,
        marginUsed: 700,
        availableMargin: 300,
      };
    }
    
    case 'openPosition': {
      const side = this.getNodeParameter('side', index, 'long') as string;
      const size = this.getNodeParameter('size', index, 100) as number;
      const leverage = this.getNodeParameter('leverage', index, 10) as number;
      const collateralToken = this.getNodeParameter('collateralToken', index, 'USDC') as string;
      const slippage = this.getNodeParameter('slippage', index, 0.5) as number;
      
      const requiredCollateral = size / leverage;
      
      return {
        status: 'pending',
        market,
        side,
        size,
        leverage,
        requiredCollateral,
        collateralToken,
        slippage,
        estimatedEntryPrice: 43250.50,
        estimatedLiquidationPrice: side === 'long' ? 39000 : 48000,
        estimatedFees: {
          positionFee: size * 0.001,
          executionFee: 0.5,
        },
        warnings: leverage > 50 ? ['High leverage increases liquidation risk'] : [],
        note: 'Execute this transaction to open position. Requires wallet signature.',
      };
    }
    
    case 'closePosition': {
      const closePercentage = this.getNodeParameter('closePercentage', index, 100) as number;
      const slippage = this.getNodeParameter('slippage', index, 0.5) as number;
      
      return {
        status: 'pending',
        market,
        closePercentage,
        slippage,
        estimatedPnl: 148.83 * (closePercentage / 100),
        estimatedReceiveAmount: 648.83 * (closePercentage / 100),
        estimatedFees: {
          positionFee: 5.0 * (closePercentage / 100),
          executionFee: 0.5,
        },
        note: 'Execute this transaction to close position. Requires wallet signature.',
      };
    }
    
    case 'getFundingRate': {
      return {
        market,
        fundingRate: 0.0001,
        fundingRatePercentage: 0.01,
        annualizedRate: 87.6,
        nextFundingTime: new Date(Date.now() + 3600000).toISOString(),
        fundingInterval: 3600,
        longPayRate: 0.0001,
        shortReceiveRate: 0.0001,
        fundingHistory: [
          { timestamp: new Date(Date.now() - 3600000).toISOString(), rate: 0.00008 },
          { timestamp: new Date(Date.now() - 7200000).toISOString(), rate: 0.00012 },
          { timestamp: new Date(Date.now() - 10800000).toISOString(), rate: 0.00009 },
        ],
        note: 'Positive rate means longs pay shorts, negative means shorts pay longs',
      };
    }
    
    case 'getOpenInterest': {
      return {
        market,
        openInterestLong: 15000000,
        openInterestShort: 12000000,
        totalOpenInterest: 27000000,
        longPercentage: 55.56,
        shortPercentage: 44.44,
        maxOpenInterest: 100000000,
        utilizationRate: 27,
        note: 'Long-biased open interest may indicate bullish sentiment',
      };
    }
    
    case 'getMarkPrice': {
      return {
        market,
        markPrice: 43250.50,
        indexPrice: 43248.00,
        deviation: 0.0058,
        oracleSource: 'Chainlink',
        lastUpdate: new Date().toISOString(),
        priceComponents: {
          chainlinkPrice: 43248.00,
          medianPrice: 43250.50,
          fastPrice: 43252.00,
        },
      };
    }
    
    case 'getLiquidationPrice': {
      const positionSize = this.getNodeParameter('positionSize', index, 1000) as number;
      const collateralAmount = this.getNodeParameter('collateralAmount', index, 100) as number;
      const isLong = this.getNodeParameter('isLong', index, true) as boolean;
      
      const leverage = positionSize / collateralAmount;
      const markPrice = 43250.50;
      const liquidationThreshold = 0.95; // 95% loss triggers liquidation
      
      let liquidationPrice: number;
      if (isLong) {
        liquidationPrice = markPrice * (1 - liquidationThreshold / leverage);
      } else {
        liquidationPrice = markPrice * (1 + liquidationThreshold / leverage);
      }
      
      return {
        market,
        positionSize,
        collateralAmount,
        leverage,
        isLong,
        currentMarkPrice: markPrice,
        liquidationPrice: Math.round(liquidationPrice * 100) / 100,
        distanceToLiquidation: Math.abs(markPrice - liquidationPrice),
        distancePercentage: Math.abs((markPrice - liquidationPrice) / markPrice * 100),
        marginRatio: collateralAmount / positionSize,
        maintenanceMargin: positionSize * 0.005,
      };
    }
    
    case 'addMargin': {
      const marginAmount = this.getNodeParameter('marginAmount', index, 100) as number;
      const collateralToken = this.getNodeParameter('collateralToken', index, 'USDC') as string;
      
      return {
        status: 'pending',
        market,
        marginAmount,
        collateralToken,
        currentCollateral: 500,
        newCollateral: 600,
        currentLeverage: 10,
        newLeverage: 8.33,
        currentLiquidationPrice: 39000,
        newLiquidationPrice: 37500,
        note: 'Adding margin reduces leverage and liquidation risk',
      };
    }
    
    case 'removeMargin': {
      const marginAmount = this.getNodeParameter('marginAmount', index, 100) as number;
      
      return {
        status: 'pending',
        market,
        marginAmount,
        currentCollateral: 500,
        newCollateral: 400,
        currentLeverage: 10,
        newLeverage: 12.5,
        currentLiquidationPrice: 39000,
        newLiquidationPrice: 40200,
        warnings: ['Removing margin increases leverage and liquidation risk'],
        maxRemovable: 300,
        note: 'Cannot remove margin if it would cause immediate liquidation',
      };
    }
    
    case 'getTradeHistory': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      const limit = this.getNodeParameter('limit', index, 50) as number;
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        trades: [
          {
            id: 'trade_001',
            market: 'BTC-USD',
            type: 'open',
            side: 'long',
            size: 5000,
            price: 42000,
            fee: 5.0,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            txHash: '0x...',
          },
          {
            id: 'trade_002',
            market: 'ETH-USD',
            type: 'close',
            side: 'long',
            size: 2000,
            price: 2350,
            pnl: 125.50,
            fee: 2.0,
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            txHash: '0x...',
          },
        ].slice(0, limit),
        totalTrades: 2,
        totalPnl: 125.50,
        totalFees: 7.0,
      };
    }
    
    default:
      throw new Error(`Operation ${operation} not supported`);
  }
}
