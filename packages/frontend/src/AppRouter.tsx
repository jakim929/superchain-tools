import { NavBarLayout } from "@/layouts/NavBarLayout";
import { BridgePage } from "@/pages/BridgePage";
import { ChainsPage } from "@/pages/ChainsPage";
import { ConfigPage } from "@/pages/ConfigPage";
import { L2ToL1RelayerPage } from "@/pages/L2ToL1RelayerPage";
import { MultisendBridgePage } from "@/pages/MultisendBridgePage";
import { SuperchainContractPage } from "@/pages/SuperchainContractPage";
import { SuperchainERC20ChecksPage } from "@/pages/SuperchainERC20ChecksPage";
import { SuperchainETHBridgePage } from "@/pages/SuperchainETHBridgePage";
import { SuperchainMessageRelayer } from "@/pages/SuperchainMessageRelayer";
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
        path: "/multisend-bridge",
        element: <MultisendBridgePage />,
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
        path: "/superchain-eth-bridge",
        element: <SuperchainETHBridgePage />,
      },
      {
        path: "/superchain-token-bridge",
        element: <SuperchainTokenBridgePage />,
      },
      {
        path: "/superchain-message-relayer",
        element: <SuperchainMessageRelayer />,
      },
      {
        path: "/config",
        element: <ConfigPage />,
      },
      {
        path: "/contracts",
        element: <SuperchainContractPage />,
      },
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
