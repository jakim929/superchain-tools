import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sepolia } from "viem/chains";
import { sourceChainById } from "@superchain-tools/chains";

type Config = {
  sourceChainId: number;
  rpcOverrideByChainId: Record<number, string>;

  setSourceChainId: (id: number) => void;

  setRpcOverrideByChainId: (chainId: number, rpcUrl: string) => void;
};

export const useConfig = create<Config>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: "superchain-tools-storage",
    }
  )
);
