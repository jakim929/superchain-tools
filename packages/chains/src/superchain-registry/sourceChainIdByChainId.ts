import { chainList } from "@/generated/chainList";
import { mainnet, sepolia } from "viem/chains";

const chainIdByParentChainName = {
  mainnet: mainnet.id,
  sepolia: sepolia.id,
} as const;

export const sourceChainIdByChainId = chainList.reduce((acc, chain) => {
  const parentChainName = chain.parent.chain;
  acc[chain.chainId] = chainIdByParentChainName[parentChainName];
  return acc;
}, {} as Record<number, number>);
