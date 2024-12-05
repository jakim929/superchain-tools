import "@rainbow-me/rainbowkit/styles.css";

import { envVars } from "@/envVars";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { sourceChains, chains } from "@superchain-tools/chains";

function removeDups<T>(
  names: T[],
  keyFn: (item: T) => any = (item) => item
): T[] {
  const unique: Map<any, T> = new Map();
  names.forEach((item) => {
    const key = keyFn(item);
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });
  return Array.from(unique.values());
}

export const config = getDefaultConfig({
  appName: "Superchain Tools",
  projectId: envVars.VITE_WALLET_CONNECT_PROJECT_ID,
  // @ts-expect-error
  chains: [...sourceChains, ...chains],
});
