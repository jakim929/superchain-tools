import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/stores/useConfig";
import { sourceChainById, sourceChains } from "@superchain-tools/chains";

export const SelectSourceChain = () => {
  const { sourceChainId, setSourceChainId } = useConfig();

  return (
    <Select
      value={sourceChainId.toString()}
      onValueChange={(value) => setSourceChainId(parseInt(value))}
    >
      <SelectTrigger className="select-none">
        <SelectValue>
          <span className="font-bold">L1 Network:</span>{" "}
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
            <div className="text-muted-foreground text-xs">ID: {chain.id}</div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
