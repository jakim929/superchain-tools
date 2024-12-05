import { NavBar } from "@/components/NavBar";
import { SideNav } from "@/components/SideNav";
import { Outlet } from "react-router-dom";

export const NavBarLayout = () => {
  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        <SideNav />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
