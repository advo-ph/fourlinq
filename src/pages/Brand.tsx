import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import CTABanner from "@/components/shared/CTABanner";
import ContactForm from "@/components/shared/ContactForm";
import { brandStory, certifications } from "@/data/brand";
import { ShieldCheck, BadgeCheck, Award, FileCheck, Leaf, Wind, MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

const certIconMap: Record<string, React.ReactNode> = {
  "shield-check": <ShieldCheck size={24} />,
  "badge-check": <BadgeCheck size={24} />,
  award: <Award size={24} />,
  "file-check": <FileCheck size={24} />,
  leaf: <Leaf size={24} />,
  wind: <Wind size={24} />,
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
        title={brandStory.headline}
        breadcrumbLabel="Brand"
        subtitle={brandStory.mission}
      />

      {/* Story */}
      <section className="pb-16">
        <div className="page-container max-w-4xl">
          <p className="text-muted-foreground leading-relaxed">{brandStory.story}</p>
        </div>
      </section>

      {/* German Engineering + Philippine Expertise */}
      <AnimatedSection className="py-16 bg-secondary/30">
        <div className="page-container grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-4">German Engineering</h2>
            <p className="text-muted-foreground leading-relaxed">{brandStory.germanEngineering}</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-4">Philippine Expertise</h2>
            <p className="text-muted-foreground leading-relaxed">{brandStory.philippineExpertise}</p>
          </div>
        </div>
      </AnimatedSection>

      {/* Certifications */}
      <AnimatedSection id="certifications" className="py-20">
        <div className="page-container max-w-5xl">
          <h2 className="text-3xl font-semibold text-primary mb-3 text-center">Certifications & Standards</h2>
          <p className="text-muted-foreground text-center mb-10">Every FourlinQ system meets or exceeds international quality benchmarks.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <motion.div key={cert.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <div className="text-primary shrink-0">{certIconMap[cert.icon]}</div>
                <span className="text-sm font-medium text-primary">{cert.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Showroom Photos */}
      <AnimatedSection className="py-16 bg-secondary/30">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-8">
            <img src="/images/wp-export/Company-Profile.jpg" alt="FourlinQ showroom interior" className="w-full aspect-[4/3] object-cover rounded-xl" loading="lazy" />
            <img src="/images/wp-export/Company_Profile1.jpg" alt="FourlinQ team at work" className="w-full aspect-[4/3] object-cover rounded-xl" loading="lazy" />
          </div>
        </div>
      </AnimatedSection>

      {/* Contact */}
      <AnimatedSection id="contact" className="py-20">
        <div className="page-container max-w-5xl">
          <h2 className="text-3xl font-semibold text-primary mb-3 text-center">Visit Our Showroom</h2>
          <p className="text-muted-foreground text-center mb-10">See and touch our uPVC systems in person. Our specialists are ready to help.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { icon: <MapPin size={20} />, label: "Address", value: brandStory.showroom.address },
                { icon: <Phone size={20} />, label: "Phone", value: brandStory.showroom.phone },
                { icon: <Mail size={20} />, label: "Email", value: brandStory.showroom.email },
                { icon: <Clock size={20} />, label: "Hours", value: brandStory.showroom.hours },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="text-primary shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-primary">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <ContactForm />
          </div>
        </div>
      </AnimatedSection>

      <CTABanner headline="Start Your Project" subtext="From initial consultation to final installation, we're with you every step of the way." primaryLabel="Explore Systems" primaryTo="/products" secondaryLabel="Open Design Tool" secondaryTo="/design-tool" />
    </Layout>
  );
};

export default Brand;
