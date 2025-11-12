import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Brain, Share2, Lock, ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";

const PAGE_SLUG = "parents-pre-teens";
const PAGE_URL = "https://alicesolutionsgroup.com/community/parents/pre-teens";
const PUBLISH_DATE = "2025-09-05T09:45:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1522199992405-78d3c608e7bf?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Pre-Teen Navigators: Managing Social Currents with Confidence",
  description:
    "Udi Shkolnik equips parents of ages 11-13 with scripts, resilience exercises, and privacy setups that keep kids steady when social feeds speed up.",
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

const RESILIENCE_DRILLS = [
  {
    title: "Pause & Screenshot",
    description: "Teach your pre-teen to capture evidence before responding. Screenshots become anchors for calm conversations and escalation if needed.",
  },
  {
    title: "Switch the Lens",
    description: "When they receive a hurtful comment, practice rewriting it from an empathetic viewpoint. This builds distance and de-escalation skills.",
  },
  {
    title: "Digital Diary",
    description: "Encourage them to journal how certain apps make them feel. Patterns emerge, making it easier to curate feeds intentionally.",
  },
];

const PRIVACY_SETUP = [
  "Review every social platform’s privacy settings together each quarter. New defaults appear silently—stay ahead of them.",
  "Create a code word that means “come help me now” without alerting friends on calls or streams.",
  "Audit third-party logins and revoke access to inactive games or quizzes.",
];

export default function ParentsPreTeens() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleDownloadToolkit = () => {
    trackArticleCta("download_preteen_toolkit");
    window.location.href = "/resources/preteen-digital-toolkit.pdf";
  };

  return (
    <>
      <Helmet>
        <title>Pre-Teen Navigators | SmartStart Parent Guidance</title>
        <meta
          name="description"
          content="Support ages 11-13 with SmartStart resilience drills, privacy setups, and social scripts crafted by cybersecurity dad Udi Shkolnik."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Pre-Teen Navigators | SmartStart Parent Guidance" />
        <meta
          property="og:description"
          content="Build empathy, privacy, and confidence before teens hit high school. Practical guidance for every pre-teen family."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pre-Teen Navigators | SmartStart Parent Guidance" />
        <meta
          name="twitter:description"
          content="Help pre-teens navigate social feeds, first smartphones, and group chats with SmartStart rituals."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="Pre-Teen Navigators: Managing Social Currents with Confidence"
        description="Resilience drills, social scripts, and privacy audits for ages 11-13, curated by Udi Shkolnik."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community-hub" },
          { name: "Parent Hub", url: "/community/parents" },
          { name: "Pre-Teen Navigators", url: "/community/parents/pre-teens" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-12">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Pre-teen using a tablet with parent supervision"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Ages 11-13
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Pre-Teen Navigators: Managing Social Currents with Confidence</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 8 min read · By Udi
                  Shkolnik
                </p>
                <p className="text-base text-muted-foreground">
                  Pre-teens live in the in-between: too old for hand-holding, too young for full autonomy. This guide helps you build joint decision-making before
                  high school accelerates everything.
                </p>
              </motion.div>
            </header>

            <section className="space-y-4 mb-10">
              <h2>Co-Create a Digital Charter</h2>
              <p>
                Let your pre-teen help design the family charter. Break it into three columns: “What I promise,” “What I expect from my parents,” and “What we do
                when something goes wrong.” Ownership lowers defensiveness and sets the stage for honest disclosures.
              </p>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Run Weekly Resilience Drills</h2>
              <p>
                Just like sports or music, digital resilience is a muscle. Every Sunday, practice one drill from the list below. Keep it short, direct, and rooted
                in empathy.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {RESILIENCE_DRILLS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                    <Brain className="w-6 h-6 text-primary mb-3" />
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Upgrade Privacy Settings Together</h2>
              <p>
                Pre-teens are ready to understand the “why” behind privacy. Walk them through each change. Frame the conversation as empowerment, not fearmongering.
              </p>
              <ul>
                {PRIVACY_SETUP.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Coach Emotional Intelligence Online</h2>
              <p>
                Middle school years amplify social comparison. Normalize talking about anxiety, envy, and digital fatigue. Share your own stories—kids trust what we
                model more than what we mandate.
              </p>
              <ul>
                <li>
                  <strong>Talk about the highlight reel:</strong> Explain that most people post their best five minutes. Ask what “real life” might look like
                  behind a reel.
                </li>
                <li>
                  <strong>Practice exit lines:</strong> “I’m going to log off now” or “This chat feels off” equip them to leave group threads gracefully.
                </li>
                <li>
                  <strong>Celebrate offline wins:</strong> Make sure their identity is anchored in hobbies, friendships, and achievements beyond the screen.
                </li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4 mb-12">
              <h2>SmartStart Pre-Teen Toolkit</h2>
              <p>
                Download prompts, conversation cards, and a privacy audit worksheet designed specifically for ages 11-13. Use it during your weekly family lab.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleDownloadToolkit}>
                Download the toolkit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="rounded-3xl border border-border/60 bg-primary/10 p-6 shadow-xl space-y-4">
              <h2>Invite Us to Your Middle School</h2>
              <p>
                We deliver SmartStart Pre-Teen assemblies and parent nights across Ontario. Students practice real-world scenarios while parents learn the support
                scripts that keep conversations open.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={() => (window.location.href = "/contact")}>
                Bring SmartStart to our school
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


