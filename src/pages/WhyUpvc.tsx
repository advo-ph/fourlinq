import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import CTABanner from "@/components/shared/CTABanner";
import { benefits, comparisonData } from "@/data/benefits";
import { Thermometer, Wrench, VolumeX, CloudRain, Sun, Droplets, Wind } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  thermometer: <Thermometer size={32} />,
  wrench: <Wrench size={32} />,
  "volume-x": <VolumeX size={32} />,
  "cloud-rain": <CloudRain size={32} />,
};

const WhyUpvc = () => {
  return (
    <Layout>
      <PageHeader
        title="Why uPVC Is the Smart Choice for Philippine Homes"
        breadcrumbLabel="Why uPVC"
        subtitle="From thermal insulation to typhoon resistance, discover why architects and homeowners across the Philippines are switching to German-engineered uPVC fenestration systems."
      />

      {/* Detailed Benefits */}
      {benefits.map((benefit, i) => (
        <AnimatedSection key={benefit.id} className={`py-16 ${i % 2 === 1 ? "bg-secondary/30" : ""}`}>
          <div className={`page-container grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <div className="text-primary mb-4">{iconMap[benefit.icon]}</div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">{benefit.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{benefit.fullDescription}</p>
              <div className="bg-card border border-border rounded-lg p-4 inline-flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-accent">{benefit.stat}</span>
                <span className="text-sm text-muted-foreground">{benefit.statLabel}</span>
              </div>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <img src={benefit.image} alt={benefit.title} className="w-full aspect-[4/3] object-cover rounded-xl" loading="lazy" />
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* Comparison Table */}
      <AnimatedSection className="py-20">
        <div className="page-container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-3 text-center">Material Comparison</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
            See how uPVC stacks up against aluminium and timber across key performance criteria.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">Feature</th>
                  <th className="text-left p-4 text-sm font-semibold text-accent">uPVC</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Aluminium</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Timber</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <motion.tr key={row.feature} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-b border-border">
                    <td className="p-4 text-sm font-medium text-primary">{row.feature}</td>
                    <td className="p-4 text-sm text-primary font-medium">{row.upvc}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.aluminium}</td>
                    <td className="p-4 text-sm text-muted-foreground">{row.timber}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>

      {/* Philippine Climate */}
      <AnimatedSection className="py-20 bg-secondary/30">
        <div className="page-container max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-3">Built for the Philippine Climate</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            The Philippines presents unique challenges that demand more from your windows and doors. Here's how uPVC excels.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Sun size={28} />, title: "Tropical Heat", body: "Multi-chamber uPVC profiles act as thermal barriers, reducing solar heat gain by up to 45%. Your air conditioning works less, and your energy bills drop — critical in a country where cooling accounts for over 40% of residential electricity use." },
              { icon: <Droplets size={28} />, title: "Coastal Humidity", body: "Salt-laden air corrodes aluminium and rots timber in years. uPVC is chemically inert — it doesn't react with moisture, salt, or UV radiation. Properties in Cebu, Palawan, and Boracay stay pristine without recoating or retreatment." },
              { icon: <Wind size={28} />, title: "Typhoon Conditions", body: "With 20+ typhoons per year, structural integrity is non-negotiable. FourlinQ systems are reinforced with galvanized steel, fitted with multi-point locks, and sealed with triple weatherstrips — tested to withstand Signal No. 3 wind loads." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-lg p-6 text-left">
                <div className="text-primary mb-3">{item.icon}</div>
                <h3 className="font-medium text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <CTABanner headline="Ready to Upgrade?" subtext="Explore our full range of uPVC systems or configure your own with our interactive design tool." primaryLabel="Browse Products" primaryTo="/products" secondaryLabel="Open Design Tool" secondaryTo="/design-tool" />
    </Layout>
  );
};

export default WhyUpvc;
