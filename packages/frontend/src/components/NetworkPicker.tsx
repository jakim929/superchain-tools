import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sourceChains } from "@superchain-tools/chains";
import { useConfig } from "@/stores/useConfig";
import { networks } from "@superchain-tools/chains";

interface NetworkPickerProps {
  allowedNetworkNames?: string[];
}

export const NetworkPicker = ({ allowedNetworkNames }: NetworkPickerProps) => {
  const { networkName, setNetworkName } = useConfig();

  return (
    <div className="flex-1 space-y-2">
      <label className="text-sm font-medium">Select Network</label>
      <Select
        value={networkName}
        onValueChange={(value) => setNetworkName(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {networks
            .filter(
              (network) =>
                !allowedNetworkNames ||
                allowedNetworkNames.includes(network.name)
            )
            .map((network) => (
              <SelectItem key={network.name} value={network.name}>
                {network.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
