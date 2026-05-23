import SystemBucket from "./SystemBucket";

const DoorSystems = () => (
  <SystemBucket
    copy={{
      eyebrow: "Door Systems",
      slogan: "Wide-open architecture.",
      title: "Doors that change how a home opens.",
      breadcrumbLabel: "Door Systems",
      intro:
        "Where a home stops being indoors and starts being outdoors. The lanai door that opens to the garden. The wall that disappears for a party. The threshold that closes against a typhoon and seals back to weather-tight when the wind passes. Custom-fabricated, project-specified, built to operate smoothly for decades.",
      subSystemList:
        "Slide & Fold, Large Panel Doors (up to 6 metres), Lift & Slide, and the 90 Series. Plus Casement Door, French Door, and Sliding Door configurations.",
      filterCategory: "doors",
      projectPhotos: [
        { src: "/images/wp-export/FQC-Project-18.jpg",  alt: "Slide-and-fold door system to a lanai",  caption: "Slide-and-fold installation" },
        { src: "/images/wp-export/Sliding-Door.jpg",    alt: "Sliding door opening to a garden",        caption: "Sliding door" },
        { src: "/images/wp-export/Slide-and-Fold.jpg",  alt: "Slide-and-fold panels fully extended",    caption: "Slide & Fold detail" },
        { src: "/images/wp-export/Door-1.jpg",          alt: "French door with multi-point locking",    caption: "French door" },
        { src: "/images/wp-export/Door-5.jpg",          alt: "Casement entrance door, dark frame finish", caption: "Casement door" },
      ],
    }}
  />
);

export default DoorSystems;
