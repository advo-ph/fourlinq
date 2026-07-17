import { ReactNode } from "react";
import QuietNavbar from "./QuietNavbar";
import EditorialFooter from "./EditorialFooter";
import ChatBubble from "@/components/chat/ChatBubble";
import { useAnalytics } from "@/hooks/useAnalytics";

const Layout = ({ children }: { children: ReactNode }) => {
  useAnalytics();
  return (
    // overflow-x-clip: the page body must never scroll sideways (RM5). Wide
    // content (topic rails, tables) gets its own bounded overflow-x-auto; this
    // is the last-line guard so a stray element can't widen the document.
    <div className="min-h-screen flex flex-col bg-[color:var(--canvas)] overflow-x-clip">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <QuietNavbar />
      <main id="main-content" className="flex-1">{children}</main>
      <EditorialFooter />
      <ChatBubble />
    </div>
  );
};

export default Layout;
