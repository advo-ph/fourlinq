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
    image: "/images/wp-export/FourlinQ-Project-1.jpg",
  },
  {
    id: "cebu-resort",
    name: "Beachfront Resort Suite",
    location: "Mactan, Cebu",
    image: "/images/wp-export/FourlinQ-Project-2.jpg",
  },
  {
    id: "bgc-penthouse",
    name: "High-Rise Penthouse",
    location: "BGC, Taguig",
    image: "/images/wp-export/FourlinQ-Project-3.jpg",
  },
  {
    id: "tagaytay-home",
    name: "Hillside Family Home",
    location: "Tagaytay, Cavite",
    image: "/images/wp-export/FourlinQ-Project-4.jpg",
  },
  {
    id: "boracay-hotel",
    name: "Boutique Hotel Façade",
    location: "Boracay, Aklan",
    image: "/images/wp-export/FourlinQ-Project-5.jpg",
  },
  {
    id: "makati-office",
    name: "Corporate Office Fitout",
    location: "Makati City",
    image: "/images/wp-export/FourlinQ-Project-6.jpg",
  },
];
