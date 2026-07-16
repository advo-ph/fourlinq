import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import {
  type ProfileFeature,
  UPVC_PROFILE_FEATURES,
} from "@/data/fourlinq-data";

const proofNumber = [4, 6, 1];

const systemProof = proofNumber
  .map((number) => UPVC_PROFILE_FEATURES.find((feature) => feature.number === number))
  .filter((feature): feature is ProfileFeature => feature !== undefined);

const SystemProof = () => (
  <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20">
    <figure className="lg:col-span-7">
      <div className="aspect-[3/2] overflow-hidden bg-[#f3f1ec]">
        <img
          src="/images/upvc-profile-studio.webp"
          alt="Studio illustration of a white multi-chamber uPVC profile section"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className="mt-3 text-caption text-[color:var(--ink-muted)]">
        Illustrative view of a multi-chamber uPVC profile.
      </figcaption>
    </figure>

    <div className="lg:col-span-5 lg:pt-2">
      <EyebrowHeading eyebrow="uPVC system proof" level={2}>
        Performance starts inside the frame.
      </EyebrowHeading>
      <p className="mt-7 max-w-[34rem] text-body leading-[1.65] text-[color:var(--ink-secondary)] lg:text-body-lg">
        The material choice is only the beginning. The profile, reinforcement,
        seals, and glazing work together as one fabricated system.
      </p>

      <ul
        aria-label="uPVC system features"
        className="mt-9 border-b border-[color:var(--rule-strong)]"
      >
        {systemProof.map((feature) => (
          <li
            key={feature.number}
            className="border-t border-[color:var(--rule-strong)] py-5"
          >
            <h3 className="font-serif text-h5 font-normal tracking-tight text-[color:var(--ink-primary)]">
              {feature.label}
            </h3>
            <p className="mt-2 text-body-sm leading-[1.6] text-[color:var(--ink-secondary)]">
              {feature.descriptionVerbatim}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-7 max-w-[32rem] text-body-sm leading-[1.6] text-[color:var(--ink-secondary)]">
        Need larger spans or slimmer sightlines? Aluminium remains a separate
        material choice, including thermal-break and regular systems.
      </p>

      <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <EditorialButton to="/why-upvc" variant="primary" size="sm">
          Explore uPVC
        </EditorialButton>
        <FeatureLink to="/aluminium">Explore aluminium</FeatureLink>
      </div>
    </div>
  </div>
);

export default SystemProof;
