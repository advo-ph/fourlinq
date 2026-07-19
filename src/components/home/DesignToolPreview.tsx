import { useEffect, useRef, useState } from "react";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import EditorialButton from "@/components/primitives/Button";
import { designToolFrameHeight } from "@/lib/embed";

/**
 * Home-page promo for the Design Tool. Embeds the live 2D editor at
 * /design-tool?embed=1 so visitors interact with the exact same configurator
 * they'd open on the full page — no decorative loop, no separate preview engine.
 */
const DesignToolPreview = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(720);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const nextHeight = designToolFrameHeight(event.data);
      if (nextHeight !== null) setFrameHeight(nextHeight);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="grid lg:grid-cols-[5fr,7fr] gap-12 lg:gap-16 items-center">
      <div>
        <EyebrowHeading eyebrow="Design Tool" level={2}>
          Sketch a visual brief. Live.
        </EyebrowHeading>
        <p className="mt-8 lg:mt-10 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.6]">
          Pick a catalog name, material, finish, glass, and approximate size to update an illustrative preview. FourlinQ still has to confirm compatibility, dimensions, ratings, availability, and price.
        </p>
        <div className="mt-10">
          <EditorialButton to="/design-tool" variant="primary" size="md">
            Open the full Design Tool
          </EditorialButton>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--canvas-soft)] shadow-sm">
        <iframe
          ref={frameRef}
          src="/design-tool?embed=1"
          title="FourlinQ Design Tool preview"
          loading="lazy"
          className="block min-h-[720px] w-full border-0 transition-[height] duration-300 ease-marvin"
          style={{ height: frameHeight }}
        />
      </div>
    </div>
  );
};

export default DesignToolPreview;
