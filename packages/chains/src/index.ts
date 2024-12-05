import { supersimChains } from "@/supersim/supersimChains";
import { superchainRegistryChains } from "@/superchain-registry/superchainRegistryChains";
import { Chain } from "viem/chains";
import { viemChainById } from "@/viemChainById";
export { chainListLastUpdated } from "@/generated/chainList";

export const chains: Chain[] = [
  ...superchainRegistryChains,
  ...supersimChains,
] as const satisfies Chain[];

export const chainById = chains.reduce((acc, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {} as Record<number, Chain>);

export const sourceChains: Chain[] = Array.from(
  chains.reduce((acc, chain) => {
    if (chain.sourceId) {
      acc.add(chain.sourceId);
    }
    return acc;
  }, new Set<number>())
).map((chainId) => viemChainById[chainId]);

export const sourceChainById = sourceChains.reduce((acc, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {} as Record<number, Chain>);
