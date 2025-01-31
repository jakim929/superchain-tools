import { PerChainContext } from "../context";
import {
  Address,
  http,
  encodeFunctionData,
  parseEther,
  toHex,
  erc20Abi,
  parseEventLogs,
  zeroAddress,
  RpcLog,
} from "viem";
import { IERC7802Abi } from "../abi/IERC7802Abi";
import { CheckResult } from "../check";
import { createDebugClient } from "../trace-client/client";
import { contracts } from "@eth-optimism/viem";
import { getLogsFromCallResult } from "../util/getLogsFromCallResult";

const mintAmount = parseEther("1");
// random vanity address
const recipient = "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF";
const mintData = encodeFunctionData({
  abi: IERC7802Abi,
  functionName: "crosschainMint",
  args: [recipient, mintAmount],
});
const superchainTokenBridgeAddress = contracts.superchainTokenBridge.address;

export const allowsSuperchainTokenBridgeToMint = async (
  { chain, rpcUrlOverride }: PerChainContext,
  contractAddress: Address
): Promise<CheckResult> => {
  const debugClient = createDebugClient({
    chain,
    transport: rpcUrlOverride ? http(rpcUrlOverride) : http(),
  });

  const callResult = await debugClient.traceCall({
    account: superchainTokenBridgeAddress,
    to: contractAddress,
    data: mintData,
    tracer: "callTracer",
    tracerConfig: {
      withLog: true,
    },
    stateOverrides: {
      [superchainTokenBridgeAddress]: {
        balance: toHex(parseEther("1")),
      },
    },
  });

  if (callResult.error) {
    return {
      success: false,
      reason: `Token does not allow SuperchainTokenBridge to mint: ${callResult.error}`,
    };
  }

  const logs = getLogsFromCallResult(callResult);

  if (logs === undefined || logs.length === 0) {
    return {
      success: false,
      reason: "Token does not emit any events during crosschainMint operation",
    };
  }

  const transferEvents = parseEventLogs({
    abi: erc20Abi,
    logs: logs as unknown as RpcLog[],
    eventName: "Transfer",
  });

  if (transferEvents.length === 0) {
    return {
      success: false,
      reason:
        "Token does not emit Transfer event during crosschainMint operation",
    };
  }

  const { from, to, value } = transferEvents[0].args;

  if (to !== recipient || value !== mintAmount || from !== zeroAddress) {
    return {
      success: false,
      reason:
        "Token does not emit correct Transfer event (from zero address to recipient with correct amount)",
    };
  }

  return {
    success: true,
    message:
      "Token correctly allows SuperchainTokenBridge to call crosschainMint",
  };
};
