import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, HardHat } from "lucide-react";

export const ConstructionAlert = () => {
  return (
    <Alert>
      <HardHat className="h-4 w-4" />
      <AlertTitle>Under construction</AlertTitle>
      <AlertDescription>
        This page is still a work in progress.
      </AlertDescription>
    </Alert>
  );
};
