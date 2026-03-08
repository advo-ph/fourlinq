import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Window Systems",
    description: "Casement, sliding, and fixed panels engineered for tropical performance.",
    image: "/images/wp-export/Casement-Windows.jpg",
    to: "/products?filter=windows",
  },
  {
    name: "Door Systems",
    description: "French, sliding, bifold, and entrance doors with multi-point security.",
    image: "/images/wp-export/Sliding-Door.jpg",
    to: "/products?filter=doors",
  },
  {
    name: "Specialist Systems",
    description: "Curtain walls, entrance prestige, and architectural solutions.",
    image: "/images/wp-export/Product-Page.jpg",
    to: "/products?filter=systems",
  },
];

const ProductsPreview = () => {
  return (
    <AnimatedSection className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-3">Our Systems</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Explore our complete range of German-engineered uPVC fenestration solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={cat.to}
                className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain bg-white p-4 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-primary">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                  </div>
                  <ArrowRight size={18} className="text-primary/40 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default ProductsPreview;
