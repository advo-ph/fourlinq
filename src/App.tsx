import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CookieBanner from "@/components/shared/CookieBanner";
import ScrollToTop from "@/components/shared/ScrollToTop";

const Products = lazy(() => import("./pages/Products"));
const WindowSystems = lazy(() => import("./pages/WindowSystems"));
const DoorSystems = lazy(() => import("./pages/DoorSystems"));
const SpecialistSystems = lazy(() => import("./pages/SpecialistSystems"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const Warranty = lazy(() => import("./pages/Warranty"));
const Inspiration = lazy(() => import("./pages/Inspiration"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ForArchitects = lazy(() => import("./pages/ForArchitects"));
const DesignTool = lazy(() => import("./pages/DesignTool"));
const WhyUpvc = lazy(() => import("./pages/WhyUpvc"));
const Brand = lazy(() => import("./pages/Brand"));
const Legal = lazy(() => import("./pages/Legal"));
const Admin = lazy(() => import("./pages/Admin"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Care = lazy(() => import("./pages/Care"));
const HowToChoose = lazy(() => import("./pages/HowToChoose"));
const Finishes = lazy(() => import("./pages/Finishes"));

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
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/windows" element={<WindowSystems />} />
            <Route path="/products/doors" element={<DoorSystems />} />
            <Route path="/products/specialist" element={<SpecialistSystems />} />
            <Route path="/whats-new" element={<WhatsNew />} />
            <Route path="/warranty" element={<Warranty />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/for-architects" element={<ForArchitects />} />
            <Route path="/design-tool" element={<DesignTool />} />
            <Route path="/why-upvc" element={<WhyUpvc />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/care" element={<Care />} />
            <Route path="/help-me-choose" element={<HowToChoose />} />
            <Route path="/finishes" element={<Finishes />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
