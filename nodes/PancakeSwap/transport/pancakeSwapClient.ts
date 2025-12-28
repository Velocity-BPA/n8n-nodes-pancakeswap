/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers, Contract, Provider, Wallet, TransactionResponse } from 'ethers';
import { IExecuteFunctions, ILoadOptionsFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';
import { getNetworkConfig } from '../constants/networks';
import { CONTRACTS, ERC20_ABI, PANCAKE_ROUTER_V2_ABI, PANCAKE_FACTORY_V2_ABI, PANCAKE_PAIR_ABI } from '../constants/contracts';

/**
 * Main PancakeSwap client for blockchain interactions
 */
export class PancakeSwapClient {
  private provider: Provider;
  private wallet?: Wallet;
  private network: string;
  private chainId: number;

  constructor(
    provider: Provider,
    network: string,
    chainId: number,
    wallet?: Wallet,
  ) {
    this.provider = provider;
    this.wallet = wallet;
    this.network = network;
    this.chainId = chainId;
  }

  /**
   * Create client from n8n credentials
   */
  static async fromCredentials(
    context: IExecuteFunctions | ILoadOptionsFunctions,
    credentialName: string = 'pancakeSwapNetwork',
  ): Promise<PancakeSwapClient> {
    const credentials = await context.getCredentials(credentialName) as ICredentialDataDecryptedObject;
    
    const network = credentials.network as string;
    let rpcUrl: string;
    let chainId: number;
    
    if (network === 'custom') {
      rpcUrl = credentials.rpcUrl as string;
      chainId = credentials.chainId as number;
    } else {
      const networkConfig = getNetworkConfig(network);
      rpcUrl = (credentials.customRpcUrl as string) || networkConfig.rpcUrl;
      chainId = networkConfig.chainId;
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    
    let wallet: Wallet | undefined;
    const privateKey = credentials.privateKey as string;
    if (privateKey) {
      wallet = new Wallet(privateKey, provider);
    }
    
    return new PancakeSwapClient(provider, network, chainId, wallet);
  }

  /**
   * Get provider
   */
  getProvider(): Provider {
    return this.provider;
  }

  /**
   * Get wallet (throws if not configured)
   */
  getWallet(): Wallet {
    if (!this.wallet) {
      throw new Error('Wallet not configured. Private key required for this operation.');
    }
    return this.wallet;
  }

  /**
   * Get wallet address
   */
  async getAddress(): Promise<string> {
    return this.getWallet().address;
  }

  /**
   * Get network info
   */
  getNetworkInfo(): { network: string; chainId: number } {
    return {
      network: this.network,
      chainId: this.chainId,
    };
  }

  /**
   * Get contract address for this network
   */
  getContractAddress(contractName: keyof typeof CONTRACTS['bsc']): string {
    const contracts = CONTRACTS[this.network];
    if (!contracts) {
      throw new Error(`No contracts defined for network: ${this.network}`);
    }
    const address = contracts[contractName];
    if (!address) {
      throw new Error(`Contract ${contractName} not available on ${this.network}`);
    }
    return address;
  }

  /**
   * Get ERC20 token contract
   */
  getERC20Contract(tokenAddress: string): Contract {
    return new Contract(tokenAddress, ERC20_ABI, this.wallet || this.provider);
  }

  /**
   * Get token info
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
  }> {
    const contract = this.getERC20Contract(tokenAddress);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);
    
    return { name, symbol, decimals, totalSupply };
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenAddress: string, walletAddress?: string): Promise<bigint> {
    const address = walletAddress || await this.getAddress();
    const contract = this.getERC20Contract(tokenAddress);
    return contract.balanceOf(address);
  }

  /**
   * Get native token balance (BNB/ETH)
   */
  async getNativeBalance(walletAddress?: string): Promise<bigint> {
    const address = walletAddress || await this.getAddress();
    return this.provider.getBalance(address);
  }

  /**
   * Approve token spending
   */
  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint,
  ): Promise<TransactionResponse> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.getWallet());
    return contract.approve(spenderAddress, amount);
  }

  /**
   * Check token allowance
   */
  async getAllowance(
    tokenAddress: string,
    spenderAddress: string,
    ownerAddress?: string,
  ): Promise<bigint> {
    const owner = ownerAddress || await this.getAddress();
    const contract = this.getERC20Contract(tokenAddress);
    return contract.allowance(owner, spenderAddress);
  }

  /**
   * Get V2 Router contract
   */
  getV2Router(): Contract {
    const routerAddress = this.getContractAddress('routerV2');
    return new Contract(routerAddress, PANCAKE_ROUTER_V2_ABI, this.wallet || this.provider);
  }

  /**
   * Get V2 Factory contract
   */
  getV2Factory(): Contract {
    const factoryAddress = this.getContractAddress('factoryV2');
    return new Contract(factoryAddress, PANCAKE_FACTORY_V2_ABI, this.provider);
  }

  /**
   * Get pair contract
   */
  getPairContract(pairAddress: string): Contract {
    return new Contract(pairAddress, PANCAKE_PAIR_ABI, this.provider);
  }

  /**
   * Get pair address for two tokens
   */
  async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    const factory = this.getV2Factory();
    return factory.getPair(tokenA, tokenB);
  }

  /**
   * Get pair reserves
   */
  async getPairReserves(pairAddress: string): Promise<{
    reserve0: bigint;
    reserve1: bigint;
    blockTimestamp: number;
  }> {
    const pair = this.getPairContract(pairAddress);
    const [reserve0, reserve1, blockTimestamp] = await pair.getReserves();
    return { reserve0, reserve1, blockTimestamp };
  }

  /**
   * Get amounts out for V2 swap
   */
  async getAmountsOut(amountIn: bigint, path: string[]): Promise<bigint[]> {
    const router = this.getV2Router();
    return router.getAmountsOut(amountIn, path);
  }

  /**
   * Get amounts in for V2 swap
   */
  async getAmountsIn(amountOut: bigint, path: string[]): Promise<bigint[]> {
    const router = this.getV2Router();
    return router.getAmountsIn(amountOut, path);
  }

  /**
   * Execute V2 swap (exact tokens for tokens)
   */
  async swapExactTokensForTokens(
    amountIn: bigint,
    amountOutMin: bigint,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<TransactionResponse> {
    const router = new Contract(
      this.getContractAddress('routerV2'),
      PANCAKE_ROUTER_V2_ABI,
      this.getWallet(),
    );
    
    return router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
    );
  }

  /**
   * Execute V2 swap (exact ETH for tokens)
   */
  async swapExactETHForTokens(
    amountIn: bigint,
    amountOutMin: bigint,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<TransactionResponse> {
    const router = new Contract(
      this.getContractAddress('routerV2'),
      PANCAKE_ROUTER_V2_ABI,
      this.getWallet(),
    );
    
    return router.swapExactETHForTokens(
      amountOutMin,
      path,
      to,
      deadline,
      { value: amountIn },
    );
  }

  /**
   * Add liquidity V2
   */
  async addLiquidity(
    tokenA: string,
    tokenB: string,
    amountADesired: bigint,
    amountBDesired: bigint,
    amountAMin: bigint,
    amountBMin: bigint,
    to: string,
    deadline: number,
  ): Promise<TransactionResponse> {
    const router = new Contract(
      this.getContractAddress('routerV2'),
      PANCAKE_ROUTER_V2_ABI,
      this.getWallet(),
    );
    
    return router.addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      to,
      deadline,
    );
  }

  /**
   * Remove liquidity V2
   */
  async removeLiquidity(
    tokenA: string,
    tokenB: string,
    liquidity: bigint,
    amountAMin: bigint,
    amountBMin: bigint,
    to: string,
    deadline: number,
  ): Promise<TransactionResponse> {
    const router = new Contract(
      this.getContractAddress('routerV2'),
      PANCAKE_ROUTER_V2_ABI,
      this.getWallet(),
    );
    
    return router.removeLiquidity(
      tokenA,
      tokenB,
      liquidity,
      amountAMin,
      amountBMin,
      to,
      deadline,
    );
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
  ): Promise<ethers.TransactionReceipt | null> {
    return this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return this.provider.estimateGas(tx);
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || 0n;
  }

  /**
   * Format token amount from wei to human-readable
   */
  formatTokenAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parse token amount from human-readable to wei
   */
  parseTokenAmount(amount: string, decimals: number = 18): bigint {
    return ethers.parseUnits(amount, decimals);
  }
}

/**
 * Emit licensing notice (once per session)
 */
let licenseNoticeEmitted = false;
export function emitLicenseNotice(): void {
  if (!licenseNoticeEmitted) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
    licenseNoticeEmitted = true;
  }
}
