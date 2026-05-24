import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import EditorialButton from "@/components/primitives/Button";

/**
 * Home-page promo for the Design Tool. Embeds the live 2D editor at
 * /design-tool?embed=1 so visitors interact with the exact same configurator
 * they'd open on the full page — no decorative loop, no separate preview engine.
 */
const DesignToolPreview = () => (
  <div className="grid lg:grid-cols-[5fr,7fr] gap-12 lg:gap-16 items-center">
    <div>
      <EyebrowHeading eyebrow="Design Tool" level={2}>
        Build your window. Live.
      </EyebrowHeading>
      <p className="mt-8 lg:mt-10 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.6]">
        Pick a system, choose a finish, set the size — watch it render in real time. Same tool architects use when they spec a FourlinQ project.
      </p>
      <div className="mt-10">
        <EditorialButton to="/design-tool" variant="primary" size="md">
          Open the full Design Tool
        </EditorialButton>
      </div>
    </div>

    <div className="relative w-full overflow-hidden rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--canvas-soft)] shadow-sm">
      <iframe
        src="/design-tool?embed=1"
        title="FourlinQ Design Tool preview"
        loading="lazy"
        className="block w-full h-[640px] lg:h-[720px] border-0"
      />
    </div>
  </div>
);

export default DesignToolPreview;
