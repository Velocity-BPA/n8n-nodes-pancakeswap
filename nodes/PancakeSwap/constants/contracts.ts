/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * PancakeSwap contract addresses across all supported networks
 */

export interface ContractAddresses {
  // Core Router Contracts
  routerV2?: string;
  routerV3?: string;
  smartRouter?: string;
  
  // Factory Contracts
  factoryV2?: string;
  factoryV3?: string;
  
  // Quoter
  quoterV2?: string;
  
  // Position Manager
  nonfungiblePositionManager?: string;
  
  // CAKE Token
  cake?: string;
  
  // veCAKE System
  veCake?: string;
  cakePool?: string;
  
  // MasterChef
  masterChefV2?: string;
  masterChefV3?: string;
  
  // Syrup Pools
  smartChef?: string;
  
  // StableSwap
  stableSwapRouter?: string;
  stableSwapFactory?: string;
  
  // IFO
  ifo?: string;
  ifoPool?: string;
  
  // Lottery
  lottery?: string;
  
  // Prediction
  predictionBnb?: string;
  predictionCake?: string;
  
  // NFT Marketplace
  nftMarket?: string;
  pancakeSquad?: string;
  pancakeBunnies?: string;
  
  // Pottery
  pottery?: string;
  
  // Perpetuals
  perpetualRouter?: string;
  
  // Bridge
  bridge?: string;
  
  // Multicall
  multicall?: string;
  
  // Wrapped Native
  wrappedNative?: string;
  
  // Oracles
  chainlinkBnbUsd?: string;
  chainlinkCakeUsd?: string;
}

export const CONTRACTS: Record<string, ContractAddresses> = {
  bsc: {
    // V2 Contracts
    routerV2: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    factoryV2: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    
    // V3 Contracts
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    quoterV2: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
    
    // Smart Router
    smartRouter: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
    
    // CAKE
    cake: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    
    // veCAKE System
    veCake: '0x5692DB8177a81A6c6afc8084C2976C9933EC1bAB',
    cakePool: '0x45c54210128a065de780C4B0Df3d16664f7f859e',
    
    // MasterChef
    masterChefV2: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
    masterChefV3: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
    
    // StableSwap
    stableSwapRouter: '0x34f0af3e0d87aF76C5f3B58f1eFD2a5bb28B5e66',
    stableSwapFactory: '0x25a55f9f2279A54951133D503490342b50E5cd15',
    
    // IFO
    ifo: '0x1B2A2f6ed4A1401E8C73B4c2B6172455ce2f78E8',
    
    // Lottery
    lottery: '0x5aF6D33DE2ccEC94efb1bDF8f92Bd58085432d2c',
    
    // Prediction
    predictionBnb: '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA',
    predictionCake: '0x0E3A8078EDD2021dadcdE733C6b4a86E51EE8f07',
    
    // NFT Marketplace
    nftMarket: '0x17539cCa21C7933Df5c980172d22659B8C345C5A',
    pancakeSquad: '0x0a8901b0E25DEb55A87524f0cC164E9644020EBA',
    pancakeBunnies: '0xDf7952B35f24aCF7fC0487D01c8d5690a60DBa07',
    
    // Pottery
    pottery: '0x5aF6D33DE2ccEC94efb1bDF8f92Bd58085432d2c',
    
    // Multicall
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    
    // Wrapped Native
    wrappedNative: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    
    // Chainlink Oracles
    chainlinkBnbUsd: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
    chainlinkCakeUsd: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1',
  },
  ethereum: {
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    quoterV2: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
    smartRouter: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
    cake: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898',
    masterChefV3: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wrappedNative: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  },
  arbitrum: {
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    smartRouter: '0x32226588378236Fd0c7c4053999F88aC0e5cAc77',
    cake: '0x1b896893dfc86bb67Cf57767b0bA97a8f2EB9b96',
    masterChefV3: '0x5e09ACf80C0296740eC5d6F643005a4ef8DaA694',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wrappedNative: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
  },
  base: {
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    smartRouter: '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    cake: '0x3055913c90Fcc1A6CE9a358911721eEb942013A1',
    masterChefV3: '0xC6A2Db661D5a5690172d8eB0a7DEA2d3008665A3',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wrappedNative: '0x4200000000000000000000000000000000000006', // WETH
  },
  zksync: {
    routerV3: '0xD70C70AD87aa8D45b8D59600342FB3AEe76E3c68',
    factoryV3: '0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB',
    nonfungiblePositionManager: '0xa815e2eD7f7d5B0c49fda367F249232a1B9D2883',
    smartRouter: '0xf8b59f3c3Ab33200ec80a8A58b2aA5F5D2a8944C',
    cake: '0x3A287a06c66f9E95a56327185cA2BDF5f031cEcD',
    masterChefV3: '0x4c615E78c5fCA1Ad31e4d66eb0D8688d84307463',
    multicall: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    wrappedNative: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91', // WETH
  },
  linea: {
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    smartRouter: '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    cake: '0x0D1E753a25eBda689453309112904807625bEFBe',
    masterChefV3: '0x22E2f236065B780FA33EC8C4E58b99ebc8B55c57',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wrappedNative: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', // WETH
  },
  polygonZkEvm: {
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    smartRouter: '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    cake: '0x0D1E753a25eBda689453309112904807625bEFBe',
    masterChefV3: '0xe9F7b5A6a2E13F9a36d0EDD1D2E5b0E37EB17A1f',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wrappedNative: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9', // WETH
  },
  opbnb: {
    routerV3: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    factoryV3: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    nonfungiblePositionManager: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    smartRouter: '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
    cake: '0x2779106e4F4A8115E6D6a8F296a5d9D5cB74f4ee',
    masterChefV3: '0x5bC20faF94e9AaE6Eb26e49D3D33290f9C5D1F24',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wrappedNative: '0x4200000000000000000000000000000000000006', // WBNB
  },
};

export function getContractAddress(
  network: string,
  contract: keyof ContractAddresses,
): string {
  const addresses = CONTRACTS[network];
  if (!addresses) {
    throw new Error(`Unknown network: ${network}`);
  }
  const address = addresses[contract];
  if (!address) {
    throw new Error(`Contract ${contract} not available on ${network}`);
  }
  return address;
}

// Common ABIs
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const PANCAKE_ROUTER_V2_ABI = [
  'function factory() view returns (address)',
  'function WETH() view returns (address)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
  'function removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) returns (uint256 amountToken, uint256 amountETH)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
  'function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) pure returns (uint256 amountB)',
];

export const PANCAKE_FACTORY_V2_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
  'function allPairs(uint256) view returns (address pair)',
  'function allPairsLength() view returns (uint256)',
  'function createPair(address tokenA, address tokenB) returns (address pair)',
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)',
];

export const PANCAKE_PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function price0CumulativeLast() view returns (uint256)',
  'function price1CumulativeLast() view returns (uint256)',
  'function kLast() view returns (uint256)',
  'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
  'event Sync(uint112 reserve0, uint112 reserve1)',
  'event Mint(address indexed sender, uint256 amount0, uint256 amount1)',
  'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)',
];

export const MASTERCHEF_V2_ABI = [
  'function CAKE() view returns (address)',
  'function poolLength() view returns (uint256)',
  'function poolInfo(uint256) view returns (uint256 accCakePerShare, uint256 lastRewardBlock, uint256 allocPoint, uint256 totalBoostedShare, bool isRegular)',
  'function lpToken(uint256) view returns (address)',
  'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 boostMultiplier)',
  'function pendingCake(uint256 pid, address user) view returns (uint256)',
  'function deposit(uint256 pid, uint256 amount)',
  'function withdraw(uint256 pid, uint256 amount)',
  'function emergencyWithdraw(uint256 pid)',
  'event Deposit(address indexed user, uint256 indexed pid, uint256 amount)',
  'event Withdraw(address indexed user, uint256 indexed pid, uint256 amount)',
  'event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount)',
];

export const CAKE_ABI = [
  ...ERC20_ABI,
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function burnFrom(address account, uint256 amount)',
];

export const VE_CAKE_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function locked(address) view returns (int128 amount, uint256 end)',
  'function create_lock(uint256 value, uint256 unlock_time)',
  'function increase_amount(uint256 value)',
  'function increase_unlock_time(uint256 unlock_time)',
  'function withdraw()',
  'function epoch() view returns (uint256)',
  'function user_point_epoch(address) view returns (uint256)',
  'function user_point_history(address, uint256) view returns (int128 bias, int128 slope, uint256 ts, uint256 blk)',
];

/**
 * Get contracts for a specific chain ID
 */
export function getContractsByChainId(chainId: number): ContractAddresses {
  const CHAIN_ID_MAP: Record<number, string> = {
    56: 'bsc',
    1: 'ethereum',
    42161: 'arbitrum',
    8453: 'base',
    324: 'zksync',
    59144: 'linea',
    1101: 'polygonZkEvm',
    204: 'opbnb',
  };
  const network = CHAIN_ID_MAP[chainId];
  if (!network) {
    return {};
  }
  return CONTRACTS[network] || {};
}
