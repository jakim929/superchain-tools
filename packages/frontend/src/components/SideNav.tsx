import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  LayersIcon,
  CheckCircle,
  ArrowBigLeft,
  ArrowBigRight,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavItem = ({
  to,
  title,
  icon: Icon,
}: {
  to: string;
  title: string;
  icon: React.ComponentType<any>;
}) => {
  const { pathname } = useLocation();
  const isSelected = pathname === to;

  return (
    <Button
      asChild
      variant={isSelected ? "secondary" : "ghost"}
      className={cn("w-full justify-start")}
    >
      <Link to={to}>
        <Icon className="mr-2 h-4 w-4" />
        {title}
      </Link>
    </Button>
  );
};

export const SideNav = () => {
  return (
    <div className="self-stretch border-r bg-background/95 p-4 flex flex-col">
      <nav className="flex flex-col space-y-2">
        <NavItem to="/chains" title="Chains" icon={LayersIcon} />
        <NavItem to="/bridge" title="L1 to L2 Bridge" icon={ArrowBigRight} />
        <NavItem
          to="/l2-to-l1-relayer"
          title="L2 to L1 Relayer"
          icon={ArrowBigLeft}
        />
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
      </nav>
    </div>
  );
};
