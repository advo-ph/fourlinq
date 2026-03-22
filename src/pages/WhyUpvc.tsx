import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import CTABanner from "@/components/shared/CTABanner";
import { benefits, comparisonData } from "@/data/benefits";
import { Thermometer, Wrench, VolumeX, CloudRain, Sun, Droplets, Wind } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  thermometer: <Thermometer size={28} />,
  wrench: <Wrench size={28} />,
  "volume-x": <VolumeX size={28} />,
  "cloud-rain": <CloudRain size={28} />,
};

const WhyUpvc = () => {
  return (
    <Layout>
      <PageHeader
        title="Why uPVC?"
        breadcrumbLabel="Why uPVC"
        subtitle="Superior thermal performance, zero maintenance, and typhoon-grade durability — built for Philippine homes."
      />

      {/* Key Benefits */}
      <AnimatedSection className="py-16">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  {iconMap[benefit.icon]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {benefit.shortDescription}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-accent">{benefit.stat}</span>
                    <span className="text-xs text-muted-foreground">{benefit.statLabel}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Visual Gallery */}
      <AnimatedSection className="py-16 bg-neutral-50">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="relative rounded-lg overflow-hidden group">
                <img
                  src={benefit.image}
                  alt={benefit.title}
                  className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-semibold">{benefit.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Comparison Table */}
      <AnimatedSection className="py-20">
        <div className="page-container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 text-center">
            Material Comparison
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">
            How uPVC stacks up against aluminium and timber.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground/10">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feature</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-accent">uPVC</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aluminium</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timber</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border"
                  >
                    <td className="p-4 text-sm font-medium text-foreground">{row.feature}</td>
                    <td className="p-4 text-sm text-foreground font-medium">{row.upvc}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.aluminium}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.timber}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>

      {/* Philippine Climate - dark section */}
      <AnimatedSection className="py-20 bg-[#0a0a0a]">
        <div className="page-container max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Built for the Philippine Climate
          </h2>
          <p className="text-white/60 mb-12 max-w-xl mx-auto text-sm">
            Unique challenges demand more from your windows and doors.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Sun size={24} />, title: "Tropical Heat", body: "Multi-chamber profiles reduce solar heat gain by up to 45%. Lower energy bills, cooler interiors." },
              { icon: <Droplets size={24} />, title: "Coastal Humidity", body: "Chemically inert — won't corrode, rot, or degrade in salt-laden coastal air." },
              { icon: <Wind size={24} />, title: "Typhoon Conditions", body: "Steel-reinforced profiles with multi-point locks. Tested to Signal No. 3 wind loads." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-white/10 rounded-lg p-6 text-left"
              >
                <div className="text-accent mb-3">{item.icon}</div>
                <h3 className="font-medium text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <CTABanner
        headline="Ready to Upgrade?"
        subtext="Explore our full range of uPVC systems or configure your own."
        primaryLabel="Browse Products"
        primaryTo="/products"
        secondaryLabel="Open Design Tool"
        secondaryTo="/design-tool"
      />
    </Layout>
  );
};

export default WhyUpvc;
