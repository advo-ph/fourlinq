import SystemBucket from "./SystemBucket";

const SpecialistSystems = () => (
  <SystemBucket
    copy={{
      eyebrow: "Specialist Systems",
      slogan: "When the shape isn't standard.",
      title: "For projects that refuse the standard catalog.",
      breadcrumbLabel: "Specialist Systems",
      intro:
        "Some homes ask for shapes the catalog doesn't have. A curved gable above a heritage entry. A triangular gable for a modernist roofline. A full curtain wall on the seaside elevation of a Tagaytay home. FourlinQ Specialist Systems are project-by-project fabrication — drawn to your architect's geometry, built in our workshop, installed by our team. The panels that other manufacturers say can't be done.",
      subSystemList:
        "Arch Shapes, Curtain Wall systems, and bespoke Custom Shapes — designed to architect drawings and fabricated in our Manila workshop.",
      filterCategory: "specialist",
      projectPhotos: [
        { src: "/images/wp-export/FourlinQ-Project-8.jpg", alt: "Curved-glass home with custom shaped panels",       caption: "Tagaytay residence" },
        { src: "/images/wp-export/FourlinQ-Project-7.jpg", alt: "Full glass facade detail",                            caption: "Quezon City facade" },
        { src: "/images/wp-export/Windows.jpg",            alt: "Combined window configuration",                       caption: "Combined panel configuration" },
        { src: "/images/brand-story.jpg",                  alt: "Three-storey modern home with full FourlinQ system",  caption: "Three-storey installation" },
      ],
    }}
  />
);

export default SpecialistSystems;
