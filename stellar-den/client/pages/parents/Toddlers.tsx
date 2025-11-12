import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Shield, Smile, ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";

const PAGE_SLUG = "parents-toddlers";
const PAGE_URL = "https://alicesolutionsgroup.com/community/parents/toddlers";
const PUBLISH_DATE = "2025-08-05T08:30:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1524946824812-73d272d862e2?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Toddlers & Early Learners: First Steps in Digital Safety",
  description:
    "Guidance from Udi Shkolnik on introducing technology to toddlers ages 2-6—screen rituals, smart-toy safety, and calm parent-child conversations.",
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

const DAILY_RITUALS = [
  {
    title: "Co-View Always",
    description: "Toddlers learn through mirroring. Sit beside them during any new show or app so your reactions become their compass.",
  },
  {
    title: "Name the Feeling",
    description: "When they laugh, pause, or get overwhelmed, name the emotion aloud. You’re building emotional awareness before they can articulate it.",
  },
  {
    title: "Close with a Hug",
    description: "End every digital session with a physical reset—close the device, stand up, hug, and celebrate what they observed or created.",
  },
];

const SMART_TOY_TIPS = [
  "Only enable microphones/cameras when you are present, and mute them afterward.",
  "Create a guest Wi-Fi network for smart toys so they stay off your primary household network.",
  "Rotate new toys slowly. Introduce one, explore it together for a week, then decide if it stays.",
];

export default function ParentsToddlers() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleDownloadRoutine = () => {
    trackArticleCta("download_toddler_routine");
    window.location.href = "/resources/toddler-digital-routine.pdf";
  };

  return (
    <>
      <Helmet>
        <title>Toddlers & Early Learners | SmartStart Parent Guidance</title>
        <meta
          name="description"
          content="Introduce technology to toddlers ages 2-6 with confidence. SmartStart founder Udi Shkolnik shares rituals, smart-toy setup tips, and conversation starters."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Toddlers & Early Learners | SmartStart Parent Guidance" />
        <meta
          property="og:description"
          content="Screen-time rituals, smart-toy safety, and calm tech conversations for toddlers—curated by cybersecurity dad Udi Shkolnik."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Toddlers & Early Learners | SmartStart Parent Guidance" />
        <meta
          name="twitter:description"
          content="Practical rituals and smart-toy safety tips that help parents introduce technology to toddlers the SmartStart way."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="Toddlers & Early Learners: First Steps in Digital Safety"
        description="SmartStart rituals and smart-toy safety tips for parents introducing technology to toddlers."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community-hub" },
          { name: "Parent Hub", url: "/community/parents" },
          { name: "Toddlers & Early Learners", url: "/community/parents/toddlers" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-12">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Parent and toddler using a tablet together"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Ages 2-6
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Toddlers & Early Learners: First Steps in Digital Safety</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 6 min read · By Udi
                  Shkolnik
                </p>
                <p className="text-base text-muted-foreground">
                  This is the stage where curiosity outruns caution. Instead of banning screens altogether, we can turn every tech moment into a lesson in
                  connection and calm confidence. Here’s how I guide families through those first digital steps.
                </p>
              </motion.div>
            </header>

            <section className="space-y-4 mb-10">
              <h2>Start With Slow Rituals</h2>
              <p>
                Toddlers thrive on repetition and predictability. Before you ever open an app, set the tone with rituals that make technology feel safe, shared, and
                finite.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {DAILY_RITUALS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Smart-Toy & Tablet Safety Checklist</h2>
              <p>
                Smart toys and learning tablets can be magical—if adults set them up with intention. Before your toddler explores, run this checklist together. Turn
                it into a game where your child “helps” secure their new toy.
              </p>
              <ul>
                {SMART_TOY_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Script Your Conversations</h2>
              <p>
                A toddler’s world is literal. Use short, friendly scripts to explain why you’re making choices. Scripts help caregivers stay calm and give children
                language they’ll mimic later.
              </p>
              <ul>
                <li>
                  <strong>“Let’s look together.”</strong> Diffuses nervousness before hitting play on a new video.
                </li>
                <li>
                  <strong>“The tablet is resting now.”</strong> Signals the end of screen time without blame.
                </li>
                <li>
                  <strong>“We only watch what mom/dad says yes to.”</strong> Builds decision-making anchored in trust.
                </li>
              </ul>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Design the Environment</h2>
              <p>
                Before the device turns on, design the physical environment to support focus and emotional security. Technology should happen in shared spaces with
                plenty of eye contact and conversation.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Create a “Tech Picnic”</h3>
                  <p className="text-sm text-muted-foreground">
                    Lay a blanket on the floor, place the tablet in the center, and sit together. Shared proximity fosters co-viewing and makes transitions easier.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Use Analog Anchors</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep crayons, blocks, or stuffed animals nearby. Encourage your child to retell digital stories through physical play immediately afterward.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4 mb-12">
              <h2>SmartStart Toddler Toolkit</h2>
              <p>
                I assembled a ready-to-use kit for families introducing technology to toddlers. It includes screen-time tokens, co-viewing prompts, and smart-toy
                setup checklists.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleDownloadRoutine}>
                Download the toolkit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="grid md:grid-cols-3 gap-4 mb-14">
              <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                <Shield className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-base font-semibold text-foreground">Parental Controls Primer</h3>
                <p className="text-sm text-muted-foreground">Step-by-step videos for configuring Netflix Kids, Disney+, YouTube Kids, and Apple TV profiles.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                <Smile className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-base font-semibold text-foreground">Mindful Screen Charts</h3>
                <p className="text-sm text-muted-foreground">Printable charts that reward eye contact, shared storytelling, and post-screen outdoor time.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                <CalendarCheck className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-base font-semibold text-foreground">Weekly Digital Reset</h3>
                <p className="text-sm text-muted-foreground">A Sunday ritual for cleaning devices, rotating apps, and reviewing favorite shows together.</p>
              </div>
            </section>

            <section className="rounded-3xl border border-border/60 bg-primary/10 p-6 shadow-xl space-y-4">
              <h2>Need a 1:1 Coaching Session?</h2>
              <p>
                We run private 45-minute consultations for parents, grandparents, and caregivers introducing technology for the first time. Book a time and we’ll
                tailor a plan to your child’s developmental stage.
              </p>
              <Button variant="default" className="inline-flex items-center gap-2" onClick={() => window.location.href = "/contact"}>
                Book a parent strategy call
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="space-y-4 mt-14">
              <h2>Canadian Guidance Worth Knowing</h2>
              <p>
                Canada’s Chief Public Health Officer recommends limiting screen time for children aged 2-5 to less than one hour per day of high-quality programs
                (<a className="text-primary" href="https://www.canada.ca/en/public-health/services/health-promotion/childhood-obesity/childhood-obesity-healthy-active-living.html" target="_blank" rel="noopener noreferrer">CPHO Guidelines</a>).
                Use that hour intentionally: co-viewing educational content or video calling relatives. The Canadian Centre for Cyber Security also reminds parents to
                keep IoT toys patched and to change default passwords immediately (
                <a className="text-primary" href="https://www.cyber.gc.ca/en/guidance/connected-family-home" target="_blank" rel="noopener noreferrer">Connected Family Home</a>).
              </p>
            </section>

            <section className="space-y-4">
              <h2>Trusted Early Learning Platforms</h2>
              <ul>
                <li>
                  <strong>TVOKids</strong> — Ontario’s publicly funded educational platform with ad-free programming aligned with the provincial curriculum.
                </li>
                <li>
                  <strong>National Film Board of Canada — Mini Lessons</strong> — Short films curated for preschoolers, available in English and French.
                </li>
                <li>
                  <strong>Khan Academy Kids</strong> — A free literacy and numeracy program developed with Stanford experts; includes offline mode for travel.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2>FAQ for Caregivers & Grandparents</h2>
              <div className="space-y-3">
                <div>
                  <h3>Should toddlers video chat with relatives?</h3>
                  <p>
                    Yes—video chats are considered “interactive screen time” and support language development according to the American Academy of Pediatrics and
                    Canadian Paediatric Society. Keep sessions short and involve physical play (“show Nana your blocks”).
                  </p>
                </div>
                <div>
                  <h3>What about smart speakers like Amazon Echo or Google Nest?</h3>
                  <p>
                    Treat them like open microphones. Mute when not in use, disable voice purchasing, and build routines where you model polite voice commands and
                    critical thinking (“Is that answer true? Let’s double-check.”).
                  </p>
                </div>
              </div>
            </section>
          </article>
        </div>
        <Footer />
      </div>
    </>
  );
}


