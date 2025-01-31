import { AppRoutes } from "@/AppRouter";
import { Providers } from "@/Providers";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Providers>
      <Toaster />
      <AppRoutes />
    </Providers>
  );
}

export default App;
