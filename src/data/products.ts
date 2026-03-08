export type ProductCategory = "windows" | "doors" | "systems";

export interface ProductFinish {
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  image: string;
  specs: string[];
  finishes: ProductFinish[];
  glassOptions: string[];
}

export const productFinishes: ProductFinish[] = [
  { name: "Matte Black", color: "#1A1A1A" },
  { name: "Dark Grey", color: "#4A4A4A" },
  { name: "Bronze", color: "#8B6914" },
  { name: "Sand", color: "#C2B280" },
  { name: "White", color: "#F5F5F0" },
  { name: "Anthracite", color: "#383E42" },
];

export const products: Product[] = [
  {
    id: "casement-70",
    name: "Casement 70 Series",
    category: "windows",
    description: "Our flagship casement window system featuring a 70mm multi-chamber profile for superior thermal insulation. Ideal for bedrooms, living rooms, and offices across the Philippines where climate control and noise reduction are essential.",
    shortDescription: "Multi-chamber casement with superior thermal and acoustic performance.",
    image: "/images/wp-export/Casement-Window.jpg",
    specs: [
      "70mm multi-chamber profile",
      "Double-sealed weatherstrip",
      "Up to 28mm glazing capacity",
      "Uw value: 1.3 W/m²K",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Frosted Privacy", "Tinted Bronze"],
  },
  {
    id: "sliding-85",
    name: "Sliding 85 Series",
    category: "windows",
    description: "Premium sliding window engineered for wide openings and panoramic views. The 85mm profile provides excellent structural integrity while the smooth glide mechanism ensures effortless operation even in large sizes.",
    shortDescription: "Wide-opening sliding system for panoramic views and effortless operation.",
    image: "/images/wp-export/Sliding-Window.jpg",
    specs: [
      "85mm reinforced profile",
      "Tandem roller system",
      "Up to 36mm glazing capacity",
      "Anti-lift security block",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "fixed-panel",
    name: "Fixed Panorama Panel",
    category: "windows",
    description: "Floor-to-ceiling fixed glass panel designed for maximum light and unobstructed views. Perfect for modern Philippine homes seeking to blend indoor and outdoor living while maintaining full climate control.",
    shortDescription: "Floor-to-ceiling fixed glazing for maximum light and views.",
    image: "/images/wp-export/Windows.jpg",
    specs: [
      "70mm structural profile",
      "Up to 44mm triple glazing",
      "Structural silicone option",
      "Maximum panel: 2.4m × 3.0m",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "french-door",
    name: "French Door Classic",
    category: "doors",
    description: "Elegant double-leaf French door system bringing European sophistication to Philippine homes. Features multi-point locking for security and a low threshold option for seamless indoor-outdoor transitions.",
    shortDescription: "Classic double-leaf French doors with multi-point security locking.",
    image: "/images/wp-export/Door-1.jpg",
    specs: [
      "70mm reinforced door profile",
      "Multi-point espagnolette lock",
      "Low threshold (20mm) option",
      "Up to 36mm glazing",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Laminated Safety", "Decorative Lead"],
  },
  {
    id: "sliding-door",
    name: "Lift & Slide Terrace",
    category: "doors",
    description: "Our premium lift-and-slide door system handles panels up to 200kg with fingertip ease. Designed for luxury Philippine residences, resorts, and condominiums seeking expansive openings with uncompromised weatherproofing.",
    shortDescription: "Heavy-duty lift-and-slide for expansive terrace openings.",
    image: "/images/wp-export/Sliding-Door.jpg",
    specs: [
      "85mm heavy-duty profile",
      "Lift-and-slide mechanism (200kg)",
      "Triple weatherseal system",
      "Up to 44mm glazing",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "bifold-system",
    name: "Bifold Horizon",
    category: "doors",
    description: "Multi-panel folding door system that opens entire walls to the outdoors. Available in 2 to 7 panel configurations, the Bifold Horizon transforms living spaces and is engineered to withstand Philippine typhoon conditions.",
    shortDescription: "Multi-panel folding system that opens entire walls to the outdoors.",
    image: "/images/wp-export/Slide-and-Fold.jpg",
    specs: [
      "76mm folding profile",
      "2–7 panel configurations",
      "Top-hung or bottom-rolling",
      "Typhoon-rated hardware",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "entrance-system",
    name: "Entrance Prestige",
    category: "systems",
    description: "Complete entrance door system with reinforced steel core and premium hardware. Combines the aesthetic versatility of uPVC with the security demands of main entry doors for Philippine homes and commercial properties.",
    shortDescription: "Reinforced entrance system with steel core and premium hardware.",
    image: "/images/wp-export/Door-5.jpg",
    specs: [
      "82mm entrance profile",
      "Steel-reinforced core",
      "5-point security lock",
      "RC2 burglar resistance",
    ],
    finishes: productFinishes,
    glassOptions: ["Frosted Privacy", "Decorative Lead", "Clear Sidelight", "Obscure Pattern"],
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall System",
    category: "systems",
    description: "Architectural curtain wall solution for commercial and high-rise residential projects. Combines structural mullion-transom framework with uPVC thermal break technology for energy-efficient building envelopes.",
    shortDescription: "Commercial-grade curtain wall with uPVC thermal break technology.",
    image: "/images/wp-export/16-Copy.jpg",
    specs: [
      "50×100mm mullion profile",
      "Structural glazing option",
      "Thermal break technology",
      "Wind load: up to 3.0 kPa",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Reflective", "Laminated Safety"],
  },
];
