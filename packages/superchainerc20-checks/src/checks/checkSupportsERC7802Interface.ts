import { PerChainContext } from '../context'
import {
  Address,
  http,
  createPublicClient,
  ContractFunctionExecutionError,
} from 'viem'
import { IERC7802Abi } from '../abi/IERC7802Abi'
import { CheckResult } from '../check'

const ERC7802_INTERFACE_ID = '0x33331994' as const

export const checkSupportsERC7802Interface = async (
  { chain, rpcUrlOverride }: PerChainContext,
  contractAddress: Address,
): Promise<CheckResult> => {
  const publicClient = createPublicClient({
    chain,
    transport: rpcUrlOverride ? http(rpcUrlOverride) : http(),
  })

  try {
    const supportsERC7802 = await publicClient.readContract({
      address: contractAddress,
      abi: IERC7802Abi,
      functionName: 'supportsInterface',
      args: [ERC7802_INTERFACE_ID],
    })

    return supportsERC7802
      ? {
          success: true,
          message: 'Contract declares ERC7802 interface support',
        }
      : {
          success: false,
          reason: `Contract explicitly declares no support for ERC7802 interface (${ERC7802_INTERFACE_ID})`,
        }
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError) {
      if (error.message.includes('HTTP request failed')) {
        throw error
      }
      return {
        success: false,
        reason: `Contract lacks ERC165 interface detection (supportsInterface not implemented) ${error.message}`,
      }
    } else {
      throw error
    }
  }
}
