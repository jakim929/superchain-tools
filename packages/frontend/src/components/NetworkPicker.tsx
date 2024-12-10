import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sourceChains } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";

interface NetworkPickerProps {
  allowedChainIds?: number[];
}

export const NetworkPicker = ({ allowedChainIds }: NetworkPickerProps) => {
  const { sourceChainId, setSourceChainId } = useConfig();

  const filteredChains = allowedChainIds
    ? sourceChains.filter((chain) => allowedChainIds.includes(chain.id))
    : sourceChains;

  return (
    <div className="flex-1 space-y-2">
      <label className="text-sm font-medium">Select Network</label>
      <Select
        value={sourceChainId?.toString()}
        onValueChange={(value) => setSourceChainId(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {filteredChains.map((chain) => (
            <SelectItem key={chain.id} value={chain.id.toString()}>
              {chain.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
