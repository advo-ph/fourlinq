import { PROFILE_SYSTEMS, type Material } from "@/data/fourlinq-data";

/**
 * The profile systems behind a material line.
 *
 * Imie supplied these herself on 2026-05-31 ("uPVC profiles systems: a. Veka -
 * German Brand, b. Skyframe - Chinese Brand" / "Aluminium profile systems: a.
 * Standard / Regular Systems - wall thickness 1.2mm to 3.0mm, b. Alu Slim
 * Systems"), and the team told her the same day that they had been added. They
 * were added to PROFILE_SYSTEMS in fourlinq-data.ts and then rendered nowhere —
 * this component is what makes that claim true.
 *
 * Data-only; every string comes from PROFILE_SYSTEMS. Nothing invented.
 */
const ProfileSystems = ({ material }: { material: Material }) => {
  const list = PROFILE_SYSTEMS.filter((p) => p.material === material);
  if (!list.length) return null;

  return (
    <ul className="border-t border-[color:var(--rule-strong)]">
      {list.map((p) => (
        <li
          key={p.name}
          className="grid grid-cols-1 sm:grid-cols-12 gap-x-8 gap-y-2 border-b border-[color:var(--rule-soft)] py-6 lg:py-8"
        >
          <h3 className="sm:col-span-4 font-serif font-normal tracking-tight text-h5 text-[color:var(--ink-primary)] leading-[1.2]">
            {p.name}
          </h3>
          <p className="sm:col-span-8 self-center text-body text-[color:var(--ink-secondary)] leading-[1.6]">
            {p.origin ?? p.note}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default ProfileSystems;
