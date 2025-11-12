import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { BookCheck, Gamepad2, MessageCircle, ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";

const PAGE_SLUG = "parents-grade-school";
const PAGE_URL = "https://alicesolutionsgroup.com/community/parents/grade-school";
const PUBLISH_DATE = "2025-08-18T09:00:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1597438150870-90af06d827da?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Grade School Explorers: Building Healthy Digital Habits",
  description:
    "SmartStart founder Udi Shkolnik shares rituals and safety coaching for ages 7-10: first devices, gaming chats, digital empathy, and family tech contracts.",
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

const KEY_CONVERSATIONS = [
  {
    title: "The Power of Pause",
    description:
      "Teach your child to pause and ask before accepting friend requests or in-game trades. Role-play scenarios so ‘ask first’ becomes instinct, not suspicion.",
  },
  {
    title: "Words Have Weight",
    description:
      "Emphasize that real humans sit behind every avatar. Talk about how words land on others; have them read their own messages aloud before sending.",
  },
  {
    title: "Screens Need Context",
    description:
      "Explain how algorithms surface more of what we watch. Together, intentionally search for inspiring stories or educational content to rebalance feeds.",
  },
];

const FAMILY_SYSTEMS = [
  "Create a shared charging station in the kitchen. Devices sleep there overnight.",
  "Introduce a family tech contract and revisit it each school term. Let your child co-author sections so accountability feels mutual.",
  "Use app timers collaboratively. Ask, “How much time feels right for this game today?” and set the limit together.",
];

export default function ParentsGradeSchool() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleDownloadContract = () => {
    trackArticleCta("download_grade_contract");
    window.location.href = "/resources/family-tech-contract.pdf";
  };

  return (
    <>
      <Helmet>
        <title>Grade School Explorers | SmartStart Parent Guidance</title>
        <meta
          name="description"
          content="Help ages 7-10 build safe digital habits. Udi Shkolnik shares first-device rituals, gaming chat safety, and empathetic communication scripts."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Grade School Explorers | SmartStart Parent Guidance" />
        <meta
          property="og:description"
          content="SmartStart rituals for grade school kids: family tech contracts, co-play coaching, and digital empathy training."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Grade School Explorers | SmartStart Parent Guidance" />
        <meta
          name="twitter:description"
          content="Age-appropriate digital safety for grades 2-5—crafted by cybersecurity dad Udi Shkolnik."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="Grade School Explorers: Building Healthy Digital Habits"
        description="Rituals for first devices, gaming chats, and digital empathy—crafted by Udi Shkolnik for families with kids ages 7-10."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community-hub" },
          { name: "Parent Hub", url: "/community/parents" },
          { name: "Grade School Explorers", url: "/community/parents/grade-school" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-12">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Parent guiding grade school children on a laptop"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Ages 7-10
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Grade School Explorers: Building Healthy Digital Habits</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 7 min read · By Udi
                  Shkolnik
                </p>
                <p className="text-base text-muted-foreground">
                  Grade schoolers crave independence but still need scaffolding. This guide turns screens into shared experiments, not unsupervised escapes.
                  Together we’ll build confidence, empathy, and informed curiosity.
                </p>
              </motion.div>
            </header>

            <section className="space-y-4 mb-10">
              <h2>Build Family Systems (Not Policing)</h2>
              <p>
                Systems beat strictness. When your child helps set expectations, they become a partner in protectiveness. Use these anchors to keep energy warm and
                collaborative.
              </p>
              <ul>
                {FAMILY_SYSTEMS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Co-Play the First 10 Sessions</h2>
              <p>
                New games and apps always start with co-play. For the first ten sessions, sit beside your child. Ask what they’re building, who they’re chatting
                with, what made them choose a certain avatar. Co-play teaches them how to narrate their digital experience.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                  <Gamepad2 className="w-6 h-6 text-primary mb-3" />
                  <h3 className="text-base font-semibold">Narrate Actions</h3>
                  <p className="text-sm text-muted-foreground">Encourage them to say out loud what they’re tapping and why. You’re training reflective thinking.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                  <MessageCircle className="w-6 h-6 text-primary mb-3" />
                  <h3 className="text-base font-semibold">Role-Play Responses</h3>
                  <p className="text-sm text-muted-foreground">Practice how to say “no thank you” to friend requests or uncomfortable messages.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                  <BookCheck className="w-6 h-6 text-primary mb-3" />
                  <h3 className="text-base font-semibold">Review Inventory</h3>
                  <p className="text-sm text-muted-foreground">Help them track virtual currency and explain why scammers target in-game trades.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Conversation Scripts That Stick</h2>
              <p>Grade schoolers love scripts—they repeat them word for word. Share these lines and let them practice with siblings or stuffed animals.</p>
              <ul>
                <li>
                  <strong>“I only chat with people I know in real life.”</strong> Creates a default boundary for multiplayer games.
                </li>
                <li>
                  <strong>“Can we check this video together?”</strong> Encourages them to invite you into YouTube rabbit holes before diving alone.
                </li>
                <li>
                  <strong>“Let’s ask dad first.”</strong> Build the reflex of seeking adult guidance before downloads or purchases.
                </li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4 mb-12">
              <h2>Download the SmartStart Family Tech Contract</h2>
              <p>
                This contract is designed for grades 2-5 and includes sections your child can sign. It covers device care, online kindness, and what happens when
                something feels off.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleDownloadContract}>
                Get the contract
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Weekly Home Lab</h2>
              <p>
                Spend 20 minutes every Sunday running a “home lab.” Review new friend requests, clean up browser history, adjust volume levels, and check physical
                posture. Make it collaborative and reward ownership.
              </p>
              <p>
                Encourage your child to “present” their favorite discoveries from the week. When they show you a video or game mechanic they loved, your questions
                become coaching moments rather than interrogation.
              </p>
            </section>

            <section className="rounded-3xl border border-border/60 bg-primary/10 p-6 shadow-xl space-y-4">
              <h2>Want a Classroom or PTA Workshop?</h2>
              <p>
                We run SmartStart Grade School intensives for classes, PTAs, and community groups across the GTA. Kids build safety reflexes while parents learn
                coaching scripts they can use the same night.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={() => (window.location.href = "/contact")}>
                Request a workshop
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


