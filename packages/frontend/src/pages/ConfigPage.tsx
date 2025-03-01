import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { networks } from "@superchain-tools/chains";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/stores/useConfig";
import { X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useState } from "react";

// Add URL schema
const urlSchema = z.string().url().or(z.literal(""));

interface UrlInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const UrlInput = ({
  id,
  value,
  onChange,
  placeholder,
  onClear,
}: UrlInputProps) => {
  const [error, setError] = useState<boolean>(false);

  const handleChange = (newValue: string) => {
    const result = urlSchema.safeParse(newValue);
    setError(!result.success && newValue !== "");
    onChange(newValue);
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`font-mono text-sm ${error ? "border-red-500" : ""}`}
      />
      {value && onClear && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="h-10 w-10 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const ConfigPage = () => {
  const {
    rpcOverrideByChainId,
    setRpcOverrideByChainId,
    networkName,
    setNetworkName,
  } = useConfig();

  const handleClearOverride = (chainId: number) => {
    setRpcOverrideByChainId(chainId, "");
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-4xl font-bold">RPC Overrides</CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          Override the default RPC URLs here if needed. Some default RPC URLs
          have rate limits or don't support calls like{" "}
          <span className="font-mono bg-slate-100 font-2xs px-1.5 py-0.5 rounded-md text-slate-700">
            debug_traceCall
          </span>
          . All changes are <b>only stored locally in your browser</b>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mt-4">
        <div className="flex items-center gap-4">
          <Label
            htmlFor="source-chain"
            className="text-sm text-muted-foreground w-32"
          >
            Network
          </Label>
          <Select
            value={networkName}
            onValueChange={(value) => setNetworkName(value)}
          >
            <SelectTrigger id="source-chain" className="w-[240px]">
              <SelectValue placeholder="Select source network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => {
                const hasOverride =
                  network.chains.some(
                    (chain) => !!rpcOverrideByChainId[chain.id]
                  ) || !!rpcOverrideByChainId[network.sourceChain.id];
                return (
                  <SelectItem key={network.name} value={network.name}>
                    <div className="w-[180px]  flex-1 flex items-center justify-between">
                      <div>{network.name}</div>
                      {hasOverride && (
                        <div className="flex items-center text-muted-foreground gap-1 text-xs">
                          <Wrench className="h-3 w-3" />
                          edited
                        </div>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {networks.map((network) => (
          <div key={network.sourceChain.id} className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              {network.sourceChain.name}
            </h3>
            <div className="grid grid-cols-[200px,1fr] gap-4 items-center mb-4">
              <Label
                htmlFor={`chain-${network.sourceChain.id}`}
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                {network.sourceChain.name} ({network.sourceChain.id})
                {rpcOverrideByChainId[network.sourceChain.id] && (
                  <Wrench className="h-3 w-3" />
                )}
              </Label>
              <UrlInput
                id={`chain-${network.sourceChain.id}`}
                placeholder={network.sourceChain.rpcUrls.default.http[0]}
                value={rpcOverrideByChainId[network.sourceChain.id] || ""}
                onChange={(value) =>
                  setRpcOverrideByChainId(network.sourceChain.id, value)
                }
                onClear={() => handleClearOverride(network.sourceChain.id)}
              />
            </div>
            <hr className="my-4 border-t border-gray-300" />
            <div className="space-y-2">
              {network.chains.map((chain) => (
                <div
                  key={chain.id}
                  className="grid grid-cols-[200px,1fr] gap-4 items-center"
                >
                  <Label
                    htmlFor={`chain-${chain.id}`}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    {chain.name} ({chain.id})
                    {rpcOverrideByChainId[chain.id] && (
                      <Wrench className="h-3 w-3" />
                    )}
                  </Label>
                  <UrlInput
                    id={`chain-${chain.id}`}
                    placeholder={chain.rpcUrls.default.http[0]}
                    value={rpcOverrideByChainId[chain.id] || ""}
                    onChange={(value) =>
                      setRpcOverrideByChainId(chain.id, value)
                    }
                    onClear={() => handleClearOverride(chain.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
