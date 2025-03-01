import { superchainRegistryChains } from "@/superchain-registry/superchainRegistryChains";
import { viemChainById } from "@/viemChainById";

import {
  interopAlphaChains,
  mainnetChains,
  sepoliaChains,
  supersimChains,
  supersimL1,
} from "@eth-optimism/viem/chains";
import { Chain, mainnet, sepolia } from "viem/chains";

export type Network = {
  name: string;
  sourceChain: Chain;
  chains: Chain[];
};

export const mainnetNetwork = {
  name: "mainnet",
  sourceChain: mainnet,
  chains: mainnetChains,
} as const satisfies Network;

export const sepoliaNetwork = {
  name: "sepolia",
  sourceChain: sepolia,
  chains: sepoliaChains,
} as const satisfies Network;

export const supersimNetwork = {
  name: "supersim",
  sourceChain: supersimL1,
  chains: supersimChains,
} as const satisfies Network;

export const interopAlphaNetwork = {
  name: "interop-alpha",
  sourceChain: sepolia,
  chains: interopAlphaChains,
} as const satisfies Network;

export const networks = [
  mainnetNetwork,
  sepoliaNetwork,
  interopAlphaNetwork,
  supersimNetwork,
];

export const networkByName = networks.reduce((acc, network) => {
  acc[network.name] = network;
  return acc;
}, {} as Record<string, Network>);

export { chainListLastUpdated } from "@/generated/chainList";

export { superchainRegistryChains };

export const superchainRegistrySourceChains: Chain[] = Array.from(
  superchainRegistryChains.reduce((acc, chain) => {
    if (chain.sourceId) {
      acc.add(chain.sourceId);
    }
    return acc;
  }, new Set<number>())
).map((chainId) => viemChainById[chainId]);

export const chains: Chain[] = [
  ...superchainRegistryChains,
  ...interopAlphaChains,
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
