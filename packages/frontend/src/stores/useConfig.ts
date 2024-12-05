import { create } from "zustand";
import { sepolia } from "viem/chains";
import { sourceChainById } from "@superchain-tools/chains";

type Config = {
  sourceChainId: number;
  rpcOverrideByChainId: Record<number, string>;

  setSourceChainId: (id: number) => void;

  setRpcOverrideByChainId: (chainId: number, rpc: string) => void;
};

export const useConfig = create<Config>((set, get) => ({
  sourceChainId: sepolia.id,
  rpcOverrideByChainId: {},

  setSourceChainId: (id: number) => {
    if (!sourceChainById[id]) {
      throw new Error(`Source chain with id ${id} not supported`);
    }
    set({ sourceChainId: id });
  },

  setRpcOverrideByChainId: (chainId: number, rpcUrl: string) => {
    set({
      rpcOverrideByChainId: {
        ...get().rpcOverrideByChainId,
        [chainId]: rpcUrl,
      },
    });
  },
}));
