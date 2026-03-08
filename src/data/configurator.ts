export interface ProductType {
  id: string;
  name: string;
  icon: string;
}

export interface FinishOption {
  id: string;
  name: string;
  color: string;
}

export interface GlassOption {
  id: string;
  name: string;
  opacity: number;
  tint: string;
}

export const productTypes: ProductType[] = [
  { id: "casement", name: "Casement", icon: "casement" },
  { id: "sliding", name: "Sliding", icon: "sliding" },
  { id: "fixed", name: "Fixed", icon: "fixed" },
  { id: "bifold", name: "Bifold", icon: "bifold" },
];

export const finishOptions: FinishOption[] = [
  { id: "matte-black", name: "Matte Black", color: "#1A1A1A" },
  { id: "dark-grey", name: "Dark Grey", color: "#4A4A4A" },
  { id: "bronze", name: "Bronze", color: "#8B6914" },
  { id: "sand", name: "Sand", color: "#C2B280" },
  { id: "white", name: "White", color: "#F5F5F0" },
  { id: "anthracite", name: "Anthracite", color: "#383E42" },
];

export const glassOptions: GlassOption[] = [
  { id: "clear", name: "Clear", opacity: 0.1, tint: "rgba(200,220,240,0.1)" },
  { id: "frosted", name: "Frosted", opacity: 0.5, tint: "rgba(255,255,255,0.6)" },
  { id: "tinted", name: "Tinted", opacity: 0.35, tint: "rgba(80,70,50,0.35)" },
];

export const defaultConfig = {
  type: "casement",
  finish: "white",
  glass: "clear",
  width: 1200,
  height: 1400,
};

export const sizeConstraints = {
  width: { min: 400, max: 3000, step: 50 },
  height: { min: 400, max: 3000, step: 50 },
};
