import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatBubble from "@/components/chat/ChatBubble";
import CookieBanner from "@/components/shared/CookieBanner";

const Products = lazy(() => import("./pages/Products"));
const DesignTool = lazy(() => import("./pages/DesignTool"));
const WhyUpvc = lazy(() => import("./pages/WhyUpvc"));
const Brand = lazy(() => import("./pages/Brand"));
const Legal = lazy(() => import("./pages/Legal"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-muted-foreground text-sm">Loading…</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/design-tool" element={<DesignTool />} />
            <Route path="/why-upvc" element={<WhyUpvc />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ChatBubble />
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
