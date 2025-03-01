import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/stores/useConfig";
import { networkByName } from "@superchain-tools/chains";

interface ChainPickerProps {
  label?: string;
  chainId: number | undefined;
  onChange: (chainId: number) => void;
  placeholder?: string;
}

export const L2ChainPicker = ({
  label,
  chainId,
  onChange,
  placeholder = "Select Chain",
}: ChainPickerProps) => {
  const { networkName } = useConfig();

  const filteredChains = networkByName[networkName].chains;

  return (
    <div className="space-y-2 flex-1">
      {label && <Label>{label}</Label>}
      <Select
        value={chainId?.toString()}
        onValueChange={(value) => onChange(Number(value))}
      >
        <SelectTrigger className="">
          <SelectValue placeholder={placeholder} />
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
