import {
  ArrowLeftRight,
  LayersIcon,
  CheckCircle,
  ArrowBigLeft,
  ArrowBigRight,
  MessageSquare,
  Settings,
  Github,
  FileCode,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SelectSourceChain } from "@/components/SelectSourceChain";

const NavItem = ({
  to,
  title,
  icon: Icon,
}: {
  to: string;
  title: string;
  icon?: React.ComponentType<any>;
}) => {
  const { pathname } = useLocation();
  const isSelected = pathname === to;

  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton asChild isActive={isSelected}>
        <Link to={to}>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const SideNav = () => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SelectSourceChain />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>L1 / L2</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem
                to="/bridge"
                title="L1 to L2 Bridge"
                icon={ArrowBigRight}
              />
              <NavItem
                to="/l2-to-l1-relayer"
                title="L2 to L1 Relayer"
                icon={ArrowBigLeft}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Superchain</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem to="/chains" title="Chains" icon={LayersIcon} />

              <NavItem
                to="/superchainerc20-checks"
                title="SuperchainERC20 Checks"
                icon={CheckCircle}
              />
              <NavItem
                to="/superchain-token-bridge"
                title="Superchain Token Bridge"
                icon={ArrowLeftRight}
              />
              <NavItem
                to="/superchain-message-relayer"
                title="Superchain Message Relayer"
                icon={MessageSquare}
              />
              <NavItem
                to="/contracts"
                title="Superchain Contracts"
                icon={FileCode}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem to="/config" title="RPC Overrides" icon={Settings} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Guides</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem to="/chains" title="Deploying SuperchainERC20" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="ml-2 font-mono text-xs font-bold leading-none"
          >
            SUPERCHAIN
            <br /> TOOLS
          </Link>
          <a
            href="https://github.com/jakim929/superchain-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 flex justify-center items-center hover:bg-gray-200 transition-colors rounded-full"
          >
            <div className="flex items-center gap-2 text-xs">
              <Github className="h-4 w-4" />
            </div>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
