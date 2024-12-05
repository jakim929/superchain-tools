import { NavBarLayout } from "@/layouts/NavBarLayout";
import { BridgePage } from "@/pages/BridgePage";
import { ChainsPage } from "@/pages/ChainsPage";
import { L2ToL1RelayerPage } from "@/pages/L2ToL1RelayerPage";
import { SuperchainERC20ChecksPage } from "@/pages/SuperchainERC20ChecksPage";
import { SuperchainTokenBridgePage } from "@/pages/SuperchainTokenBridgePage";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <NavBarLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/bridge" replace />,
      },
      {
        path: "/bridge",
        element: <BridgePage />,
      },
      {
        path: "/chains",
        element: <ChainsPage />,
      },
      {
        path: "/superchainerc20-checks",
        element: <SuperchainERC20ChecksPage />,
      },
      {
        path: "/l2-to-l1-relayer",
        element: <L2ToL1RelayerPage />,
      },
      {
        path: "/superchain-token-bridge",
        element: <SuperchainTokenBridgePage />,
      },
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
