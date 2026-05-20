import { ReactNode } from "react";
import QuietNavbar from "./QuietNavbar";
import EditorialFooter from "./EditorialFooter";
import { useAnalytics } from "@/hooks/useAnalytics";

const Layout = ({ children }: { children: ReactNode }) => {
  useAnalytics();
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--canvas)]">
      <QuietNavbar />
      <main className="flex-1">{children}</main>
      <EditorialFooter />
    </div>
  );
};

export default Layout;
