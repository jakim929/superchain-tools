import { superchainTokenBridgeAbi } from "@/constants/superchainTokenBridgeAbi";
import { contracts } from "@eth-optimism/viem";
import { Abi, Address } from "viem";

export const predeployByContractAddress: Record<
  Address,
  { abi: Abi; name: string }
> = {
  [contracts.superchainTokenBridge.address]: {
    abi: superchainTokenBridgeAbi,
    name: "SuperchainTokenBridge",
  },
};
