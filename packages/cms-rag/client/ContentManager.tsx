/**
 * Top-level admin tab. Renders one EntityPanel per descriptor returned by
 * /_entities (or per descriptor passed in directly).
 *
 *   <ContentManager api={api} />                          // auto-discover entities
 *   <ContentManager api={api} entities={[...]} />         // explicit list
 */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { CmsRagApi, EntityDescriptor } from "./api.js";
import { EntityPanel } from "./EntityPanel.js";

export interface CustomPanel {
  kind: string;
  labelPlural: string;
  render: () => React.ReactNode;
}

interface Props {
  api: CmsRagApi;
  /** Optional explicit list of entities (overrides /_entities discovery). */
  entities?: EntityDescriptor[];
  /** Optional per-entity row renderer overrides, keyed by kind. */
  rowRenderers?: Record<string, (row: Record<string, unknown>) => React.ReactNode>;
  /** Custom panels that replace the auto-generated EntityPanel for specific kinds. */
  customPanels?: CustomPanel[];
  /** Kinds to hide from the tab bar (e.g. when a customPanel takes over). */
  hideKinds?: string[];
}

export function ContentManager({ api, entities: explicit, rowRenderers, customPanels = [], hideKinds = [] }: Props) {
  const [entities, setEntities] = useState<EntityDescriptor[] | null>(explicit ?? null);
  const [activeKind, setActiveKind] = useState<string | null>(explicit?.[0]?.kind ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (explicit) return;
    api.listEntities()
      .then((list) => {
        setEntities(list);
        if (list.length) setActiveKind(list[0].kind);
      })
      .catch((e) => setError(String(e)));
  }, [api, explicit]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!entities) return <div className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" /></div>;

  const visibleEntities = entities.filter((e) => !hideKinds.includes(e.kind));
  type Tab = { kind: string; labelPlural: string; isCustom: boolean };
  const allTabs: Tab[] = [
    ...visibleEntities.map((e) => ({ kind: e.kind, labelPlural: e.labelPlural, isCustom: false })),
    ...customPanels.map((p) => ({ kind: p.kind, labelPlural: p.labelPlural, isCustom: true })),
  ];
  if (allTabs.length === 0) return <p className="text-sm text-muted-foreground">No content registered.</p>;

  const currentKind = activeKind && allTabs.some((t) => t.kind === activeKind) ? activeKind : allTabs[0].kind;
  const customPanel = customPanels.find((p) => p.kind === currentKind);
  const activeEntity = visibleEntities.find((e) => e.kind === currentKind);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {allTabs.map((t) => (
          <button
            key={t.kind}
            onClick={() => setActiveKind(t.kind)}
            className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${
              t.kind === currentKind ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {t.labelPlural}
          </button>
        ))}
      </div>

      {customPanel
        ? customPanel.render()
        : activeEntity
        ? <EntityPanel api={api} entity={activeEntity} renderRow={rowRenderers?.[activeEntity.kind]} />
        : null}
    </div>
  );
}
