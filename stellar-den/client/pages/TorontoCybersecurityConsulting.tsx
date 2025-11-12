import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { captureLeadSource } from "@/lib/leadSource";
import {
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  Building2,
  Timer,
  MapPin,
  FileText,
  BadgeCheck,
  PhoneCall,
  ArrowRight,
  LockKeyhole,
  ListCheck,
  Sparkles,
  Server,
} from "lucide-react";

type SubmitStatus = "idle" | "success" | "error";

type FormState = {
  name: string;
  email: string;
  company: string;
  phone: string;
  useCase: string;
  message: string;
  privacyConsent: boolean;
  dataProcessingConsent: boolean;
};

type UtmState = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

const defaultFormState: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  useCase: "",
  message: "",
  privacyConsent: true,
  dataProcessingConsent: true,
};

const defaultUtmState: UtmState = {
  source: "{{source}}",
  medium: "{{medium}}",
  campaign: "gta_cybersecurity",
  term: "{{term}}",
  content: "{{ad_id}}",
};

const PAGE_ID = "toronto-cybersecurity-consulting";
const PAGE_URL = `https://alicesolutionsgroup.com/${PAGE_ID}`;

function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const analytics = (window as any).analyticsHub;
  if (analytics && typeof analytics.trackEvent === "function") {
    analytics.trackEvent(name, {
      page: PAGE_ID,
      ...properties,
    });
  }
}

export default function TorontoCybersecurityConsulting() {
  const { isCollapsed } = useSidebar();
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [leadSource, setLeadSource] = useState({
    pageUrl: "",
    referrer: "",
    timestamp: "",
  });
  const [utmParams, setUtmParams] = useState<UtmState>(defaultUtmState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasTrackedScroll, setHasTrackedScroll] = useState(false);

  useEffect(() => {
    captureLeadSource().then((data) => {
      setLeadSource({
        pageUrl: data.pageUrl,
        referrer: data.referrer,
        timestamp: data.timestamp,
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      source: params.get("utm_source") || defaultUtmState.source,
      medium: params.get("utm_medium") || defaultUtmState.medium,
      campaign: params.get("utm_campaign") || defaultUtmState.campaign,
      term: params.get("utm_term") || defaultUtmState.term,
      content: params.get("utm_content") || defaultUtmState.content,
    });
    trackEvent("lead_open", {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const scrollElement = document.documentElement;
      const scrollTop = scrollElement.scrollTop || document.body.scrollTop;
      const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
      const scrolled = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      if (!hasTrackedScroll && scrolled >= 0.75) {
        setHasTrackedScroll(true);
        trackEvent("scroll_75");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasTrackedScroll]);

  const buildCtaHref = useCallback(
    (base: string) => {
      const url = new URL(base);
      url.searchParams.set("utm_source", utmParams.source);
      url.searchParams.set("utm_medium", utmParams.medium);
      url.searchParams.set("utm_campaign", utmParams.campaign);
      url.searchParams.set("utm_term", utmParams.term);
      url.searchParams.set("utm_content", utmParams.content);
      return url.toString();
    },
    [utmParams],
  );

  const handlePrimaryCta = useCallback(() => {
    trackEvent("cta_click_primary", { cta: "book_assessment" });
  }, []);

  const handleSecondaryCta = useCallback(() => {
    trackEvent("cta_click_primary", { cta: "download_checklist" });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const landingBreadcrumbs = useMemo(
    () => [
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: "Toronto Cybersecurity Consulting", url: `/${PAGE_ID}` },
    ],
    [],
  );

  const localBusinessSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "AliceSolutions Group - Toronto Cybersecurity Consulting",
      image: "https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg",
      url: PAGE_URL,
      telephone: "+1-647-686-8282",
      priceRange: "$$",
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 43.6532,
          longitude: -79.3832,
        },
        geoRadius: 45000,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Toronto",
        addressRegion: "ON",
        addressCountry: "CA",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
      ],
      sameAs: ["https://www.linkedin.com/company/alicesolutionsgroup/"],
      makesOffer: [
        {
          "@type": "Offer",
          name: "Toronto Cybersecurity Lite Assessment",
          price: "Request a quote",
          url: PAGE_URL,
        },
      ],
      service: [
        {
          "@type": "Service",
          name: "Incident Response & DFIR",
          areaServed: "Toronto GTA",
        },
        {
          "@type": "Service",
          name: "ISO 27001 Readiness & Audit",
        },
        {
          "@type": "Service",
          name: "PHIPA & PIPEDA Privacy Readiness",
        },
      ],
    }),
    [],
  );

  const faqs = useMemo(
    () => [
      {
        question: "Do Toronto SMEs fall under PHIPA or PIPEDA?",
        answer:
          "Ontario health information custodians and their agents must comply with PHIPA, while most private-sector organizations engaged in commercial activity must comply with PIPEDA’s fair information principles. We help you map which framework applies and build practical controls for both.",
      },
      {
        question: "What standards do you align our program to?",
        answer:
          "Every engagement references the Canadian Centre for Cyber Security baseline guidance, ISO/IEC 27001:2022 controls, and Ontario-specific privacy obligations, so your board sees a familiar framework while auditors get the evidence they need.",
      },
      {
        question: "How fast can your incident team respond in the GTA?",
        answer:
          "We target same-day triage for GTA clients and can establish managed detection or on-call retainer coverage within one week. During an active incident we coordinate with your legal, insurance, and DFIR partners to contain and recover.",
      },
      {
        question: "Do you support regulated sectors like energy and utilities?",
        answer:
          "Yes. We’ve mapped Ontario Energy Board cyber standards, municipal requirements, and Bill 194 updates to practical playbooks so you can satisfy regulators without overbuilding your program.",
      },
    ],
    [],
  );

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    }),
    [faqs],
  );

  const serviceCards = useMemo(
    () => [
      {
        title: "Incident Response & DFIR",
        description:
          "24/7 virtual CIRT with rapid containment, forensic preservation, and insurer-ready reporting tailored for GTA SMEs.",
        icon: AlertTriangle,
        bullets: ["Same-day kickoff", "Coordinated legal & insurer updates", "Tabletop-tested playbooks"],
      },
      {
        title: "Risk Assessment & Roadmap",
        description:
          "Gap analysis against CSE baselines and ISO 27001 to prioritize your next 90 days across people, process, and tooling.",
        icon: ClipboardCheck,
        bullets: ["Evidence-ready artefacts", "Executive briefing decks", "Quick wins in weeks"],
      },
      {
        title: "ISO 27001 Readiness & Internal Audit",
        description:
          "Lead auditor guidance for Toronto teams pursuing certification or maintaining surveillance audits without surprises.",
        icon: ShieldCheck,
        bullets: ["Accelerated readiness", "Internal audit co-sourcing", "Policy & control upgrades"],
      },
      {
        title: "PHIPA / PIPEDA Privacy Readiness",
        description:
          "Ontario health privacy alignment plus Canadian federal consent requirements, with data maps and retention rules that stick.",
        icon: FileText,
        bullets: ["Privacy impact assessments", "Consent & notice updates", "Third-party diligence"],
      },
      {
        title: "Managed Detection & SOC Lite",
        description:
          "We integrate with your existing stack (Microsoft, SentinelOne, CrowdStrike) and deliver executive-ready signal triage.",
        icon: Server,
        bullets: ["Partner-agnostic integrations", "Runbooks & escalation", "Metrics your board understands"],
      },
    ],
    [],
  );

  const differentiators = useMemo(
    () => [
      {
        icon: Building2,
        title: "GTA Coverage",
        description: "Toronto-based team with onsite availability across the GTA and hybrid support nationwide.",
      },
      {
        icon: Timer,
        title: "Same-Week Kickoff",
        description: "Lite assessment launched in 5 business days with executive readout week two.",
      },
      {
        icon: MapPin,
        title: "Ontario-Centric Controls",
        description: "Mapped to PHIPA, PIPEDA, Bill 194 updates, and sector regulators so you stay ahead of compliance waves.",
      },
      {
        icon: Sparkles,
        title: "Fixed-Fee Pilots",
        description: "Predictable spend for incident readiness, MDR/SOC Lite, and ISO gap analysis before scaling.",
      },
      {
        icon: BadgeCheck,
        title: "Lead Auditor Expertise",
        description: "ISO 27001 lead auditor and CISO-as-a-Service experience guiding transformations and surveillance audits.",
      },
      {
        icon: LockKeyhole,
        title: "Evidence-First Reporting",
        description: "Board-ready narrative, control evidence, and assurance packages aligned to Canadian investor expectations.",
      },
    ],
    [],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!formData.privacyConsent || !formData.dataProcessingConsent) {
      setFormError("We need your consent to process and store this request.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/zoho/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          service: "Toronto Cybersecurity Consulting",
          message:
            formData.message ||
            "GTA cybersecurity consultation request covering incident readiness, ISO 27001, MDR, and privacy alignment.",
          howDidYouHear: formData.useCase || "Toronto Cybersecurity Landing Page",
          mailingList: false,
          privacyConsent: formData.privacyConsent,
          dataProcessingConsent: formData.dataProcessingConsent,
          pageUrl: leadSource.pageUrl || PAGE_URL,
          referrer: leadSource.referrer || document.referrer || "Direct",
          timestamp: leadSource.timestamp,
          utm_source: utmParams.source,
          utm_medium: utmParams.medium,
          utm_campaign: utmParams.campaign,
          utm_term: utmParams.term,
          utm_content: utmParams.content,
          buttonContext: "Toronto Landing Page",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit lead");
      }

      const data = await response.json();
      if (!data?.success) {
        throw new Error("Failed to submit lead");
      }

      setSubmitStatus("success");
      setDownloadUrl(`/api/resources/gta-incident-readiness-checklist.pdf?ts=${Date.now()}`);
      setFormData(defaultFormState);
      trackEvent("form_submit_success", {
        utm_source: utmParams.source,
        utm_medium: utmParams.medium,
        utm_campaign: utmParams.campaign,
      });
    } catch (error) {
      setSubmitStatus("error");
      setFormError("Something went wrong sending your request. Please try again or email udi.shkolnik@alicesolutionsgroup.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checklistSections = [
    {
      title: "1. Contacts & Escalation Paths",
      bullets: ["Executive & IT leaders", "External counsel & insurer", "24/7 vendor contacts", "Public relations lead"],
    },
    {
      title: "2. Legal & Privacy",
      bullets: ["PHIPA custodianship map", "PIPEDA breach notification triggers", "Retention & destruction schedule", "Third-party agreements"],
    },
    {
      title: "3. Resilience & Recovery",
      bullets: ["Backup coverage + RTO/RPO", "Critical system inventory", "Failover runbooks", "Tabletop cadence"],
    },
    {
      title: "4. Detection & Response",
      bullets: ["MDR/EDR health check", "Log sources + SIEM coverage", "Threat intel & watchlists", "Escalation SLAs"],
    },
    {
      title: "5. Identity & Access",
      bullets: ["MFA footprint", "Privileged access process", "Joiner/mover/leaver controls", "Third-party identities"],
    },
    {
      title: "6. Communications",
      bullets: ["Executive brief templates", "Regulator playbooks", "Customer & partner notifications", "Evidence retention checklist"],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Toronto Cybersecurity Consulting for SMEs | Incident Response, PHIPA & PIPEDA</title>
        <meta
          name="description"
          content="Toronto & GTA cybersecurity consulting for SMEs: risk assessment, IR playbooks, ISO 27001, PHIPA/PIPEDA readiness, MDR. Local response, same-day scoping."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="Toronto Cybersecurity Consulting for SMEs | Incident Response, PHIPA & PIPEDA" />
        <meta
          property="og:description"
          content="Toronto & GTA cybersecurity consulting for SMEs: IR playbooks, ISO 27001, PHIPA/PIPEDA readiness, MDR. Local response, same-day scoping."
        />
        <meta property="og:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        <meta property="og:site_name" content="AliceSolutionsGroup" />
        <meta property="og:locale" content="en_CA" />
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6532;-79.3832" />
        <meta name="ICBM" content="43.6532, -79.3832" />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <StructuredData
        type="page"
        title="Toronto Cybersecurity Consulting for SMEs | Incident Response, PHIPA & PIPEDA"
        description="Toronto & GTA cybersecurity consulting for SMEs covering incident response, ISO 27001, PHIPA/PIPEDA privacy readiness, and MDR programs."
        url={PAGE_URL}
        breadcrumbs={landingBreadcrumbs}
      />
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20 ml-0" : "md:ml-72 ml-0"} md:pt-0 pt-20`}>
          {/* Hero */}
          <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-background via-background/60 to-background/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_45%)]" aria-hidden="true" />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-20 md:py-28">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-4 w-4" />
                  GTA Cybersecurity Programs
                </span>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                  Toronto Cybersecurity Consulting for SMEs
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Incident response playbooks, MDR coverage, ISO 27001 lead auditor guidance, and PHIPA/PIPEDA privacy readiness delivered by a Toronto-based
                  team. Same-week kickoff, evidence-first reporting, and fixed-fee pilots for GTA organizations.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    asChild
                    className="inline-flex items-center gap-3"
                    onClick={handlePrimaryCta}
                  >
                    <a href={buildCtaHref("https://calendly.com/alicesolutionsgroup/15min-assessment")} target="_blank" rel="noopener noreferrer">
                      <PhoneCall className="h-5 w-5" />
                      Book a 15-min Assessment
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleSecondaryCta}
                    asChild
                    className="inline-flex items-center gap-3"
                  >
                    <a href="#consult-form">
                      <FileText className="h-5 w-5" />
                      Download GTA Incident Readiness Checklist
                    </a>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    ISO 27001 Lead Auditor & CISO-as-a-Service
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    Same-week kickoff & GTA onsite coverage
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Serving Toronto, York, Peel, Durham, Halton
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Proof Section */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 md:py-24">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid gap-8 md:grid-cols-3">
              <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  Audited & Implemented
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  ISO/IEC 27001:2022 lead auditor, SOC 2 readiness specialist, and CISO-as-a-Service engagements across Toronto fintech, healthcare, and public
                  sector innovators.
                </p>
              </div>
              <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ListCheck className="h-5 w-5 text-primary" />
                  Rapid Readiness
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Incident response playbooks, tabletop exercises, MDR integrations, and privacy programs aligned with PHIPA, PIPEDA, and CSE baselines—delivered
                  with executive-ready artefacts in two-week sprints.
                </p>
              </div>
              <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  GTA Focus
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Local practitioners covering Toronto, Mississauga, Vaughan, Markham, and Hamilton—with remote support for Canadian subsidiaries and global
                  parent teams.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Services */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-16 md:pb-24">
            <div className="flex flex-col gap-3 mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">Cybersecurity Services Built for Toronto SMEs</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                We pair Canadian regulatory intelligence with enterprise-tested playbooks so founders, COOs, and CISOs can compress audit prep, respond to incidents,
                and earn stakeholder trust without bloated tooling.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {serviceCards.map((service) => (
                <motion.div
                  key={service.title}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-lg p-8 shadow-xl transition"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition" />
                  <service.icon className="relative h-10 w-10 text-primary" />
                  <h3 className="relative mt-6 text-2xl font-semibold text-foreground">{service.title}</h3>
                  <p className="relative mt-4 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  <ul className="relative mt-5 space-y-2 text-sm text-muted-foreground">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <ArrowRight className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Differentiators */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-16 md:pb-24">
            <div className="flex flex-col gap-3 mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">Why Toronto SMEs Choose AliceSolutions Group</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                We combine executive-level strategy, engineering execution, and Canadian regulatory depth—delivering deliverables your auditors accept and your board understands.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((diff) => (
                <motion.div
                  key={diff.title}
                  className="rounded-3xl border border-border/50 bg-secondary/10 p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <diff.icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{diff.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{diff.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Band */}
          <section className="relative border-y border-border/40 bg-gradient-to-r from-primary/10 via-background to-primary/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.1),_transparent_55%)]" aria-hidden="true" />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16">
              <div className="rounded-3xl border border-border/60 bg-background/80 backdrop-blur-xl p-10 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <h3 className="text-2xl font-semibold text-foreground">Ready in Two Weeks: GTA Cybersecurity Lite Assessment</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Zero-cost discovery call, fixed-fee Lite assessment (2 weeks), and an upgrade path to full ISO, MDR, or privacy engagements when you’re ready.
                      Deliverables include risk heatmaps, PHIPA/PIPEDA gap report, IR playbook updates, and executive narrative.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="inline-flex items-center gap-3" asChild onClick={handlePrimaryCta}>
                      <a href={buildCtaHref("https://calendly.com/alicesolutionsgroup/15min-assessment")} target="_blank" rel="noopener noreferrer">
                        Start Discovery Call
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button variant="outline" size="lg" className="inline-flex items-center gap-3" asChild>
                      <a href="#consult-form">
                        Review Checklist
                        <FileText className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Checklist + Form */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 md:py-24 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-3xl font-semibold text-foreground">Toronto & GTA Incident Readiness Checklist</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Use this PDF to align executives, IT, and compliance stakeholders on their readiness posture before an incident. We’ve condensed the most critical
                steps from Canadian Centre for Cyber Security guidance, insurer questionnaires, and Ontario privacy obligations.
              </p>
              <div className="mt-8 space-y-4">
                {checklistSections.map((section) => (
                  <div key={section.title} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-5">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {section.title}
                    </h3>
                    <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <ArrowRight className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div id="consult-form" className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-foreground">Book Your 15-min Assessment</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We’ll review your current maturity, identify the highest-impact controls, and align on next steps. You’ll receive the PDF instantly after submitting.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Full Name</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                      placeholder="Jane Doe"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Work Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="jane@company.com"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Company</span>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="Toronto Tech Inc."
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Phone (optional)</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="+1 (647) 555-0199"
                    />
                  </label>
                </div>

                <label className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Primary Priority</span>
                  <select
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleChange}
                    className="mt-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <option value="">Select</option>
                    <option value="Incident Response & DFIR">Incident Response & DFIR</option>
                    <option value="ISO 27001 Readiness">ISO 27001 Readiness</option>
                    <option value="PHIPA / PIPEDA Privacy Program">PHIPA / PIPEDA Privacy Program</option>
                    <option value="Managed Detection & SOC Lite">Managed Detection & SOC Lite</option>
                    <option value="Risk Assessment & Roadmap">Risk Assessment & Roadmap</option>
                    <option value="Other / Not Sure">Other / Not Sure</option>
                  </select>
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">What should we prepare before the call?</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-2 min-h-[120px] rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    placeholder="Help us focus the session (e.g. preparing for ISO certification, recently acquired company, healthcare privacy assessment, MDR partner selection...)."
                  />
                </label>

                <div className="space-y-2 rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={handleChange}
                      required
                      className="mt-1 h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>
                      I consent to the processing of my personal information for the purpose of responding to this request, in line with PHIPA and PIPEDA obligations.
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="dataProcessingConsent"
                      checked={formData.dataProcessingConsent}
                      onChange={handleChange}
                      required
                      className="mt-1 h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>
                      I understand my information may be stored in Canadian or SOC 2 compliant systems and can request deletion or updates at any time.
                    </span>
                  </label>
                </div>

                <input type="hidden" name="utm_source" value={utmParams.source} readOnly />
                <input type="hidden" name="utm_medium" value={utmParams.medium} readOnly />
                <input type="hidden" name="utm_campaign" value={utmParams.campaign} readOnly />
                <input type="hidden" name="utm_term" value={utmParams.term} readOnly />
                <input type="hidden" name="utm_content" value={utmParams.content} readOnly />

                {formError && <p className="text-sm text-destructive">{formError}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Book the Assessment & Download Checklist"}
                </Button>

                {submitStatus === "success" && downloadUrl && (
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-primary-foreground/80">
                    <p className="font-medium text-primary">Thanks! Check your inbox—download is ready.</p>
                    <p className="mt-2 text-muted-foreground">
                      You can also download the checklist directly here:
                      <a
                        href={downloadUrl}
                        className="ml-2 font-semibold text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GTA Incident Readiness Checklist (PDF)
                      </a>
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    We couldn’t send your request just now. Try again or email udi.shkolnik@alicesolutionsgroup.com.
                  </p>
                )}
              </form>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-20 md:pb-28">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">FAQ: Toronto & Ontario Cybersecurity Requirements</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {faqs.map((faq) => (
                <motion.div
                  key={faq.question}
                  className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
}

