import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/shared/AnimatedSection";

const DesignToolTeaser = () => {
  return (
    <AnimatedSection className="py-20 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-4">
            Visualize Before You Build
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Use our interactive configurator to select your window or door type, choose a finish color, 
            pick your glass, and set exact dimensions — all with a live preview that updates in real time. 
            Save your configuration and bring it to your consultation.
          </p>
          <Button asChild size="lg" className="font-medium">
            <Link to="/design-tool">Open Design Tool</Link>
          </Button>
        </div>

        {/* Stylized Mockup */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="grid grid-cols-2 gap-2">
                {["#1A1A1A", "#4A4A4A", "#8B6914", "#C2B280", "#F5F5F0", "#383E42"].map((c) => (
                  <div
                    key={c}
                    className="w-8 h-8 rounded-md border border-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-2 bg-primary/20 rounded-full" />
              <div className="h-2 bg-primary/20 rounded-full w-3/4" />
            </div>
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 120 160" className="w-28 h-36">
                <rect x="10" y="10" width="100" height="140" rx="3" fill="none" stroke="hsl(213,45%,20%)" strokeWidth="4" />
                <line x1="60" y1="10" x2="60" y2="150" stroke="hsl(213,45%,20%)" strokeWidth="2" />
                <rect x="14" y="14" width="42" height="132" rx="1" fill="hsl(213,45%,20%)" fillOpacity="0.05" />
                <rect x="64" y="14" width="42" height="132" rx="1" fill="hsl(213,45%,20%)" fillOpacity="0.05" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default DesignToolTeaser;
