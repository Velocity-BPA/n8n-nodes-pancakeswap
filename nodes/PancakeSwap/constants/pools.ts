/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Pool configurations for PancakeSwap
 * 
 * Syrup Pools allow users to stake CAKE to earn various tokens.
 * StableSwap pools are optimized for trading stable assets with minimal slippage.
 */

export interface SyrupPool {
  sousId: number;
  stakingToken: string;
  earningToken: string;
  earningTokenSymbol: string;
  contractAddress: string;
  isFinished: boolean;
  enableEmergencyWithdraw?: boolean;
}

/**
 * Example Syrup Pool configurations (BSC)
 * These are dynamic and should be queried from the chain
 */
export const BSC_SYRUP_POOLS: SyrupPool[] = [
  {
    sousId: 0,
    stakingToken: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
    earningToken: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
    earningTokenSymbol: 'CAKE',
    contractAddress: '0x45c54210128a065de780C4B0Df3d16664f7f859e',
    isFinished: false,
  },
];

/**
 * StableSwap pool configuration
 */
export interface StableSwapPool {
  name: string;
  address: string;
  lpToken: string;
  coins: string[];
  coinSymbols: string[];
  coinDecimals: number[];
  A: number; // Amplification coefficient
}

/**
 * BSC StableSwap pools
 */
export const BSC_STABLESWAP_POOLS: StableSwapPool[] = [
  {
    name: 'USDT-BUSD',
    address: '0x169F653A54ACD441aB34B73da9946e2C451787EF',
    lpToken: '0x36842F8fb99D55477C0Da638aF5ceb6bBf86aA98',
    coins: [
      '0x55d398326f99059fF775485246999027B3197955', // USDT
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
    ],
    coinSymbols: ['USDT', 'BUSD'],
    coinDecimals: [18, 18],
    A: 1000,
  },
  {
    name: 'USDC-BUSD',
    address: '0x3EFeB0685F9e8bB548bae8dEF3ccC5B6F6E3AB4F',
    lpToken: '0x9E7B1D5A18AE9d29c19a0F1b671D49f0C7e66F6E',
    coins: [
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
    ],
    coinSymbols: ['USDC', 'BUSD'],
    coinDecimals: [18, 18],
    A: 1000,
  },
  {
    name: 'USDT-USDC',
    address: '0x3F1c75cE8dDF5FD7d86b99F9D2AF5d5d5Ea0BBfA',
    lpToken: '0xD65016E36D8eCD41e2dFC0E9F8B1fFb6F5F9F59a',
    coins: [
      '0x55d398326f99059fF775485246999027B3197955', // USDT
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    ],
    coinSymbols: ['USDT', 'USDC'],
    coinDecimals: [18, 18],
    A: 1000,
  },
];

/**
 * Pool types enumeration
 */
export enum PoolType {
  V2 = 'v2',
  V3 = 'v3',
  STABLESWAP = 'stableSwap',
  SYRUP = 'syrup',
}

/**
 * V3 Pool state interface
 */
export interface V3PoolState {
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

/**
 * V3 Position interface
 */
export interface V3Position {
  tokenId: bigint;
  nonce: bigint;
  operator: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

/**
 * Get StableSwap pool by name
 */
export function getStableSwapPoolByName(
  pools: StableSwapPool[],
  name: string,
): StableSwapPool | undefined {
  return pools.find((pool) => pool.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get StableSwap pool by address
 */
export function getStableSwapPoolByAddress(
  pools: StableSwapPool[],
  address: string,
): StableSwapPool | undefined {
  const normalizedAddress = address.toLowerCase();
  return pools.find((pool) => pool.address.toLowerCase() === normalizedAddress);
}

/**
 * Get Syrup pool by sousId
 */
export function getSyrupPoolBySousId(
  pools: SyrupPool[],
  sousId: number,
): SyrupPool | undefined {
  return pools.find((pool) => pool.sousId === sousId);
}
