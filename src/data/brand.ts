export interface Certification {
  name: string;
  icon: string;
}

export const certifications: Certification[] = [
  { name: "ISO 9001:2015", icon: "shield-check" },
  { name: "CE Marked Profiles", icon: "badge-check" },
  { name: "RAL Quality Mark", icon: "award" },
  { name: "Philippine DTI Certified", icon: "file-check" },
  { name: "Green Building Compliant", icon: "leaf" },
  { name: "Typhoon-Rated Hardware", icon: "wind" },
];

export const brandStory = {
  headline: "Precision Crafted for Philippine Living",
  mission: "FourlinQ exists to bring world-class fenestration solutions to the Philippines — marrying German engineering precision with deep local expertise to create windows and doors that perform flawlessly in tropical conditions.",
  story: "Founded in 2009, FourlinQ began with a simple observation: Philippine homeowners deserved better than the limited, often poorly performing window and door options available in the local market. Our founders, having trained with leading European profile manufacturers, saw an opportunity to bridge the gap between world-class uPVC technology and the specific demands of the Philippine climate. Over 15 years and more than 500 installations later, FourlinQ has become the trusted name for architects, developers, and homeowners who refuse to compromise on quality. From luxury residences in Alabang to beachfront resorts in Cebu, our systems protect, insulate, and beautify spaces across the archipelago.",
  germanEngineering: "Our uPVC profiles are extruded using German-engineered tooling and formulations, ensuring consistent multi-chamber geometry, UV-stabilized compounds, and precise dimensional tolerances. Every profile meets or exceeds European EN 12608 standards for weather resistance, mechanical strength, and durability.",
  philippineExpertise: "Understanding local conditions is everything. We know that a window system in coastal Cebu faces different challenges than one in upland Baguio. Our team of Filipino engineers and installers brings decades of combined experience in specifying, fabricating, and installing systems optimized for each project's unique environment — from typhoon exposure to salt air corrosion to tropical UV intensity.",
  showroom: {
    address: "Unit 4B, The Commercenter, East Asia Drive, Filinvest City, Alabang, Muntinlupa 1781",
    phone: "+63 2 8845 1234",
    email: "hello@fourlinq.ph",
    hours: "Monday – Saturday, 9:00 AM – 6:00 PM",
  },
};
