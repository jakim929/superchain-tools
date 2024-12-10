import "@rainbow-me/rainbowkit/styles.css";

import { envVars } from "@/envVars";
import { metaMask, walletConnect } from "wagmi/connectors";

import { sourceChains, chains } from "@superchain-tools/chains";
import { createConfig, http } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { devAccount } from "@/connectors/devAccount";

export const defaultDevAccount = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const allChains = [...sourceChains, ...chains];

const transports = Object.fromEntries(
  allChains.map((chain) => {
    return [chain.id, http(chain.rpcUrls.default.http[0])];
  })
);

export const config = createConfig({
  chains: allChains,
  transports,
  connectors: [
    devAccount(defaultDevAccount),
    walletConnect({ projectId: envVars.VITE_WALLET_CONNECT_PROJECT_ID || "" }),
    metaMask(),
  ],
});
