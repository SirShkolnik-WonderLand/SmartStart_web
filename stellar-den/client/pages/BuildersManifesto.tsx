import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";
import BuildersManifestoContent from "@/components/BuildersManifestoContent";

const PAGE_SLUG = "builders-manifesto";
const PAGE_URL = `https://alicesolutionsgroup.com/${PAGE_SLUG}`;
const PUBLISH_DATE = "2025-11-12T16:10:00-05:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The SmartStart Builders’ Manifesto",
  description:
    "Twelve guiding principles that power the SmartStart ecosystem—alignment before acceleration, community over competition, and momentum as a shared asset.",
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

export default function BuildersManifesto() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleJoinCircle = () => {
    trackArticleCta("join_manifesto_circle");
    window.location.href = "/smartstart";
  };

  const handleDownloadPlaybook = () => {
    trackArticleCta("download_manifesto_playbook");
    window.location.href = "/resources";
  };

  return (
    <>
      <Helmet>
        <title>The SmartStart Builders’ Manifesto | SmartStart Hub</title>
        <meta
          name="description"
          content="The SmartStart Builders’ Manifesto outlines twelve living principles for building differently—alignment, community, hybrid intelligence, resilience, and more."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="The SmartStart Builders’ Manifesto | SmartStart Hub" />
        <meta
          property="og:description"
          content="Discover the twelve principles guiding SmartStart builders—structure with soul, momentum as a shared asset, and contribution as a reflex."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The SmartStart Builders’ Manifesto | SmartStart Hub" />
        <meta
          name="twitter:description"
          content="Read the SmartStart Builders’ Manifesto—a living constitution for creators who choose alignment, community, and regenerative growth."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="The SmartStart Builders’ Manifesto"
        description="Twelve principles that define how SmartStart operates as a hybrid ecosystem for ambitious, human builders."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "SmartStart", url: "/smartstart" },
          { name: "Builders’ Manifesto", url: `/${PAGE_SLUG}` },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-10">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Builders collaborating over a manifesto document"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  SmartStart Manifesto
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">The SmartStart Builders’ Manifesto</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 10 min read
                </p>
              </motion.div>
            </header>

            <BuildersManifestoContent />

            <section className="mt-10 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4">
              <h2>Carry the manifesto forward</h2>
              <p>
                Invite your team, community, or cohort to adopt the SmartStart principles. Facilitate a session, embed the values into onboarding, or remix them for
                your context.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="inline-flex items-center gap-2" onClick={handleJoinCircle}>
                  Join a Builder Circle
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="inline-flex items-center gap-2" onClick={handleDownloadPlaybook}>
                  Browse SmartStart Resources
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </article>
        </div>
        <Footer />
      </div>
    </>
  );
}


