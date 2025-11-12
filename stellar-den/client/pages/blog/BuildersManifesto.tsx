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

const ARTICLE_SLUG = "builders-manifesto";
const PAGE_URL = "https://alicesolutionsgroup.com/blog/builders-manifesto";
const PUBLISH_DATE = "2025-10-24T10:30:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The SmartStart Builders’ Manifesto",
  description:
    "Explore the twelve guiding principles of SmartStart—alignment before acceleration, community over competition, hybrid intelligence, and more.",
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

export default function BuildersManifestoBlog() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(ARTICLE_SLUG);

  const handleJoinCircle = () => {
    trackArticleCta("join_circle_blog");
    window.location.href = "/smartstart";
  };

  return (
    <>
      <Helmet>
        <title>The SmartStart Builders’ Manifesto | SmartStart Blog</title>
        <meta
          name="description"
          content="A public declaration of SmartStart’s shared philosophy. Learn the twelve principles that guide how we build differently—together."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="The SmartStart Builders’ Manifesto | SmartStart Blog" />
        <meta
          property="og:description"
          content="From alignment before acceleration to momentum as a shared asset, this manifesto defines the SmartStart way."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The SmartStart Builders’ Manifesto | SmartStart Blog" />
        <meta
          name="twitter:description"
          content="A manifesto for builders who blend structure with soul. These twelve principles power the SmartStart ecosystem."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="The SmartStart Builders’ Manifesto"
        description="The SmartStart constitution for creators who refuse to build alone."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: "SmartStart Builders’ Manifesto", url: "/blog/builders-manifesto" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-10">
              <motion.img
                src={FEATURE_IMAGE}
                alt="SmartStart community collaborating in a studio"
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
              <h2>Bring the manifesto to your crew</h2>
              <p>
                Host a workshop, run a founder circle, or simply share the manifesto with someone who needs it. We’re building the future one aligned builder at a
                time.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleJoinCircle}>
                Join SmartStart
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


