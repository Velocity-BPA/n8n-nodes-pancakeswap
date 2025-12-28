/**
 * PancakeSwap Node Integration Tests
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { NETWORKS, CONTRACTS, FEE_TIERS, TOKENS } from '../../nodes/PancakeSwap/constants';

describe('Constants Integration', () => {
	describe('Networks', () => {
		it('should have all required networks', () => {
			const requiredNetworks = ['bsc', 'ethereum', 'arbitrum', 'base', 'zksync', 'linea', 'polygonZkEvm', 'opbnb'];
			for (const network of requiredNetworks) {
				expect(NETWORKS[network]).toBeDefined();
				expect(NETWORKS[network].chainId).toBeDefined();
				expect(NETWORKS[network].rpcUrl).toBeDefined();
			}
		});

		it('should have valid chain IDs', () => {
			expect(NETWORKS.bsc.chainId).toBe(56);
			expect(NETWORKS.ethereum.chainId).toBe(1);
			expect(NETWORKS.arbitrum.chainId).toBe(42161);
			expect(NETWORKS.base.chainId).toBe(8453);
		});
	});

	describe('Contracts', () => {
		it('should have router addresses for BSC', () => {
			expect(CONTRACTS.pancakeSwapV2Router[56]).toBeDefined();
			expect(CONTRACTS.pancakeSwapV3Router[56]).toBeDefined();
			expect(CONTRACTS.smartRouter[56]).toBeDefined();
		});

		it('should have factory addresses', () => {
			expect(CONTRACTS.pancakeSwapV2Factory[56]).toBeDefined();
			expect(CONTRACTS.pancakeSwapV3Factory[56]).toBeDefined();
		});

		it('should have MasterChef addresses', () => {
			expect(CONTRACTS.masterChefV2[56]).toBeDefined();
			expect(CONTRACTS.masterChefV3[56]).toBeDefined();
		});

		it('should have CAKE address', () => {
			expect(CONTRACTS.cake[56]).toBeDefined();
		});
	});

	describe('Fee Tiers', () => {
		it('should have V3 fee tiers', () => {
			expect(FEE_TIERS.v3).toBeDefined();
			expect(FEE_TIERS.v3.length).toBeGreaterThan(0);
		});

		it('should have correct V3 fee values', () => {
			const fees = FEE_TIERS.v3.map(t => t.fee);
			expect(fees).toContain(100);   // 0.01%
			expect(fees).toContain(500);   // 0.05%
			expect(fees).toContain(2500);  // 0.25%
			expect(fees).toContain(10000); // 1%
		});

		it('should have V2 fee', () => {
			expect(FEE_TIERS.v2).toBeDefined();
			expect(FEE_TIERS.v2.fee).toBe(25); // 0.25%
		});

		it('should have StableSwap fee', () => {
			expect(FEE_TIERS.stableSwap).toBeDefined();
			expect(FEE_TIERS.stableSwap.fee).toBe(4); // 0.04%
		});
	});

	describe('Tokens', () => {
		it('should have CAKE token defined', () => {
			expect(TOKENS.CAKE).toBeDefined();
			expect(TOKENS.CAKE[56]).toBeDefined();
			expect(TOKENS.CAKE[56].symbol).toBe('CAKE');
		});

		it('should have WBNB defined', () => {
			expect(TOKENS.WBNB).toBeDefined();
			expect(TOKENS.WBNB[56]).toBeDefined();
		});

		it('should have stablecoins', () => {
			expect(TOKENS.USDT).toBeDefined();
			expect(TOKENS.USDC).toBeDefined();
			expect(TOKENS.BUSD).toBeDefined();
		});
	});
});

describe('Contract Address Validation', () => {
	const isValidAddress = (address: string): boolean => {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	};

	it('should have valid BSC router addresses', () => {
		expect(isValidAddress(CONTRACTS.pancakeSwapV2Router[56])).toBe(true);
		expect(isValidAddress(CONTRACTS.pancakeSwapV3Router[56])).toBe(true);
	});

	it('should have valid factory addresses', () => {
		expect(isValidAddress(CONTRACTS.pancakeSwapV2Factory[56])).toBe(true);
		expect(isValidAddress(CONTRACTS.pancakeSwapV3Factory[56])).toBe(true);
	});

	it('should have valid CAKE address', () => {
		expect(isValidAddress(CONTRACTS.cake[56])).toBe(true);
	});

	it('should have valid token addresses', () => {
		expect(isValidAddress(TOKENS.CAKE[56].address)).toBe(true);
		expect(isValidAddress(TOKENS.WBNB[56].address)).toBe(true);
	});
});

describe('Network Configuration', () => {
	it('should have subgraph URLs for BSC', () => {
		expect(NETWORKS.bsc.subgraphV2).toBeDefined();
		expect(NETWORKS.bsc.subgraphV3).toBeDefined();
	});

	it('should have explorer URLs', () => {
		expect(NETWORKS.bsc.explorer).toBeDefined();
		expect(NETWORKS.bsc.explorer).toContain('bscscan');
	});

	it('should have proper network names', () => {
		expect(NETWORKS.bsc.name).toBe('BNB Smart Chain');
		expect(NETWORKS.ethereum.name).toBe('Ethereum');
	});
});

// Note: These tests require network access and should be run separately
describe.skip('Live Network Tests', () => {
	it('should connect to BSC RPC', async () => {
		const { ethers } = await import('ethers');
		const provider = new ethers.JsonRpcProvider(NETWORKS.bsc.rpcUrl);
		const blockNumber = await provider.getBlockNumber();
		expect(blockNumber).toBeGreaterThan(0);
	});

	it('should fetch CAKE balance', async () => {
		const { ethers } = await import('ethers');
		const provider = new ethers.JsonRpcProvider(NETWORKS.bsc.rpcUrl);
		const cakeContract = new ethers.Contract(
			CONTRACTS.cake[56],
			['function balanceOf(address) view returns (uint256)'],
			provider,
		);
		const balance = await cakeContract.balanceOf(CONTRACTS.masterChefV2[56]);
		expect(balance).toBeDefined();
	});
});
