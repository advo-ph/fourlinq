import AnimatedSection from "@/components/shared/AnimatedSection";
import { motion } from "framer-motion";

const cards = [
  {
    title: "Thermal Insulation",
    stat: "45%",
    statLabel: "less heat gain",
    body: "Multi-chamber profiles create a natural thermal barrier, keeping interiors cool without overworking your AC.",
    image: "/images/generated/benefit-thermal.png",
  },
  {
    title: "Zero Maintenance",
    stat: "₱0",
    statLabel: "upkeep cost",
    body: "uPVC never rots, corrodes, or needs repainting — just a simple wipe-down keeps it pristine for decades.",
    image: "/images/generated/benefit-maintenance.png",
  },
  {
    title: "Sound Attenuation",
    stat: "40 dB",
    statLabel: "noise reduction",
    body: "Sealed multi-chamber systems cut external noise, turning your home into a quiet sanctuary.",
    image: "/images/generated/benefit-sound.png",
  },
  {
    title: "Weather Resistance",
    stat: "Signal 3",
    statLabel: "typhoon rated",
    body: "Steel-reinforced profiles with multi-point locks, tested for typhoon-strength winds and torrential rain.",
    image: "/images/generated/benefit-weather.png",
  },
];

const WhyUpvcCards = () => {
  return (
    <AnimatedSection className="py-20">
      <div className="page-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-3">Why uPVC?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Four reasons Philippine homeowners are choosing uPVC over traditional materials.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[2/1]"
            >
              {/* Background image */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                {/* Stat pill */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{card.stat}</span>
                  <span className="text-xs text-white/60 uppercase tracking-wider">{card.statLabel}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default WhyUpvcCards;
