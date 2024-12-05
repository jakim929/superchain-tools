import { NavBar } from "@/components/NavBar";
import { SideNav } from "@/components/SideNav";
import { Outlet } from "react-router-dom";

export const NavBarLayout = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="flex h-[calc(100vh-4rem)]">
        <SideNav />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
