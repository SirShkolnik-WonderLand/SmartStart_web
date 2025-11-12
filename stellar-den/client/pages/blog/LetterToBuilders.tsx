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

const ARTICLE_SLUG = "letter-to-the-builders";
const PAGE_URL = "https://alicesolutionsgroup.com/blog/letter-to-the-builders";
const PUBLISH_DATE = "2025-11-12T15:00:00-05:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "A Letter to the Builders of Tomorrow",
  description:
    "Founder Udi Shkolnik invites builders to the SmartStart ecosystem: a hybrid way where structure meets soul and no creator has to build alone.",
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

export default function LetterToBuildersBlog() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(ARTICLE_SLUG);

  const handleExploreSmartStart = () => {
    trackArticleCta("explore_smartstart_blog");
    window.location.href = "/smartstart";
  };

  return (
    <>
      <Helmet>
        <title>A Letter to the Builders of Tomorrow | SmartStart Blog</title>
        <meta
          name="description"
          content="Breathe life into your ideas with SmartStart. Founder Udi Shkolnik shares a personal letter to builders who want to create with integrity and community."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="A Letter to the Builders of Tomorrow | SmartStart Blog" />
        <meta
          property="og:description"
          content="SmartStart founder Udi Shkolnik invites builders to create differently—where structure meets soul and community fuels momentum."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="A Letter to the Builders of Tomorrow | SmartStart Blog" />
        <meta
          name="twitter:description"
          content="Join the SmartStart movement. A letter from founder Udi Shkolnik to builders who won’t settle for traditional playbooks."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="A Letter to the Builders of Tomorrow"
        description="Read the personal letter inviting builders into the SmartStart hybrid ecosystem."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: "A Letter to the Builders of Tomorrow", url: "/blog/letter-to-the-builders" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-10">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Founder writing a letter to a community of builders"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  SmartStart Stories
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
                  <h2>Bring your idea to the SmartStart table</h2>
                  <p>
                    Builders across Canada are joining intimate circles, learning the hybrid way, and turning sparks into systems. Grab a seat—we saved one for you.
                  </p>
                  <Button className="inline-flex items-center gap-2" onClick={handleExploreSmartStart}>
                    Explore SmartStart
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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


