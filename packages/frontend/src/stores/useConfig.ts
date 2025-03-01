import { create } from "zustand";
import { persist } from "zustand/middleware";

import { sepoliaNetwork, networkByName } from "@superchain-tools/chains";

type Config = {
  networkName: string;

  rpcOverrideByChainId: Record<number, string>;

  setNetworkName: (networkName: string) => void;

  setRpcOverrideByChainId: (chainId: number, rpcUrl: string) => void;
};

export const useConfig = create<Config>()(
  persist(
    (set, get) => ({
      networkName: sepoliaNetwork.name,

      rpcOverrideByChainId: {},

      setNetworkName: (networkName: string) => {
        if (!networkByName[networkName]) {
          throw new Error(`Network with name ${networkName} not supported`);
        }
        set({ networkName });
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
