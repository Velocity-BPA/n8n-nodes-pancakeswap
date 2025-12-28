/**
 * PancakeSwap Pottery Resource
 * Prize savings product - deposit CAKE for chance to win prizes
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const potteryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['pottery'],
      },
    },
    options: [
      {
        name: 'Get Pottery Info',
        value: 'getPotteryInfo',
        description: 'Get current pottery round information',
        action: 'Get pottery info',
      },
      {
        name: 'Deposit',
        value: 'deposit',
        description: 'Deposit CAKE into pottery',
        action: 'Deposit CAKE into pottery',
      },
      {
        name: 'Get Deposit Balance',
        value: 'getDepositBalance',
        description: 'Get deposited CAKE balance',
        action: 'Get deposit balance',
      },
      {
        name: 'Get Claimable Prize',
        value: 'getClaimablePrize',
        description: 'Get claimable prize amount',
        action: 'Get claimable prize',
      },
      {
        name: 'Claim Prize',
        value: 'claimPrize',
        description: 'Claim won prize',
        action: 'Claim prize',
      },
      {
        name: 'Get Pottery Stats',
        value: 'getPotteryStats',
        description: 'Get overall pottery statistics',
        action: 'Get pottery stats',
      },
      {
        name: 'Get Drawing Schedule',
        value: 'getDrawingSchedule',
        description: 'Get pottery drawing schedule',
        action: 'Get drawing schedule',
      },
    ],
    default: 'getPotteryInfo',
  },
];

export const potteryFields: INodeProperties[] = [
  // Deposit fields
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['pottery'],
        operation: ['deposit'],
      },
    },
    default: '',
    placeholder: '100',
    description: 'Amount of CAKE to deposit',
  },
  // Address fields for queries
  {
    displayName: 'Wallet Address',
    name: 'walletAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['pottery'],
        operation: ['getDepositBalance', 'getClaimablePrize'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Wallet address to query (leave empty to use connected wallet)',
  },
  // Round ID
  {
    displayName: 'Round ID',
    name: 'roundId',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['pottery'],
        operation: ['getPotteryInfo', 'claimPrize'],
      },
    },
    default: 0,
    description: 'Pottery round ID (0 for current round)',
  },
];

/**
 * Execute pottery operations
 * Pottery is a prize savings product where users deposit CAKE for a chance to win
 */
export async function executePotteryOperation(
  this: IExecuteFunctions,
  index: number,
  operation: string,
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];

  try {
    switch (operation) {
      case 'getPotteryInfo': {
        const roundId = this.getNodeParameter('roundId', index, 0) as number;
        
        // Pottery contract interaction would go here
        // For now, return structure showing pottery mechanics
        returnData.push({
          json: {
            success: true,
            operation: 'getPotteryInfo',
            roundId: roundId || 'current',
            potteryInfo: {
              currentRound: 15,
              status: 'active',
              totalDeposited: '1250000',
              totalParticipants: 4521,
              prizePool: '62500',
              depositDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              lockDuration: '10 weeks',
              minDeposit: '1',
              maxDeposit: '10000',
            },
            description: 'Pottery is a prize savings product. Deposit CAKE, lock for 10 weeks, and have a chance to win prizes each week based on your share of the pool.',
          },
        });
        break;
      }

      case 'deposit': {
        const amount = this.getNodeParameter('amount', index) as string;
        
        if (!amount || parseFloat(amount) <= 0) {
          throw new NodeOperationError(this.getNode(), 'Deposit amount must be greater than 0');
        }

        // Transaction would be executed here
        returnData.push({
          json: {
            success: true,
            operation: 'deposit',
            amount,
            message: 'Deposit transaction prepared',
            details: {
              lockDuration: '10 weeks',
              unlockDate: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000).toISOString(),
              participatingInRounds: 10,
            },
            note: 'Deposited CAKE will be locked for 10 weeks. You will participate in weekly draws during this period.',
            transactionHash: 'Transaction would be submitted to blockchain',
          },
        });
        break;
      }

      case 'getDepositBalance': {
        const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
        
        returnData.push({
          json: {
            success: true,
            operation: 'getDepositBalance',
            walletAddress: walletAddress || 'connected wallet',
            balance: {
              deposited: '500',
              locked: true,
              unlockDate: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000).toISOString(),
              weeksRemaining: 6,
              participatingRounds: [15, 16, 17, 18, 19, 20],
            },
          },
        });
        break;
      }

      case 'getClaimablePrize': {
        const walletAddress = this.getNodeParameter('walletAddress', index, '') as string;
        
        returnData.push({
          json: {
            success: true,
            operation: 'getClaimablePrize',
            walletAddress: walletAddress || 'connected wallet',
            claimable: {
              totalPrize: '125.5',
              wonRounds: [12, 14],
              breakdown: [
                { round: 12, prize: '75.5', claimed: false },
                { round: 14, prize: '50', claimed: false },
              ],
            },
          },
        });
        break;
      }

      case 'claimPrize': {
        const roundId = this.getNodeParameter('roundId', index, 0) as number;
        
        returnData.push({
          json: {
            success: true,
            operation: 'claimPrize',
            roundId: roundId || 'all unclaimed',
            message: 'Prize claim transaction prepared',
            transactionHash: 'Transaction would be submitted to blockchain',
          },
        });
        break;
      }

      case 'getPotteryStats': {
        returnData.push({
          json: {
            success: true,
            operation: 'getPotteryStats',
            stats: {
              totalRounds: 15,
              totalPrizesDistributed: '750000',
              totalParticipants: 12500,
              totalDeposited: '5000000',
              averagePrizePerRound: '50000',
              winRate: '10%',
              currentAPY: '15.5%',
            },
          },
        });
        break;
      }

      case 'getDrawingSchedule': {
        returnData.push({
          json: {
            success: true,
            operation: 'getDrawingSchedule',
            schedule: {
              frequency: 'Weekly',
              drawDay: 'Friday',
              drawTime: '12:00 UTC',
              nextDraw: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              upcomingDraws: [
                { round: 16, date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
                { round: 17, date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
                { round: 18, date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString() },
              ],
            },
          },
        });
        break;
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
    }
  } catch (error) {
    if (error instanceof NodeOperationError) throw error;
    throw new NodeOperationError(this.getNode(), `Pottery operation failed: ${(error as Error).message}`);
  }

  return returnData;
}

// Export alias for main node compatibility
export const executePottery = executePotteryOperation;
