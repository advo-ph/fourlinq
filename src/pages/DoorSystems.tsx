import SystemBucket from "./SystemBucket";

const DoorSystems = () => (
  <SystemBucket
    copy={{
      eyebrow: "Door Systems",
      slogan: "Wide-open architecture.",
      title: "Doors that change how a home opens.",
      breadcrumbLabel: "Door Systems",
      intro:
        "A door is where a home stops being indoors and starts being outdoors. FourlinQ door systems are engineered for the moments that matter — the lanai opening to the garden, the wall that disappears for a party, the threshold that closes against a typhoon and seals back to weather-tight when the wind passes. Custom-fabricated, project-specified, and built to operate smoothly for decades.",
      subSystemList:
        "Slide & Fold, Large Panel Doors (up to 6 metres), Lift & Slide, and the 90 Series — alongside Casement Door, French Door, and Sliding Door configurations.",
      filterCategory: "doors",
      projectPhotos: [
        { src: "/images/wp-export/FQC-Project-18.jpg",  alt: "Slide-and-fold door system in a Las Piñas residence",  caption: "Las Piñas residence" },
        { src: "/images/wp-export/Sliding-Door.jpg",    alt: "Large sliding door opening to a garden",                caption: "Garden-facing slider" },
        { src: "/images/wp-export/Slide-and-Fold.jpg",  alt: "Slide-and-fold panels fully extended",                  caption: "Slide & Fold detail" },
        { src: "/images/wp-export/Door-1.jpg",          alt: "French door with multi-point locking",                  caption: "French door installation" },
        { src: "/images/wp-export/Door-5.jpg",          alt: "Casement entrance door, dark frame finish",             caption: "Casement Door" },
      ],
    }}
  />
);

export default DoorSystems;
