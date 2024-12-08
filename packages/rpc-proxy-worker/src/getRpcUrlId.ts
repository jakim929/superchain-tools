import { Chain } from "viem";

// Convert chain name to uppercase snake case
const toSnakeCase = (str: string) =>
  str
    .replace(/[\s-]+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase()
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

export const getRpcUrlId = (chain: Chain) => {
  return `RPC_URL_${chain.id}_${toSnakeCase(chain.name)}`;
};
