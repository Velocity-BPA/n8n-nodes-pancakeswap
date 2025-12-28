/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Farm configurations for PancakeSwap
 * 
 * Farms allow users to stake LP tokens to earn CAKE rewards.
 * Each farm has a multiplier (weight) that determines the
 * proportion of CAKE rewards allocated to it.
 */

export interface Farm {
  pid: number;
  lpSymbol: string;
  lpAddress: string;
  token0: string;
  token1: string;
  quoteToken: string;
  multiplier?: string;
  isV3?: boolean;
  feeAmount?: number;
}

/**
 * Popular BSC farms (partial list - farms can be queried dynamically)
 */
export const BSC_FARMS: Farm[] = [
  {
    pid: 2,
    lpSymbol: 'CAKE-BNB LP',
    lpAddress: '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0',
    token0: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    quoteToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    multiplier: '40X',
  },
  {
    pid: 3,
    lpSymbol: 'BUSD-BNB LP',
    lpAddress: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    token0: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    quoteToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    multiplier: '12X',
  },
  {
    pid: 4,
    lpSymbol: 'USDT-BUSD LP',
    lpAddress: '0x7EFaEf62fDdCCa950418312c6C91Aef321375A00',
    token0: '0x55d398326f99059fF775485246999027B3197955',
    token1: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    quoteToken: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    multiplier: '5X',
  },
  {
    pid: 5,
    lpSymbol: 'ETH-BNB LP',
    lpAddress: '0x74E4716E431f45807DCF19f284c7aA99F18a4fbc',
    token0: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    quoteToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    multiplier: '10X',
  },
  {
    pid: 6,
    lpSymbol: 'BTCB-BNB LP',
    lpAddress: '0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082',
    token0: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    quoteToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    multiplier: '10X',
  },
];

/**
 * Farm categories
 */
export enum FarmCategory {
  CORE = 'core',
  COMMUNITY = 'community',
  BOOSTED = 'boosted',
}

/**
 * Get farm by PID
 */
export function getFarmByPid(farms: Farm[], pid: number): Farm | undefined {
  return farms.find((farm) => farm.pid === pid);
}

/**
 * Get farm by LP address
 */
export function getFarmByLpAddress(farms: Farm[], lpAddress: string): Farm | undefined {
  const normalizedAddress = lpAddress.toLowerCase();
  return farms.find((farm) => farm.lpAddress.toLowerCase() === normalizedAddress);
}

/**
 * MasterChef V3 farm configuration
 */
export interface FarmV3 {
  pid: number;
  token0: string;
  token1: string;
  feeAmount: number;
  lpAddress: string;
  allocPoint?: number;
}

/**
 * Calculate APR for a farm
 * This is a simplified calculation - actual APR depends on many factors
 */
export function calculateFarmApr(
  cakePrice: number,
  poolWeight: number,
  tvlUsd: number,
  cakePerBlock: number,
  blocksPerYear: number,
): number {
  if (tvlUsd === 0) return 0;
  
  const yearlyCakeReward = cakePerBlock * blocksPerYear * poolWeight;
  const yearlyRewardUsd = yearlyCakeReward * cakePrice;
  
  return (yearlyRewardUsd / tvlUsd) * 100;
}

/**
 * BSC blocks per year (approximately)
 */
export const BSC_BLOCKS_PER_YEAR = 10512000; // ~3 seconds per block

/**
 * CAKE emissions per block (may change with governance)
 */
export const CAKE_PER_BLOCK = 10; // Base emission, reduced over time
