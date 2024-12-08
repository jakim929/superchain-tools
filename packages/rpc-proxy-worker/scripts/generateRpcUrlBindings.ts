import {
  superchainRegistryChains,
  superchainRegistrySourceChains,
} from "@superchain-tools/chains";
import fs from "fs";
import path from "path";
import { getRpcUrlId } from "../src/getRpcUrlId";

// Generate the type definition
const generateBindings = () => {
  const typeLines = [
    ...superchainRegistrySourceChains,
    ...superchainRegistryChains,
  ]
    .map((chain) => `    ${getRpcUrlId(chain)}: string;`)
    .join("\n");

  const output = `export type ChainRpcUrlBindings = {
${typeLines}
};
`;

  // Write to file
  const outputPath = path.resolve(
    __dirname,
    "../src/generated/chainRpcUrlBindings.ts"
  );
  fs.writeFileSync(outputPath, output, "utf-8");
};

generateBindings();
