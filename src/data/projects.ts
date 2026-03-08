export interface Project {
  id: string;
  name: string;
  location: string;
  image: string;
}

export const projects: Project[] = [
  {
    id: "alabang-villa",
    name: "Modern Villa Renovation",
    location: "Alabang, Metro Manila",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    id: "cebu-resort",
    name: "Beachfront Resort Suite",
    location: "Mactan, Cebu",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  },
  {
    id: "bgc-penthouse",
    name: "High-Rise Penthouse",
    location: "BGC, Taguig",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
  },
  {
    id: "tagaytay-home",
    name: "Hillside Family Home",
    location: "Tagaytay, Cavite",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
  },
  {
    id: "boracay-hotel",
    name: "Boutique Hotel Façade",
    location: "Boracay, Aklan",
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80",
  },
  {
    id: "makati-office",
    name: "Corporate Office Fitout",
    location: "Makati City",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
  },
];
