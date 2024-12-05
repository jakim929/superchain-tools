import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useConfig } from "@/stores/useConfig";
import { sourceChainById } from "@superchain-tools/chains";

export const AvailableNetworks = ({
  requiredSourceChainIds,
}: {
  requiredSourceChainIds: number[];
}) => {
  const { sourceChainId } = useConfig();

  if (requiredSourceChainIds.includes(sourceChainId)) {
    return null;
  }

  const networkNames = requiredSourceChainIds
    .map((id) => sourceChainById[id]?.name ?? `Chain ${id}`)
    .join(", ");

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Unsupported Network</AlertTitle>
      <AlertDescription>
        This feature is only available on: {networkNames}
      </AlertDescription>
    </Alert>
  );
};
