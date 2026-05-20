import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";

const EditorialIntro = () => (
  <div className="grid lg:grid-cols-[5fr,6fr] gap-12 lg:gap-20 items-center">
    <div>
      <EyebrowHeading eyebrow="The FourlinQ approach" level={2}>
        Custom-made for the homes you actually live in.
      </EyebrowHeading>
      <div className="mt-8 lg:mt-10 space-y-5 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[36rem]">
        <p>
          Every FourlinQ system is engineered for the Philippines —
          for the heat, the humidity, the salt air along the coast,
          and the storms that test what a house is made of.
        </p>
        <p>
          We make uPVC windows and doors that are quiet, thermally
          efficient, and corrosion-resistant. They open easily.
          They close cleanly. They are designed to disappear into
          the architecture of a home and stay that way for decades.
        </p>
      </div>
      <div className="mt-10">
        <FeatureLink to="/why-upvc">Why uPVC</FeatureLink>
      </div>
    </div>
    <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden bg-neutral-100">
      <img
        src="/images/wp-export/FQC-Project-17.jpg"
        alt="Interior with FourlinQ casement windows looking out to garden"
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

export default EditorialIntro;
