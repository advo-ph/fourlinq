import { useProjects } from "@/hooks/useProjects";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { motion } from "framer-motion";

const InspirationGallery = () => {
  const { data: projects = [], isLoading } = useProjects();

  return (
    <AnimatedSection className="py-20 bg-secondary/30">
      <div className="page-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-3">Inspiration Gallery</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            See how FourlinQ systems transform real Philippine homes and commercial spaces.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={project.image}
                  alt={`${project.name} — ${project.location}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-colors duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <p className="text-primary-foreground font-medium text-sm">{project.name}</p>
                    <p className="text-primary-foreground/70 text-xs">{project.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
};

export default InspirationGallery;
