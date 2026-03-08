import AnimatedSection from "./AnimatedSection";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbLabel: string;
}

const PageHeader = ({ title, subtitle, breadcrumbLabel }: PageHeaderProps) => (
  <div className="pt-40 pb-8">
    <div className="page-container">
      <AnimatedSection>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">FourlinQ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl md:text-5xl font-semibold text-primary mb-3">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </AnimatedSection>
    </div>
  </div>
);

export default PageHeader;
