import { PerChainContext } from "../context";
import {
  Address,
  http,
  encodeFunctionData,
  parseEther,
  toHex,
  parseEventLogs,
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

export const emitsCrosschainBurnEvent = async (
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

  const crosschainBurnEvents = parseEventLogs({
    abi: IERC7802Abi,
    logs: logs as unknown as RpcLog[],
    eventName: "CrosschainBurn",
  });

  if (crosschainBurnEvents.length === 0) {
    return {
      success: false,
      reason:
        "Token does not emit CrosschainBurn event during crosschainBurn operation",
    };
  }

  const { from, amount, sender } = crosschainBurnEvents[0].args;

  if (
    from !== recipient ||
    amount !== burnAmount ||
    sender !== superchainTokenBridgeAddress
  ) {
    return {
      success: false,
      reason:
        "Token does not emit correct CrosschainBurn event (to recipient with correct amount)",
    };
  }

  return {
    success: true,
    message: "Token correctly emits CrosschainBurn event during crosschainBurn",
  };
};
