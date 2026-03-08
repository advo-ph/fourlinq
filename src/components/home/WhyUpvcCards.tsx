import { Thermometer, Wrench, VolumeX, CloudRain } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  thermometer: <Thermometer size={28} />,
  wrench: <Wrench size={28} />,
  "volume-x": <VolumeX size={28} />,
  "cloud-rain": <CloudRain size={28} />,
};

const cards = [
  {
    icon: "thermometer",
    title: "Thermal Insulation",
    body: "Multi-chamber profiles trap air to create a natural thermal barrier, keeping Philippine interiors cool without overworking your air conditioning.",
  },
  {
    icon: "wrench",
    title: "Zero Maintenance",
    body: "Unlike timber that rots or aluminium that corrodes in coastal air, uPVC never needs painting, sanding, or sealing — just a simple wipe-down.",
  },
  {
    icon: "volume-x",
    title: "Sound Attenuation",
    body: "Living near EDSA or a busy barangay road? Our sealed uPVC systems cut external noise by up to 40 dB, turning your home into a quiet sanctuary.",
  },
  {
    icon: "cloud-rain",
    title: "Weather Resistance",
    body: "Engineered and tested for typhoon-strength winds and torrential rain, our systems keep your home sealed and secure when it matters most.",
  },
];

const WhyUpvcCards = () => {
  return (
    <AnimatedSection className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-3">Why uPVC?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Four reasons Philippine homeowners are choosing uPVC over traditional materials.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-4">{iconMap[card.icon]}</div>
              <h3 className="font-medium text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default WhyUpvcCards;
