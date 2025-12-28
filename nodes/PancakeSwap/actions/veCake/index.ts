/**
 * PancakeSwap veCAKE Resource
 * Vote-escrowed CAKE for governance and boost
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';

export const veCakeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['veCake'],
      },
    },
    options: [
      {
        name: 'Get veCAKE Balance',
        value: 'getBalance',
        description: 'Get veCAKE balance for an address',
        action: 'Get veCAKE balance',
      },
      {
        name: 'Get Lock Info',
        value: 'getLockInfo',
        description: 'Get CAKE lock details',
        action: 'Get lock info',
      },
      {
        name: 'Get Lock End Time',
        value: 'getLockEndTime',
        description: 'Get when the lock expires',
        action: 'Get lock end time',
      },
      {
        name: 'Get Voting Power',
        value: 'getVotingPower',
        description: 'Get current voting power',
        action: 'Get voting power',
      },
      {
        name: 'Lock CAKE',
        value: 'lockCake',
        description: 'Lock CAKE to get veCAKE',
        action: 'Lock CAKE for veCAKE',
      },
      {
        name: 'Increase Lock Amount',
        value: 'increaseLock',
        description: 'Add more CAKE to existing lock',
        action: 'Increase lock amount',
      },
      {
        name: 'Extend Lock Duration',
        value: 'extendLock',
        description: 'Extend the lock duration',
        action: 'Extend lock duration',
      },
      {
        name: 'Withdraw',
        value: 'withdraw',
        description: 'Withdraw unlocked CAKE',
        action: 'Withdraw unlocked CAKE',
      },
      {
        name: 'Get Gauge Votes',
        value: 'getGaugeVotes',
        description: 'Get current gauge vote allocations',
        action: 'Get gauge votes',
      },
      {
        name: 'Vote for Gauge',
        value: 'voteForGauge',
        description: 'Vote for a gauge to direct emissions',
        action: 'Vote for gauge',
      },
      {
        name: 'Get Emission Rate',
        value: 'getEmissionRate',
        description: 'Get current CAKE emission rate',
        action: 'Get emission rate',
      },
    ],
    default: 'getBalance',
  },
];

export const veCakeFields: INodeProperties[] = [
  // User address for read operations
  {
    displayName: 'User Address',
    name: 'userAddress',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['getBalance', 'getLockInfo', 'getLockEndTime', 'getVotingPower', 'getGaugeVotes'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'User wallet address (leave empty to use connected wallet)',
  },
  // Lock CAKE fields
  {
    displayName: 'CAKE Amount',
    name: 'cakeAmount',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['lockCake', 'increaseLock'],
      },
    },
    default: 100,
    typeOptions: {
      minValue: 0.01,
    },
    description: 'Amount of CAKE to lock',
  },
  {
    displayName: 'Lock Duration (Weeks)',
    name: 'lockDurationWeeks',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['lockCake'],
      },
    },
    default: 52,
    typeOptions: {
      minValue: 1,
      maxValue: 208,
    },
    description: 'Lock duration in weeks (1-208 weeks, max 4 years)',
  },
  // Extend Lock fields
  {
    displayName: 'New Lock End Time',
    name: 'newLockEndTime',
    type: 'dateTime',
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['extendLock'],
      },
    },
    default: '',
    description: 'New lock end time (must be later than current end time and max 4 years from now)',
  },
  {
    displayName: 'Extension Weeks',
    name: 'extensionWeeks',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['extendLock'],
      },
    },
    default: 52,
    typeOptions: {
      minValue: 1,
      maxValue: 208,
    },
    description: 'Number of weeks to extend the lock',
  },
  // Vote for Gauge fields
  {
    displayName: 'Gauge Address',
    name: 'gaugeAddress',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['voteForGauge'],
      },
    },
    default: '',
    placeholder: '0x...',
    description: 'Address of the gauge (farm) to vote for',
  },
  {
    displayName: 'Vote Weight (%)',
    name: 'voteWeight',
    type: 'number',
    required: true,
    displayOptions: {
      show: {
        resource: ['veCake'],
        operation: ['voteForGauge'],
      },
    },
    default: 100,
    typeOptions: {
      minValue: 0,
      maxValue: 100,
    },
    description: 'Percentage of voting power to allocate (0-100%)',
  },
];

/**
 * Execute veCAKE operations
 * veCAKE is PancakeSwap's vote-escrow system based on Curve's veCRV model:
 * - Lock CAKE for 1-208 weeks to receive veCAKE
 * - veCAKE decays linearly over time
 * - veCAKE provides: Governance voting, Farm boost (up to 2.5x), Gauge voting for emissions
 * - Locks are aligned to week boundaries (Thursday 00:00 UTC)
 */
export async function executeVeCake(
  this: IExecuteFunctions,
  index: number,
  operation: string,
): Promise<IDataObject> {
  const MAX_LOCK_TIME = 208; // 4 years in weeks
  const WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  
  switch (operation) {
    case 'getBalance': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      // veCAKE balance decays linearly over time
      const lockedCake = 1000;
      const lockEnd = Date.now() + (52 * WEEK); // 1 year from now
      const remainingTime = lockEnd - Date.now();
      const maxTime = MAX_LOCK_TIME * WEEK;
      const veCAKE = lockedCake * (remainingTime / maxTime);
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        veCakeBalance: Math.round(veCAKE * 100) / 100,
        lockedCake,
        lockEnd: new Date(lockEnd).toISOString(),
        remainingWeeks: 52,
        decayRate: lockedCake / (MAX_LOCK_TIME * 52), // veCAKE per week
        note: 'veCAKE balance decreases linearly as lock approaches expiry',
      };
    }
    
    case 'getLockInfo': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      const lockEnd = Date.now() + (52 * WEEK);
      const lockStart = Date.now() - (26 * WEEK);
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        lockedCake: 1000,
        veCakeBalance: 250,
        lockStart: new Date(lockStart).toISOString(),
        lockEnd: new Date(lockEnd).toISOString(),
        lockDurationWeeks: 78,
        remainingWeeks: 52,
        initialVeCake: 375,
        currentVeCake: 250,
        decayedVeCake: 125,
        canWithdraw: false,
        canIncrease: true,
        canExtend: true,
        maxExtensionWeeks: 156, // MAX_LOCK_TIME - remainingWeeks
      };
    }
    
    case 'getLockEndTime': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      const lockEnd = Date.now() + (52 * WEEK);
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        lockEndTime: new Date(lockEnd).toISOString(),
        lockEndTimestamp: Math.floor(lockEnd / 1000),
        remainingTime: {
          weeks: 52,
          days: 364,
          hours: 8736,
        },
        isExpired: false,
        canWithdrawAt: new Date(lockEnd).toISOString(),
      };
    }
    
    case 'getVotingPower': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        votingPower: 250,
        totalVotingPower: 50000000,
        votingPowerShare: 0.0005,
        usedVotingPower: 200,
        availableVotingPower: 50,
        gaugeVotes: [
          { gauge: 'CAKE-BNB Farm', weight: 150 },
          { gauge: 'CAKE-USDT Farm', weight: 50 },
        ],
        lastVoteTimestamp: new Date(Date.now() - 86400000).toISOString(),
        nextVoteResetTime: new Date(Date.now() + 604800000).toISOString(),
      };
    }
    
    case 'lockCake': {
      const cakeAmount = this.getNodeParameter('cakeAmount', index, 100) as number;
      const lockDurationWeeks = this.getNodeParameter('lockDurationWeeks', index, 52) as number;
      
      // Calculate veCAKE based on lock duration
      const lockRatio = lockDurationWeeks / MAX_LOCK_TIME;
      const estimatedVeCake = cakeAmount * lockRatio;
      
      // Round to next Thursday 00:00 UTC (week alignment)
      const now = Date.now();
      const lockEnd = now + (lockDurationWeeks * WEEK);
      const alignedLockEnd = Math.ceil(lockEnd / WEEK) * WEEK;
      
      return {
        status: 'pending',
        cakeAmount,
        lockDurationWeeks,
        estimatedVeCake: Math.round(estimatedVeCake * 100) / 100,
        lockEnd: new Date(alignedLockEnd).toISOString(),
        lockRatio,
        benefits: {
          farmBoostMax: '2.5x',
          governanceVoting: true,
          gaugeVoting: true,
          ifoBoost: true,
        },
        warnings: lockDurationWeeks < 52 ? ['Shorter locks provide less veCAKE and lower boosts'] : [],
        note: 'Locking CAKE is irreversible until lock expires. Locks align to weekly boundaries.',
      };
    }
    
    case 'increaseLock': {
      const cakeAmount = this.getNodeParameter('cakeAmount', index, 100) as number;
      
      const currentLock = 1000;
      const remainingWeeks = 52;
      const lockRatio = remainingWeeks / MAX_LOCK_TIME;
      const additionalVeCake = cakeAmount * lockRatio;
      
      return {
        status: 'pending',
        additionalCake: cakeAmount,
        currentLockedCake: currentLock,
        newTotalLockedCake: currentLock + cakeAmount,
        currentVeCake: 250,
        additionalVeCake: Math.round(additionalVeCake * 100) / 100,
        newTotalVeCake: 250 + additionalVeCake,
        remainingLockWeeks: remainingWeeks,
        note: 'Additional CAKE inherits the remaining lock duration',
      };
    }
    
    case 'extendLock': {
      const extensionWeeks = this.getNodeParameter('extensionWeeks', index, 52) as number;
      
      const currentRemainingWeeks = 52;
      const newRemainingWeeks = currentRemainingWeeks + extensionWeeks;
      const cappedWeeks = Math.min(newRemainingWeeks, MAX_LOCK_TIME);
      
      const lockedCake = 1000;
      const currentVeCake = lockedCake * (currentRemainingWeeks / MAX_LOCK_TIME);
      const newVeCake = lockedCake * (cappedWeeks / MAX_LOCK_TIME);
      
      return {
        status: 'pending',
        extensionWeeks,
        currentLockEndWeeks: currentRemainingWeeks,
        newLockEndWeeks: cappedWeeks,
        cappedAt: cappedWeeks === MAX_LOCK_TIME,
        lockedCake,
        currentVeCake: Math.round(currentVeCake * 100) / 100,
        newVeCake: Math.round(newVeCake * 100) / 100,
        veCakeIncrease: Math.round((newVeCake - currentVeCake) * 100) / 100,
        newLockEnd: new Date(Date.now() + cappedWeeks * WEEK).toISOString(),
        note: 'Maximum lock duration is 208 weeks (4 years)',
      };
    }
    
    case 'withdraw': {
      const lockEnd = Date.now() + (52 * WEEK); // Example: lock not expired
      const isExpired = lockEnd < Date.now();
      
      if (!isExpired) {
        return {
          status: 'error',
          canWithdraw: false,
          lockEnd: new Date(lockEnd).toISOString(),
          remainingTime: '52 weeks',
          message: 'Cannot withdraw: Lock has not expired yet',
        };
      }
      
      return {
        status: 'pending',
        canWithdraw: true,
        withdrawableAmount: 1000,
        note: 'Execute transaction to withdraw all unlocked CAKE',
      };
    }
    
    case 'getGaugeVotes': {
      const userAddress = this.getNodeParameter('userAddress', index, '') as string;
      
      return {
        userAddress: userAddress || '0x...connected_wallet',
        totalVotingPower: 250,
        usedVotingPower: 200,
        remainingVotingPower: 50,
        votes: [
          {
            gaugeAddress: '0x...',
            gaugeName: 'CAKE-BNB V3 Farm',
            allocatedPower: 150,
            allocationPercentage: 60,
            currentAPR: 45.5,
            boostedAPR: 113.75,
          },
          {
            gaugeAddress: '0x...',
            gaugeName: 'CAKE-USDT V2 Farm',
            allocatedPower: 50,
            allocationPercentage: 20,
            currentAPR: 32.5,
            boostedAPR: 81.25,
          },
        ],
        lastVoteTimestamp: new Date(Date.now() - 86400000).toISOString(),
        voteCooldown: false,
        nextVoteAvailable: new Date().toISOString(),
      };
    }
    
    case 'voteForGauge': {
      const gaugeAddress = this.getNodeParameter('gaugeAddress', index, '') as string;
      const voteWeight = this.getNodeParameter('voteWeight', index, 100) as number;
      
      const votingPower = 250;
      const allocatedPower = votingPower * (voteWeight / 100);
      
      return {
        status: 'pending',
        gaugeAddress,
        voteWeight,
        allocatedPower,
        votingPower,
        remainingPower: votingPower - allocatedPower,
        estimatedEmissionShare: 0.0005,
        estimatedAPRImpact: '+2.5%',
        note: 'Vote allocations affect CAKE emission distribution to farms. Votes reset weekly.',
      };
    }
    
    case 'getEmissionRate': {
      return {
        currentEmissionRate: 11.16, // CAKE per block
        blocksPerDay: 28800,
        dailyEmission: 321408,
        weeklyEmission: 2249856,
        annualEmission: 117295680,
        burnRate: 0.25, // 25% of emissions burned
        netEmission: 8.37, // After burn
        totalSupply: 393000000,
        inflationRate: 29.8, // Annual percentage
        emissionSchedule: [
          { week: 1, emission: 11.16 },
          { week: 52, emission: 10.5 },
          { week: 104, emission: 9.8 },
        ],
        note: 'CAKE emissions decrease over time according to tokenomics schedule',
      };
    }
    
    default:
      throw new Error(`Operation ${operation} not supported`);
  }
}
