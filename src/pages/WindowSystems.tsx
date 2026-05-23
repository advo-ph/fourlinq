import SystemBucket from "./SystemBucket";

const WindowSystems = () => (
  <SystemBucket
    copy={{
      eyebrow: "Window Systems",
      slogan: "Quiet daylight.",
      title: "Windows engineered for the Philippine climate.",
      breadcrumbLabel: "Window Systems",
      intro:
        "Built for the tropics. Daylight that doesn't fade the interior. Monsoon rain that stays outside. Multi-chamber uPVC profiles, galvanized-steel reinforced, sealed with EPDM gaskets. Fabricated in our Manila workshop, sized to your architect's drawings.",
      subSystemList:
        "Casement, Sliding, Awning, and Special Shapes. Combinable into custom configurations including full curtain-wall feature walls.",
      filterCategory: "windows",
      projectPhotos: [
        { src: "/images/wp-export/FourlinQ-Project-7.jpg", alt: "Modern white residence with casement and sliding windows", caption: "Modern white residence" },
        { src: "/images/wp-export/FQC-Project-17.jpg",    alt: "Full-height casement opening to a garden",                  caption: "Garden-view residence" },
        { src: "/images/wp-export/FourlinQ-Project-8.jpg", alt: "Curved-glass window detail",                                caption: "Curved-glass residence" },
        { src: "/images/wp-export/Casement-Window.jpg",    alt: "FourlinQ casement window with hardware",                   caption: "Casement window" },
        { src: "/images/wp-export/Sliding-Window.jpg",     alt: "Sliding window installation",                               caption: "Sliding window" },
      ],
    }}
  />
);

export default WindowSystems;
