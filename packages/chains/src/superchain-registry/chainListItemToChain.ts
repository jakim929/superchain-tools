import { ChainListItem } from "@/superchain-registry/fetchChainList";
import { Chain, mainnet, sepolia } from "viem/chains";
import { viemChainById } from "@/viemChainById";
import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";
import { sourceChainIdByChainId } from "@/superchain-registry/sourceChainIdByChainId";

export const chainListItemToChain = (config: ChainListItem): Chain => {
  const stringId = config.identifier.split("/")[1] as string;

  const isMainnet = config.parent.chain === "mainnet";

  if (viemChainById[config.chainId]) {
    const viemChain = viemChainById[config.chainId];
    if (viemChain.sourceId) {
      return viemChain;
    }

    console.log(
      `No sourceId for chain ${viemChain.name} with id ${viemChain.id}. Viem definition should be updated. Defaulting to Superchain Registry values`
    );

    return defineChain({
      ...viemChain,
      id: config.chainId,
      sourceId: sourceChainIdByChainId[config.chainId],
    });
  }

  // TODO: Does not support custom gas tokens
  return defineChain({
    ...chainConfig,
    id: config.chainId,
    name: stringId,
    sourceId: isMainnet ? mainnet.id : sepolia.id,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: "Blockscout",
        url: config.explorers[0] as string,
      },
    },
    rpcUrls: {
      default: {
        http: [config.rpc[0] as string],
      },
    },
    multicall: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  });
};
