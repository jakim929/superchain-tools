import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/stores/useConfig";
import { sourceChainById, sourceChains } from "@superchain-tools/chains";

export const NavBar = () => {
  const { sourceChainId, setSourceChainId } = useConfig();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 flex items-center px-4 justify-between">
      <Link to="/" className="font-mono text-sm font-bold leading-none">
        SUPERCHAIN TOOLS
      </Link>
      <div className="flex items-center gap-4 select-none">
        <Select
          value={sourceChainId.toString()}
          onValueChange={(value) => setSourceChainId(parseInt(value))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              <span className="font-bold">L1:</span>{" "}
              {sourceChainById[sourceChainId]?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="flex">
            {sourceChains.map((chain) => (
              <SelectItem
                key={chain.id}
                value={chain.id.toString()}
                className="flex-1 w-full"
              >
                <div>{chain.name}</div>
                <div className="text-muted-foreground text-xs">
                  ID: {chain.id}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ConnectButton chainStatus="none" />
      </div>
    </div>
  );
};
