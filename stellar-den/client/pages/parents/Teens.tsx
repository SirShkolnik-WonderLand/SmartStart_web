import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Target, Rocket, LockOpen, ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";

const PAGE_SLUG = "parents-teens";
const PAGE_URL = "https://alicesolutionsgroup.com/community/parents/teens";
const PUBLISH_DATE = "2025-09-20T11:15:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Teen Trailblazers: Coaching Digital Independence",
  description:
    "Udi Shkolnik outlines how to coach teens ages 14-17 through social media pressure, anonymous apps, digital careers, and safeguarding their future reputation.",
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

const FUTURE_SESSIONS = [
  {
    title: "Personal Brand Audit",
    description: "Search their name together, audit old posts, and archive anything that doesn’t align with who they’re becoming.",
  },
  {
    title: "Portfolio Building",
    description: "Encourage teens to collect school projects, certifications, and side hustle wins into a simple digital portfolio.",
  },
  {
    title: "Financial Literacy Online",
    description: "Discuss crypto, online marketplaces, and microtransactions so they spot scams before money moves.",
  },
];

const SAFETY_PILLARS = [
  "Two-factor authentication on every key platform. Teens manage it, parents keep backup codes.",
  "Quarterly review of app permissions—location, contacts, microphone. Remove anything that isn’t essential.",
  "Anonymous app agreement: test together, set exit rules, and ensure teens know they can escalate without judgment.",
];

export default function ParentsTeens() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(PAGE_SLUG);

  const handleBookCoaching = () => {
    trackArticleCta("book_teen_coaching");
    window.location.href = "/contact";
  };

  return (
    <>
      <Helmet>
        <title>Teen Trailblazers | SmartStart Parent Guidance</title>
        <meta
          name="description"
          content="Support ages 14-17 with SmartStart coaching on digital identity, career readiness, anonymous apps, and safeguarding their future."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Teen Trailblazers | SmartStart Parent Guidance" />
        <meta
          property="og:description"
          content="Equip teens with digital resilience, career-building skills, and safety systems curated by cybersecurity dad Udi Shkolnik."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Teen Trailblazers | SmartStart Parent Guidance" />
        <meta
          name="twitter:description"
          content="Practical rituals for social media, anonymous apps, and digital careers—crafted for teens ages 14-17."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="Teen Trailblazers: Coaching Digital Independence"
        description="SmartStart guidance for teens ready to build their digital reputation and career pathways."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community-hub" },
          { name: "Parent Hub", url: "/community/parents" },
          { name: "Teen Trailblazers", url: "/community/parents/teens" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-12">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Teen working on a laptop building digital projects"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Ages 14-17
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Teen Trailblazers: Coaching Digital Independence</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 9 min read · By Udi
                  Shkolnik
                </p>
                <p className="text-base text-muted-foreground">
                  Teens are ready for real autonomy. Our job shifts from gatekeeping to coaching. This guide reframes “don’t do that” into “here’s how to do it well
                  and stay safe.”
                </p>
              </motion.div>
            </header>

            <section className="space-y-4 mb-10">
              <h2>Redefine Trust as Partnership</h2>
              <p>
                Replace monitoring with partnership agreements. Create monthly check-ins where teens showcase their online wins, discuss challenges, and ask for
                support. Trust is built when they know they can escalate issues without losing privileges.
              </p>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Safety Pillars for Every Teen Household</h2>
              <p>Use these three pillars as your non-negotiables. They protect identities, finances, and emotional health.</p>
              <ul>
                {SAFETY_PILLARS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Coach Digital Legacy</h2>
              <p>
                Teens are already building their future resumes online. Help them curate content that reflects their values and ambitions. Celebrate positive
                footprint moments so the internet becomes a portfolio, not a liability.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {FUTURE_SESSIONS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm">
                    <Rocket className="w-6 h-6 text-primary mb-3" />
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Entrepreneurial & Career Pathways</h2>
              <p>
                Teens are launching micro-businesses, freelancing, and experimenting with creator platforms. Train them to track income, protect IP, and separate
                business from personal accounts. Encourage them to build LinkedIn and GitHub profiles early—it signals maturity.
              </p>
            </section>

            <section className="space-y-4 mb-10">
              <h2>Support Mental Health in Public Spaces</h2>
              <p>
                Talk openly about burnout, doomscrolling, and online perfectionism. Encourage scheduled digital sabbaths and embed mindfulness exercises before they
                open social apps. Teens who can notice their emotional shifts can navigate feeds without being consumed by them.
              </p>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4 mb-12">
              <h2>Launch Smart Careers: Teen Coaching</h2>
              <p>
                We offer 1:1 coaching for resume-ready teens. They receive a digital identity audit, networking plan, and cybersecurity checklist tailored to their
                ambitions.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleBookCoaching}>
                Book teen coaching
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="rounded-3xl border border-border/60 bg-primary/10 p-6 shadow-xl space-y-4">
              <h2>Bring SmartStart to Your High School</h2>
              <p>
                From digital citizenship assemblies to cyber-career bootcamps, we partner with high schools across the GTA. Teens leave empowered to lead, not just
                scroll.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={() => (window.location.href = "/contact")}>
                Schedule a school program
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="space-y-4 mt-14">
              <h2>Scholarships, Programs & Resources</h2>
              <ul>
                <li>
                  <strong>CyberTitan (ICTC Canada):</strong> National cybersecurity competition where Canadian high school teams practice incident response and ethical hacking.
                </li>
                <li>
                  <strong>Mitacs Youth Programs:</strong> Early research internships and innovation challenges that introduce teens to Canadian tech careers.
                </li>
                <li>
                  <strong>Toronto Public Library — Digital Innovation Hubs:</strong> Free access to Adobe Creative Cloud, podcast studios, and 3D printers with orientation sessions.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2>Frequently Asked Questions for Teen Families</h2>
              <div className="space-y-3">
                <div>
                  <h3>Should teens use anonymous platforms?</h3>
                  <p>
                    We advise using them sparingly and with a clear exit strategy. Test the app together, check moderation policies, and agree on warning signs that
                    mean it’s time to delete. Encourage teens to screenshot anything concerning and debrief with you immediately.
                  </p>
                </div>
                <div>
                  <h3>How do we support entrepreneur teens safely?</h3>
                  <p>
                    Register a business number if earnings exceed hobby income, separate personal and business finances, and teach invoice tracking. Review CRA
                    youth entrepreneurship guidance and ensure payment platforms use MFA and strong passwords.
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


