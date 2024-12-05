import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const SuperchainMessageRelayer = () => {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <Alert variant="default">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Under Construction</AlertTitle>
        <AlertDescription>
          The Superchain Message Relayer page is currently under development.
        </AlertDescription>
      </Alert>
    </div>
  );
};
