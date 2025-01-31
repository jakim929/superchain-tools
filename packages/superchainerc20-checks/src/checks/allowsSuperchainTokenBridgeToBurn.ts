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

const burnAmount = parseEther("0");
// random vanity address
const recipient = "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF";
const burnData = encodeFunctionData({
  abi: IERC7802Abi,
  functionName: "crosschainBurn",
  args: [recipient, burnAmount],
});
const superchainTokenBridgeAddress = contracts.superchainTokenBridge.address;

// This check is not great, because it doesn't actually burn a nonzero amount. we need fork tests for that.
export const allowsSuperchainTokenBridgeToBurn = async (
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
    data: burnData,
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
      reason: `Token does not allow SuperchainTokenBridge to burn: ${callResult.error}`,
    };
  }

  const logs = getLogsFromCallResult(callResult);

  if (logs === undefined || logs.length === 0) {
    return {
      success: false,
      reason: "Token does not emit any events during crosschainBurn operation",
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
        "Token does not emit Transfer event during crosschainBurn operation",
    };
  }

  const { from, to, value } = transferEvents[0].args;

  if (to !== zeroAddress || value !== burnAmount || from !== recipient) {
    return {
      success: false,
      reason:
        "Token does not emit correct Transfer event (from recipient to zero address with correct amount)",
    };
  }

  return {
    success: true,
    message:
      "Token correctly allows SuperchainTokenBridge to call crosschainBurn",
  };
};
