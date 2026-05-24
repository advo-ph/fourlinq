import EditorialButton from "@/components/primitives/Button";
import AccentStripe from "@/components/primitives/AccentStripe";

const BrandCTA = () => (
  <div className="grid lg:grid-cols-[1.2fr,1fr] gap-10 lg:gap-24 items-end">
    <div>
      <AccentStripe width="sm" color="accent" className="mb-6" />
      <h2 className="font-serif font-normal tracking-tight text-white text-h3 lg:text-h1 leading-[1.05]">
        Built to last. Backed in writing.
      </h2>
    </div>
    <div className="flex flex-wrap items-center gap-5 lg:justify-end">
      <EditorialButton to="/brand" variant="primary" size="md">
        Our Story
      </EditorialButton>
      <EditorialButton to="/brand#showrooms" variant="ghost" size="md" className="text-white hover:text-white">
        Visit a Showroom
      </EditorialButton>
    </div>
  </div>
);

export default BrandCTA;
