import { chainList } from "@/generated/chainList";
import { chainListItemToChain } from "@/superchain-registry/chainListItemToChain";

export const superchainRegistryChains = chainList.map(chainListItemToChain);
