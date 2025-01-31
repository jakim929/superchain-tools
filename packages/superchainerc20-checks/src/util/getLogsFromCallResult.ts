import { RpcCallTrace } from "../trace-client/actions";

// Uses heuristic to also handle proxy contracts
export const getLogsFromCallResult = (callResult: RpcCallTrace) => {
  const firstCall = callResult.calls?.[0];

  if (firstCall?.type === "DELEGATECALL" && firstCall?.logs) {
    return firstCall.logs;
  }

  return callResult.logs;
};
