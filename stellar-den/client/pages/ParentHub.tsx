import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Users, HeartHandshake, Sparkles } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";

const PAGE_SLUG = "community-parents";
const PAGE_URL = "https://alicesolutionsgroup.com/community/parents";
const PUBLISH_DATE = "2025-10-05T12:00:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "SmartStart Parent Digital Resilience Hub",
  description:
    "Udi Shkolnik’s SmartStart Parent Hub delivers age-specific cybersecurity guidance, rituals, and workshops so families can raise confident digital natives.",
  image: [FEATURE_IMAGE],
  author: {
    "@type": "Person",
    name: "Udi Shkolnik",
  },
  publisher: {
    "@type": "Organization",
    name: "AliceSolutions Group",
    logo: {
      "@type": "ImageObject",
      url: "https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg",
    },
  },
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": PAGE_URL,
  },
};

const AGE_PAGES = [
  {
    title: "Toddlers & Early Learners",
    href: "/community/parents/toddlers",
    description: "Screen-time rituals, smart-toy safety, and gentle digital boundaries for ages 2-6.",
    icon: Sparkles,
  },
  {
    title: "Grade School Explorers",
    href: "/community/parents/grade-school",
    description: "First tablets, gaming chats, and foundational privacy lessons for ages 7-10.",
    icon: ShieldCheck,
  },
  {
    title: "Pre-Teen Navigators",
    href: "/community/parents/pre-teens",
    description: "Social apps, digital empathy, and resilience training for ages 11-13.",
    icon: Users,
  },
  {
    title: "Teen Trailblazers",
    href: "/community/parents/teens",
    description: "Social pressure, digital permanence, and future-ready skills for ages 14-17.",
    icon: HeartHandshake,
  },
];

export default function ParentHub() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleBookSession = () => {
    trackArticleCta("book_parent_session");
    window.location.href = "/contact";
  };

  const handleDownloadPlaybook = () => {
    trackArticleCta("download_parent_playbook");
    window.location.href = "/resources/smartstart-parent-digital-playbook.pdf";
  };

  return (
    <>
      <Helmet>
        <title>Parent Digital Resilience Hub | SmartStart Families</title>
        <meta
          name="description"
          content="Raise confident digital natives with SmartStart. Explore age-specific cybersecurity guidance, rituals, and workshops curated by Udi Shkolnik."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Parent Digital Resilience Hub | SmartStart Families" />
        <meta
          property="og:description"
          content="Udi Shkolnik’s SmartStart framework gives parents the rituals, checklists, and workshops they need to guide kids online."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Parent Digital Resilience Hub | SmartStart Families" />
        <meta
          name="twitter:description"
          content="Age-specific cybersecurity playbooks and workshops designed by cybersecurity dad Udi Shkolnik."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="SmartStart Parent Digital Resilience Hub"
        description="Age-specific cybersecurity guidance for families, created by Udi Shkolnik and the SmartStart team."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community-hub" },
          { name: "Parent Digital Resilience Hub", url: "/community/parents" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-14">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Family sitting together using technology with intention"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  SmartStart Families
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">SmartStart Parent Digital Resilience Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 6 min read · By Udi
                  Shkolnik
                </p>
                <p className="text-base text-muted-foreground">
                  I built this hub because every parent I meet wants the same thing: to raise kids who are safe, kind, and confident in a world that never logs off.
                  Here’s our SmartStart blueprint—age-specific guidance, rituals, and workshops that help families thrive in their digital lives.
                </p>
              </motion.div>
            </header>

            <section className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
              {AGE_PAGES.map((item) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  className="group rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 shadow-lg hover:border-primary/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary/80 mb-3">
                    <item.icon className="w-4 h-4" />
                    Age Tier
                  </div>
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    View guidance
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.a>
              ))}
            </section>

            <section id="method" className="space-y-4 mb-14">
              <h2>The SmartStart Parenting Method</h2>
              <p>
                Every workshop, template, and conversation in this hub is grounded in our trio of habits. Master these and your household becomes its own resilience
                engine:
              </p>
              <ol>
                <li>
                  <strong>Connect:</strong> Stay close to the digital worlds your kids live in. Listen first, ask second, advise third.
                </li>
                <li>
                  <strong>Coach:</strong> Translate cybersecurity into life lessons—privacy as respect, passwords as house keys, empathy as armor.
                </li>
                <li>
                  <strong>Create:</strong> Make technology something you build, not only consume. Projects and rituals beat screen-time policing every time.
                </li>
              </ol>
            </section>

            <section id="resources" className="space-y-4 mb-14">
              <h2>Parent Resources & Rituals</h2>
              <p>
                Start with these core downloads. They’ve been field-tested with SmartStart families across Toronto and the GTA, and they’re updated quarterly as the
                digital landscape shifts.
              </p>
              <ul>
                <li>
                  <strong>SmartStart Parent Digital Playbook (PDF):</strong> 20-page primer with family tech contracts, conversation starters, and red-flag spotting
                  guides.
                </li>
                <li>
                  <strong>Weekly Digital Reset Checklist:</strong> A framework for managing device clean-up, privacy settings, and emotional check-ins.
                </li>
                <li>
                  <strong>Emergency Response Card:</strong> Exactly what to do when something goes wrong—bullying, phishing, exposure, or payment scams.
                </li>
              </ul>
              <Button variant="outline" className="inline-flex items-center gap-2" onClick={handleDownloadPlaybook}>
                Download the parent playbook
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section id="workshops" className="space-y-4 mb-14">
              <h2>Workshops & Circles</h2>
              <p>
                We host monthly parent circles, in-school intensives, and custom family sessions. Sessions blend practical cybersecurity training with emotional
                resilience coaching, so parents walk away with both mindsets and checklists.
              </p>
              <ul>
                <li>
                  <strong>Parent Digital Resilience Circle:</strong> Monthly hybrid meetup covering the latest scams, platform changes, and household rituals.
                </li>
                <li>
                  <strong>Smart Devices 101 for Caregivers:</strong> Configuring tablets, consoles, wearables, and smart speakers in a single evening.
                </li>
                <li>
                  <strong>Teen Digital Identity Lab:</strong> Co-led with students to build positive digital footprints, portfolios, and entrepreneurial paths.
                </li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4">
              <h2>Book a Private Parent Strategy Session</h2>
              <p>
                Want a SmartStart coach to review your household setup, run a family workshop, or collaborate with your school? We’d love to help you design a
                resilient digital home.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleBookSession}>
                Talk to the SmartStart team
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>
          </article>
        </div>
        <Footer />
      </div>
    </>
  );
}


