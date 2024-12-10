import { contracts, superchainTokenBridgeABI } from "@eth-optimism/viem";
import { Abi, Address } from "viem";

export const predeployByContractAddress: Record<
  Address,
  { abi: Abi; name: string }
> = {
  [contracts.superchainTokenBridge.address]: {
    abi: superchainTokenBridgeABI,
    name: "SuperchainTokenBridge",
  },
};
