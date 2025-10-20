import { useState } from "react";
import { Lock, CheckCircle, Shield, FileText } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const certifications = [
  {
    badge: "ISO 27001",
    title: "Information Security Management",
    description:
      "We maintain comprehensive information security practices and compliance audits.",
    icon: Shield,
  },
  {
    badge: "CISSP",
    title: "Certified Information Systems Security Professional",
    description: "Our leadership holds the highest professional security credentials.",
    icon: CheckCircle,
  },
  {
    badge: "CISM",
    title: "Certified Information Security Manager",
    description: "Expertise in information security management and governance.",
    icon: Lock,
  },
  {
    badge: "GDPR",
    title: "General Data Protection Regulation",
    description: "Full compliance with EU data protection and privacy regulations.",
    icon: FileText,
  },
  {
    badge: "PIPEDA",
    title: "Personal Information Protection and Electronic Documents Act",
    description: "Canadian data protection compliance for all customer data.",
    icon: Shield,
  },
  {
    badge: "SOC 2 Ready",
    title: "Service Organization Control",
    description: "Security, availability, processing integrity, confidentiality, and privacy controls.",
    icon: CheckCircle,
  },
];

export default function ComplianceSection() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const { ref, isInView } = useInView();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedBadge(null);
    }
  };

  const selectedCert = certifications.find((c) => c.badge === selectedBadge);

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
            Trust &amp; Compliance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Industry-leading certifications and compliance standards ensure your
            peace of mind.
          </p>
        </div>

        {/* Certification Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {certifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <button
                key={index}
                onClick={() => setSelectedBadge(cert.badge)}
                className={`group relative overflow-hidden rounded-xl p-4 border border-primary/30 bg-primary/5 transition-all duration-700 hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isInView ? `${index * 75}ms` : "0ms" }}
              >
                {/* Icon */}
                <Icon className="h-6 w-6 text-primary mb-2 transition-transform group-hover:scale-110" />

                {/* Badge Text */}
                <p className="text-xs font-bold text-primary text-left leading-tight">
                  {cert.badge}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none transition-opacity duration-300" />
              </button>
            );
          })}
        </div>

        {/* Modal for certification details */}
        <Dialog open={!!selectedBadge} onOpenChange={handleOpenChange}>
          {selectedCert && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  {selectedCert && (
                    <>
                      <selectedCert.icon className="h-8 w-8 text-primary" />
                      <DialogTitle className="text-2xl">
                        {selectedCert.badge}
                      </DialogTitle>
                    </>
                  )}
                </div>
                <DialogDescription asChild>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-lg">
                      {selectedCert.title}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {selectedCert.description}
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        We maintain continuous compliance and regular audits to ensure
                        the highest standards of security and privacy for our customers
                        and their data.
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          )}
        </Dialog>

        {/* Trust Statement */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">Security Is Our Foundation</h3>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We don't just meet compliance standards—we exceed them. Our security
            culture is woven into every decision, every product, and every team
            member. Your trust is our most valuable asset.
          </p>
        </div>
      </div>
    </section>
  );
}
