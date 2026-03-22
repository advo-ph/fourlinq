import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import CTABanner from "@/components/shared/CTABanner";
import ContactForm from "@/components/shared/ContactForm";
import { certifications } from "@/data/brand";
import { ShieldCheck, BadgeCheck, Award, FileCheck, Leaf, Wind, MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

const certIconMap: Record<string, React.ReactNode> = {
  "shield-check": <ShieldCheck size={20} />,
  "badge-check": <BadgeCheck size={20} />,
  award: <Award size={20} />,
  "file-check": <FileCheck size={20} />,
  leaf: <Leaf size={20} />,
  wind: <Wind size={20} />,
};

const Brand = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [hash]);

  return (
    <Layout>
      <PageHeader
        title="Our Brand"
        breadcrumbLabel="Brand"
        subtitle="German engineering precision meets Philippine climate expertise. Since 2009."
      />

      {/* Story + Image */}
      <AnimatedSection className="py-16">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15 Years. 500+ Installations.</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                FourlinQ was founded to bridge the gap between world-class uPVC technology and the specific demands of the Philippine climate.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From luxury residences in Alabang to beachfront resorts in Cebu, our systems protect, insulate, and beautify spaces across the archipelago.
              </p>
            </div>
            <img
              src="/images/wp-export/Company-Profile.jpg"
              alt="FourlinQ showroom"
              className="w-full aspect-[4/3] object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Two Pillars - dark section */}
      <AnimatedSection className="py-16 bg-[#0a0a0a]">
        <div className="page-container grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">German Engineering</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Profiles extruded using German-engineered tooling with UV-stabilized compounds and precise dimensional tolerances. Every profile meets European EN 12608 standards.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Philippine Expertise</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Our Filipino engineers bring decades of experience specifying and installing systems optimized for each project — from typhoon exposure to salt air corrosion.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Certifications */}
      <AnimatedSection id="certifications" className="py-16">
        <div className="page-container max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
              >
                <div className="text-accent shrink-0">{certIconMap[cert.icon]}</div>
                <span className="text-sm font-medium text-foreground">{cert.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Team Photo */}
      <div className="page-container pb-16">
        <img
          src="/images/wp-export/Company_Profile1.jpg"
          alt="FourlinQ team"
          className="w-full aspect-[21/9] object-cover rounded-lg"
          loading="lazy"
        />
      </div>

      {/* Contact */}
      <AnimatedSection id="contact" className="py-16 bg-neutral-50">
        <div className="page-container max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Visit Our Showroom</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              {[
                { icon: <MapPin size={18} />, label: "Address", value: "Unit 4B, The Commercenter, East Asia Drive, Filinvest City, Alabang, Muntinlupa 1781" },
                { icon: <Phone size={18} />, label: "Phone", value: "+63 2 8845 1234" },
                { icon: <Mail size={18} />, label: "Email", value: "hello@fourlinq.ph" },
                { icon: <Clock size={18} />, label: "Hours", value: "Monday – Saturday, 9:00 AM – 6:00 PM" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <div className="text-accent shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="text-sm text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <ContactForm />
          </div>
        </div>
      </AnimatedSection>

      <CTABanner
        headline="Start Your Project"
        subtext="From consultation to installation, we're with you every step."
        primaryLabel="Explore Systems"
        primaryTo="/products"
        secondaryLabel="Open Design Tool"
        secondaryTo="/design-tool"
      />
    </Layout>
  );
};

export default Brand;
