import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";
import LetterToBuildersContent from "@/components/LetterToBuildersContent";

const PAGE_SLUG = "letter-to-the-builders";
const PAGE_URL = `https://alicesolutionsgroup.com/${PAGE_SLUG}`;
const PUBLISH_DATE = "2025-10-21T15:00:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "A Letter to the Builders of Tomorrow",
  description:
    "Founder Udi Shkolnik shares the SmartStart vision: why creators deserve a hybrid ecosystem where structure meets soul, and why no builder should build alone.",
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

export default function LetterToBuilders() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleJoinCircle = () => {
    trackArticleCta("join_smartstart_circle");
    window.location.href = "/smartstart";
  };

  const handleContactTeam = () => {
    trackArticleCta("contact_team");
    window.location.href = "/contact";
  };

  return (
    <>
      <Helmet>
        <title>A Letter to the Builders of Tomorrow | SmartStart Hub</title>
        <meta
          name="description"
          content="Read Udi Shkolnik’s invitation to builders everywhere: why SmartStart exists, how the hybrid way works, and why you never have to build alone again."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="A Letter to the Builders of Tomorrow | SmartStart Hub" />
        <meta
          property="og:description"
          content="A personal invitation from SmartStart founder Udi Shkolnik—build your dream with structure, community, and the hybrid way."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="A Letter to the Builders of Tomorrow | SmartStart Hub" />
        <meta
          name="twitter:description"
          content="Build differently. SmartStart founder Udi Shkolnik shares why the hybrid way matters and why no builder should build alone."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="A Letter to the Builders of Tomorrow"
        description="The SmartStart founder’s invitation to creators who want to build differently—where structure meets soul and community fuels momentum."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "SmartStart", url: "/smartstart" },
          { name: "Letter to the Builders of Tomorrow", url: `/${PAGE_SLUG}` },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-10">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Founders collaborating in a creative studio space"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  SmartStart Letter
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">A Letter to the Builders of Tomorrow</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 8 min read
                </p>
              </motion.div>
            </header>

            <LetterToBuildersContent
              afterCallout={
                <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4">
                  <h2>Ready to meet the SmartStart circle?</h2>
                  <p>
                    Join a builder session, explore SmartStart programs, or talk to the team about your next move. Bring the idea—together we’ll build the system
                    around it.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="inline-flex items-center gap-2" onClick={handleJoinCircle}>
                      Explore SmartStart
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="inline-flex items-center gap-2" onClick={handleContactTeam}>
                      Talk to the Team
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </section>
              }
            />
          </article>
        </div>
        <Footer />
      </div>
    </>
  );
}


