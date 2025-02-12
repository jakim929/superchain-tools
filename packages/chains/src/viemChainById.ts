import { interopAlphaChains } from "@/interop-alpha/interopAlphaChains";
import { supersimChains } from "@/supersim/supersimChains";
import { supersimL1 } from "@eth-optimism/viem";
import * as chains from "viem/chains";
import { Chain } from "viem/chains";

export const viemChainById = {
  ...[
    ...interopAlphaChains,
    ...supersimChains,
    supersimL1,
    ...Object.values(chains),
  ].reduce((acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  }, {} as Record<number, Chain>),
};
