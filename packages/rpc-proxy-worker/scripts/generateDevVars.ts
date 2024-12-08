import fs from "fs";
import path from "path";

const generateDevVars = () => {
  const secretsPath = path.resolve(__dirname, "../rpc-url-secrets.json");
  const outputPath = path.resolve(__dirname, "../.dev.vars");

  // Read secrets JSON
  const secrets = JSON.parse(fs.readFileSync(secretsPath, "utf-8"));

  // Convert to env vars format, excluding $schema
  const envVars = Object.entries(secrets)
    .filter(([key]) => key !== "$schema")
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // Write to .dev.vars file
  fs.writeFileSync(outputPath, envVars, "utf-8");
};

generateDevVars();
