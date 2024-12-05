import { PerChainContext } from "../context";
import { Address, http, createPublicClient } from "viem";
import { CheckResult } from "../check";

export const checkIsContractDeployed = async (
  { chain, rpcUrlOverride }: PerChainContext,
  contractAddress: Address
): Promise<CheckResult> => {
  const publicClient = createPublicClient({
    chain,
    transport: rpcUrlOverride ? http(rpcUrlOverride) : http(),
  });

  const code = await publicClient.getCode({ address: contractAddress });

  return code !== undefined && code !== "0x"
    ? {
        success: true,
        message: "Contract is deployed at the specified address",
      }
    : {
        success: false,
        reason: "No contract code found at the specified address",
      };
};
