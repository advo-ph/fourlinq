import EditorialButton from "@/components/primitives/Button";
import AccentStripe from "@/components/primitives/AccentStripe";

const BrandCTA = () => (
  <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
    <div>
      <AccentStripe width="sm" color="accent" className="mb-6" />
      <p className="eyebrow text-white/60 mb-6">A lifetime of satisfaction</p>
      <h2 className="font-serif font-normal tracking-tight text-white text-h2 lg:text-h1 leading-[1.1]">
        Built to last. Backed by a 10-year warranty.
      </h2>
    </div>
    <div className="lg:pl-8">
      <p className="text-body-lg text-white/80 max-w-[34rem] leading-[1.6]">
        FourlinQ makes uPVC windows and doors that disappear into the architecture and stay there. Eleven finishes. Four showrooms. One promise. The weather outside is the only weather that matters.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <EditorialButton to="/brand" variant="primary" size="md">
          Our Story
        </EditorialButton>
        <EditorialButton to="/brand#showrooms" variant="ghost" size="md" className="text-white hover:text-white">
          Visit a Showroom
        </EditorialButton>
      </div>
    </div>
  </div>
);

export default BrandCTA;
