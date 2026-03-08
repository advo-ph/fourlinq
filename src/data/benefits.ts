export interface Benefit {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  stat: string;
  statLabel: string;
  icon: string;
  image: string;
}

export const benefits: Benefit[] = [
  {
    id: "thermal",
    title: "Thermal Insulation",
    shortDescription: "Multi-chamber profiles trap air to create a natural thermal barrier, keeping Philippine interiors cool without overworking your air conditioning.",
    fullDescription: "In the Philippines, where temperatures regularly exceed 35°C, energy-efficient windows are not a luxury — they're a necessity. FourlinQ uPVC profiles feature a multi-chamber design that creates isolated air pockets, forming a natural thermal barrier between your interior and the outside heat. Independent testing shows our systems reduce solar heat gain by up to 45% compared to standard aluminium frames. This translates directly to lower electricity bills and a more comfortable living environment year-round, from the summer heat of Metro Manila to the humid coastal regions of Cebu and Palawan.",
    stat: "45%",
    statLabel: "reduction in solar heat gain vs aluminium",
    icon: "thermometer",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: "maintenance",
    title: "Zero Maintenance",
    shortDescription: "Unlike timber that rots or aluminium that corrodes in coastal air, uPVC never needs painting, sanding, or sealing — just a simple wipe-down.",
    fullDescription: "Philippine homeowners know the frustration of maintaining timber windows that warp in the humidity or aluminium frames that pit and corrode in salty coastal air. FourlinQ uPVC eliminates this cycle entirely. Our profiles are inherently resistant to moisture, salt spray, UV radiation, and biological growth. They will never rot, rust, flake, or need repainting. A simple wipe with mild soap and water is all that's needed to keep them looking pristine for decades. For property developers and resort operators, this means dramatically lower lifecycle costs and happier occupants.",
    stat: "₱0",
    statLabel: "annual maintenance cost for uPVC frames",
    icon: "wrench",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  },
  {
    id: "sound",
    title: "Sound Attenuation",
    shortDescription: "Living near EDSA or a busy barangay road? Our sealed uPVC systems cut external noise by up to 40 dB, turning your home into a quiet sanctuary.",
    fullDescription: "Traffic noise, construction, karaoke nights — the Philippines is a vibrant, lively country, but sometimes you need quiet. FourlinQ uPVC windows and doors feature precision-engineered seals and multi-chamber profiles that form an effective acoustic barrier. With the right glazing specification, our systems achieve sound reduction ratings of up to 40 dB — enough to turn a roadside bedroom into a peaceful retreat. Whether you live along EDSA, near an airport flight path, or in a bustling commercial district, our windows give you control over your acoustic environment.",
    stat: "40 dB",
    statLabel: "sound reduction with double glazing",
    icon: "volume-x",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  },
  {
    id: "weather",
    title: "Weather Resistance",
    shortDescription: "Engineered and tested for typhoon-strength winds and torrential rain, our systems keep your home sealed and secure when it matters most.",
    fullDescription: "The Philippines averages 20 typhoons per year, with many reaching destructive wind speeds. FourlinQ uPVC systems are engineered specifically for these conditions. Our profiles are reinforced with galvanized steel where structural demands require it, and every window and door is fitted with multi-point locking mechanisms and triple weatherseals. Independent testing confirms our systems withstand wind pressures equivalent to Signal No. 3 typhoon conditions while maintaining a watertight seal. When Typhoon Odette or the next major storm hits, FourlinQ windows stand firm.",
    stat: "Signal 3",
    statLabel: "typhoon resistance rating achieved",
    icon: "cloud-rain",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  },
];

export interface ComparisonRow {
  feature: string;
  upvc: string;
  aluminium: string;
  timber: string;
}

export const comparisonData: ComparisonRow[] = [
  { feature: "Upfront Cost", upvc: "Moderate", aluminium: "Low–Moderate", timber: "High" },
  { feature: "Maintenance", upvc: "None required", aluminium: "Periodic re-coating", timber: "Regular painting/sealing" },
  { feature: "Thermal Performance", upvc: "Excellent (1.3 Uw)", aluminium: "Poor (5.0+ Uw)", timber: "Good (1.8 Uw)" },
  { feature: "Weather Resistance", upvc: "Excellent", aluminium: "Good (corrosion risk)", timber: "Poor (rot/warp risk)" },
  { feature: "Lifespan", upvc: "50+ years", aluminium: "30–40 years", timber: "20–30 years" },
  { feature: "Aesthetics", upvc: "Wide color range", aluminium: "Modern/industrial", timber: "Classic/natural" },
  { feature: "Sound Insulation", upvc: "Excellent (40 dB)", aluminium: "Moderate (25 dB)", timber: "Good (30 dB)" },
  { feature: "Eco-Friendliness", upvc: "Recyclable, long life", aluminium: "High energy to produce", timber: "Renewable but treated" },
];
