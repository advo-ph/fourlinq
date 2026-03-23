import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import CTABanner from "@/components/shared/CTABanner";
import ContactForm from "@/components/shared/ContactForm";
import { certifications, CONTACT, BRANCHES, BRAND } from "@/data/brand";
import { ShieldCheck, BadgeCheck, Award, FileCheck, Leaf, Wind, MapPin, Phone, Mail, Clock, Shield, CloudRain, VolumeX, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const certIconMap: Record<string, React.ReactNode> = {
  "shield-check": <ShieldCheck size={20} />,
  "badge-check": <BadgeCheck size={20} />,
  award: <Award size={20} />,
  "file-check": <FileCheck size={20} />,
  leaf: <Leaf size={20} />,
  wind: <Wind size={20} />,
  shield: <Shield size={20} />,
  clock: <Clock size={20} />,
  "cloud-rain": <CloudRain size={20} />,
  "volume-x": <VolumeX size={20} />,
};

const Brand = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => {
        const y = el.getBoundingClientRect().top + window.scrollY - 112;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [hash]);

  return (
    <Layout>
      <PageHeader
        title="Our Brand"
        breadcrumbLabel="Brand"
        subtitle={BRAND.promise}
      />

      {/* Story + Image */}
      <AnimatedSection className="py-16">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{BRAND.heroQuote}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {BRAND.promiseSupport}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Available in 11 finishes — from classic white to rich wood grains — with a {BRAND.warranty} covering corrosion resistance, weather resistance, and long-lasting performance.
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

      {/* Warranty - dark section */}
      <AnimatedSection className="py-16 bg-[#0a0a0a]">
        <div className="page-container max-w-4xl text-center">
          <h3 className="text-lg font-semibold text-white mb-3">{BRAND.warranty}</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            {BRAND.promise}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRAND.warrantyScope.map((scope) => (
              <div key={scope} className="border border-white/10 rounded-lg p-4 text-center">
                <p className="text-sm text-white font-medium">{scope}</p>
              </div>
            ))}
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
        <div className="page-container max-w-5xl">
          <h2 className="text-3xl font-semibold text-foreground mb-2 text-center">Contact Us</h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">
            Whether you need a quote, consultation, or just have a question — we're here to help.
          </p>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="text-accent shrink-0 mt-0.5"><Phone size={20} /></div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Sales</p>
                  <a href={`tel:${CONTACT.mobileSales.replace(/-/g, "")}`} className="text-base font-medium text-foreground hover:text-accent transition-colors">{CONTACT.mobileSales}</a>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-accent shrink-0 mt-0.5"><Phone size={20} /></div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Assistance</p>
                  <a href={`tel:${CONTACT.mobileAssist.replace(/-/g, "")}`} className="text-base font-medium text-foreground hover:text-accent transition-colors">{CONTACT.mobileAssist}</a>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-accent shrink-0 mt-0.5"><Phone size={20} /></div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Landline</p>
                  <a href={`tel:${CONTACT.landline.replace(/[()]/g, "")}`} className="text-base font-medium text-foreground hover:text-accent transition-colors">{CONTACT.landline}</a>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-accent shrink-0 mt-0.5"><Mail size={20} /></div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Email</p>
                  <a href={`mailto:${CONTACT.email}`} className="text-base font-medium text-foreground hover:text-accent transition-colors">{CONTACT.email}</a>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>

          {/* Branches */}
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">Our Locations</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {BRANCHES.map((branch) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <iframe
                  title={`Map — ${branch.label}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${branch.lng - 0.005},${branch.lat - 0.003},${branch.lng + 0.005},${branch.lat + 0.003}&layer=mapnik&marker=${branch.lat},${branch.lng}`}
                  className="w-full h-40 border-0"
                  loading="lazy"
                />
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-accent shrink-0 mt-0.5"><MapPin size={16} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">{branch.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{branch.address}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[10px] uppercase tracking-wider text-accent">{branch.region}</p>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          Get Directions <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
