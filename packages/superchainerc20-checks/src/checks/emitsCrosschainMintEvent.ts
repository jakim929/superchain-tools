import { PerChainContext } from '../context'
import {
  Address,
  http,
  encodeFunctionData,
  parseEther,
  toHex,
  parseEventLogs,
  RpcLog,
} from 'viem'
import { IERC7802Abi } from '../abi/IERC7802Abi'
import { CheckResult } from '../check'
import { createDebugClient } from '../trace-client/client'
import { contracts } from '@eth-optimism/viem'

const mintAmount = parseEther('1')
// random vanity address
const recipient = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
const mintData = encodeFunctionData({
  abi: IERC7802Abi,
  functionName: 'crosschainMint',
  args: [recipient, mintAmount],
})
const superchainTokenBridgeAddress = contracts.superchainTokenBridge.address

export const emitsCrosschainMintEvent = async (
  { chain, rpcUrlOverride }: PerChainContext,
  contractAddress: Address,
): Promise<CheckResult> => {
  const debugClient = createDebugClient({
    chain,
    transport: rpcUrlOverride ? http(rpcUrlOverride) : http(),
  })

  const callResult = await debugClient.traceCall({
    account: superchainTokenBridgeAddress,
    to: contractAddress,
    data: mintData,
    tracer: 'callTracer',
    tracerConfig: {
      withLog: true,
    },
    stateOverrides: {
      [superchainTokenBridgeAddress]: {
        balance: toHex(parseEther('1')),
      },
    },
  })

  if (callResult.error) {
    return {
      success: false,
      reason: `Token does not allow SuperchainTokenBridge to mint: ${callResult.error}`,
    }
  }

  if (callResult.logs === undefined || callResult.logs.length === 0) {
    return {
      success: false,
      reason: 'Token does not emit any events during crosschainMint operation',
    }
  }

  const crosschainMintEvents = parseEventLogs({
    abi: IERC7802Abi,
    logs: callResult.logs as unknown as RpcLog[],
    eventName: 'CrosschainMint',
  })

  if (crosschainMintEvents.length === 0) {
    return {
      success: false,
      reason:
        'Token does not emit CrosschainMint event during crosschainMint operation',
    }
  }

  const { to, amount, sender } = crosschainMintEvents[0].args

  if (
    to !== recipient ||
    amount !== mintAmount ||
    sender !== superchainTokenBridgeAddress
  ) {
    return {
      success: false,
      reason:
        'Token does not emit correct CrosschainMint event (to recipient with correct amount)',
    }
  }

  return {
    success: true,
    message: 'Token correctly emits CrosschainMint event during crosschainMint',
  }
}
