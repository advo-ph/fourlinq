import EditorialButton from "@/components/primitives/Button";
import AccentStripe from "@/components/primitives/AccentStripe";
import { BRAND } from "@/data/fourlinq-data";

const BrandCTA = () => (
  <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:gap-24 lg:items-end">
    <div className="max-w-[44rem]">
      <AccentStripe width="sm" color="accent" className="mb-5 lg:mb-6" />
      <h2 className="font-promise font-medium tracking-normal text-white text-[2.75rem] leading-[1.02] sm:text-[3.75rem] lg:text-[5.25rem]">
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
