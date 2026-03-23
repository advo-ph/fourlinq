import AnimatedSection from "@/components/shared/AnimatedSection";

const stats = [
  { value: "German-Engineered", label: "Profile Systems" },
  { value: "500+", label: "Philippine Installations" },
  { value: "15 Years", label: "Of Precision" },
];

const TrustBar = () => {
  return (
    <AnimatedSection className="bg-surface py-10 border-y border-border">
      <div className="page-container max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 md:divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center px-8 md:px-12">
            <p className="text-lg md:text-xl font-semibold text-primary tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
};

export default TrustBar;
