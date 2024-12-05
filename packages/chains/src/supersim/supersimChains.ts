import { supersimL2A, supersimL2B } from "@eth-optimism/viem";
import { defineChain } from "viem";

// TODO: fix in ecosystem package, the contract definitions are wrong (chain Id is 1 not 900)
export const supersimChains = [supersimL2A, supersimL2B].map((chain) => {
  return defineChain({
    ...chain,
    contracts: {
      l1StandardBridge: {
        [chain.sourceId!]: {
          address: chain.contracts.l1StandardBridge[1].address,
        },
      },
    },
  });
});
