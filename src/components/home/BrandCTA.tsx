import EditorialButton from "@/components/primitives/Button";
import AccentStripe from "@/components/primitives/AccentStripe";
import { BRAND } from "@/data/fourlinq-data";

const BrandCTA = () => (
  <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:gap-24 lg:items-end">
    <div className="max-w-[44rem]">
      <AccentStripe width="sm" color="accent" className="mb-5 lg:mb-6" />
      {/* Sizes come from the type scale, not arbitrary text-[…] values. The
          previous 2.75/3.75/5.25rem (44/60/84px) sat off Marvin's ladder at
          every breakpoint — ad-hoc sizes are how a calibrated scale rots.
          Explicit leading/tracking stay: this accent serif is set tighter
          than the token's defaults by design. */}
      <h2 className="font-promise font-medium tracking-normal text-white text-h3 leading-[1.02] sm:text-h2 lg:text-display">
        {BRAND.promise}
      </h2>
    </div>
    <div className="flex flex-wrap items-center gap-4 lg:justify-end">
      <EditorialButton to="/brand" variant="primary" size="md" className="w-auto min-w-[12rem]">
        Our Story
      </EditorialButton>
      <EditorialButton to="/brand#showrooms" variant="ghost" size="md" className="w-auto text-white hover:text-white">
        Visit a Showroom
      </EditorialButton>
    </div>
  </div>
);

export default BrandCTA;
