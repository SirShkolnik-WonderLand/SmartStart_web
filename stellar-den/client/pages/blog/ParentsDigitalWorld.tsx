import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { useArticleAnalytics } from "@/hooks/useArticleAnalytics";

const ARTICLE_SLUG = "parents-digital-world";
const PAGE_URL = "https://alicesolutionsgroup.com/blog/parents-digital-world";
const PUBLISH_DATE = "2025-08-25T09:30:00-04:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Our Kids and Their Digital World: A Parent’s Reality Check",
  description:
    "Udi Shkolnik shares a candid guide for parents navigating their children’s online lives—practical rituals, emotional guardrails, and digital-first wisdom from a cybersecurity dad.",
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

const SECTIONS: Array<{ id: string; title: string; content: JSX.Element }> = [
  {
    id: "playground",
    title: "The New Playground",
    content: (
      <>
        <p>
          When I was young, “going out to play” meant scraped knees, bikes, and streetlights that told us when to go home. For my kids, it’s Minecraft realms,
          Roblox quests, and FaceTime rooms that never really close. Their playground is the internet—and just like any neighborhood, it’s full of joy, noise, hidden
          corners, and real risks.
        </p>
        <p>
          I don’t label it good or bad. I call it what it is: real. It’s where they learn, build, laugh, and get bruised. If we want to keep them safe, we have to
          show up there—not as police, but as parents who understand the terrain.
        </p>
      </>
    ),
  },
  {
    id: "trust",
    title: "The Myth of Control (and the Power of Trust)",
    content: (
      <>
        <p>
          Early on I tried to block, monitor, and lock down every device in our house. Guess what? Curiosity always found a workaround. Kids are wired to explore,
          and if we try to govern every tap and swipe, we lose the only real safety net we have: their trust.
        </p>
        <p>
          So I stopped trying to control and started trying to connect. I sit beside them while they play. I ask them to show me their servers, their streams, their
          chats. When they know I’m interested—not interrogating—they open the door to their digital world willingly.
        </p>
      </>
    ),
  },
  {
    id: "explain",
    title: "How I Explain Cybersecurity to My Kids",
    content: (
      <>
        <p>
          I’ve spent years responding to breaches and phishing attacks. I could terrify my kids with war stories, but fear shuts them down. Instead, I speak in
          metaphors they feel.
        </p>
        <ul>
          <li>
            <strong>The Internet is a City:</strong> it has museums and playgrounds, but also alleys. You don’t fear a city—you learn how to walk through it.
          </li>
          <li>
            <strong>Passwords are Keys:</strong> you wouldn’t hand a stranger the key to our house. Treat logins the same way.
          </li>
          <li>
            <strong>Privacy is a Diary:</strong> you don’t leave it on a bench at school. You protect what matters.
          </li>
        </ul>
        <p>
          Kids understand faster than we think. They just need us to translate cybersecurity into their language, without the jargon or the fear.
        </p>
      </>
    ),
  },
  {
    id: "emotions",
    title: "The Emotional Side Nobody Talks About",
    content: (
      <>
        <p>
          Threat intel doesn’t prepare you for the moment your child compares themselves to a filtered reel or gets hurt by a thoughtless comment. Cybersecurity is
          also emotional security. The internet can be a highlight reel that never ends. I remind my kids that algorithms show more of what we already watch, not
          what’s objectively true.
        </p>
        <p>
          We talk about digital bruises the same way we talk about scraped knees. You can’t avoid them all, but you can teach resilience, perspective, and
          self-worth so one viral moment doesn’t rewrite their story.
        </p>
      </>
    ),
  },
  {
    id: "rituals",
    title: "Our Family Rituals (Not Rules)",
    content: (
      <>
        <p>
          Devices aren’t forbidden in our home—they’re tools that deserve respect. Instead of rigid rules, we hold rituals:
        </p>
        <ul>
          <li>
            <strong>Screen-free meals:</strong> we talk, laugh, and look each other in the eye.
          </li>
          <li>
            <strong>No devices in bedrooms overnight:</strong> sleep is when we literally and emotionally recharge.
          </li>
          <li>
            <strong>Weekly digital reset:</strong> a few hours outdoors or doing something that doesn’t require a charger.
          </li>
        </ul>
        <p>
          We mess up sometimes. I answer Slack messages when I shouldn’t. They sneak a YouTube clip past bedtime. But rituals keep us anchored without turning the
          internet into a forbidden fruit.
        </p>
      </>
    ),
  },
  {
    id: "parents",
    title: "Parents Don’t Need to Be Tech Experts",
    content: (
      <>
        <p>
          I constantly meet parents who feel outmatched by their kids’ tech skills. Here’s the truth: technology evolves daily, human wisdom doesn’t. You don’t need
          to know how to code to teach digital ethics. You just need to model curiosity, critical thinking, and humility.
        </p>
        <p>
          When our kids watch us question an article before sharing it, or see us say “I don’t know, let’s check together,” they learn the core principle of
          cybersecurity: awareness. Presence beats perfection every time.
        </p>
      </>
    ),
  },
  {
    id: "family-security",
    title: "The New Family Security Stack",
    content: (
      <>
        <p>
          Firewalls and antivirus matter, but in my house, the real firewall is conversation. The strongest encryption is love. And the best patch is a parent who
          listens without judgment.
        </p>
        <p>
          I want my kids to come to me before they run to Google. That only happens if they believe I’ll respond with guidance, not panic. So I learn their slang,
          I understand their platforms, I ask about their favorite creators—not to spy, but to earn proximity.
        </p>
      </>
    ),
  },
  {
    id: "creators",
    title: "Raising Creators, Not Just Consumers",
    content: (
      <>
        <p>
          My hope is that our kids won’t just scroll through the digital world—they’ll build it. When we encourage them to design websites, code simple games, or
          record a podcast, they stop being the product and start becoming the producer.
        </p>
        <p>
          Creation flips the power dynamic. Instead of being pulled by feeds, they learn how to bend technology toward their own purpose. That’s how future leaders
          are born.
        </p>
      </>
    ),
  },
];

export default function ParentsDigitalWorld() {
  const { isExpanded } = useSidebar();
  const { trackArticleCta } = useArticleAnalytics(ARTICLE_SLUG);

  const handleContact = () => {
    trackArticleCta("connect_with_team");
    window.location.href = "/contact";
  };

  return (
    <>
      <Helmet>
        <title>Our Kids and Their Digital World: A Parent’s Reality Check</title>
        <meta
          name="description"
          content="Cybersecurity expert and dad Udi Shkolnik shares how to guide kids through the digital world—without fear, without control, and with a lot of heart."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Our Kids and Their Digital World: A Parent’s Reality Check" />
        <meta
          property="og:description"
          content="A deeply personal guide for parents raising digital natives—built on trust, rituals, and cybersecurity wisdom from Udi Shkolnik."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Our Kids and Their Digital World: A Parent’s Reality Check" />
        <meta
          name="twitter:description"
          content="Udi Shkolnik on parenting, cybersecurity, and raising resilient creators in an always-on world."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA-ON" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <StructuredData
        type="article"
        title="Our Kids and Their Digital World: A Parent’s Reality Check"
        description="A cybersecurity father’s playbook for guiding kids through the internet with trust, empathy, and practical rituals."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: "Our Kids and Their Digital World", url: "/blog/parents-digital-world" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-10">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Parent guiding a child while looking at a tablet together"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Smart Parenting
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Our Kids and Their Digital World: A Parent’s Reality Check</h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 8 min read · By Udi
                  Shkolnik
                </p>
              </motion.div>
            </header>

            <section className="space-y-6">
              <p>
                I’ve spent years securing companies from breaches, scams, and data leaks. Yet what keeps me awake isn’t corporate damage—it’s our kids. They’re
                growing up in a world where the line between physical and digital disappeared before they learned to tie their shoes. We warned them about dark
                corners in neighborhoods. Now the corners stretch across glowing screens that never sleep.
              </p>
              <p>
                We can’t—and shouldn’t—lock them out. The internet is where they’ll learn, build, and connect. Our job isn’t to fear it. Our job is to guide them
                through it with patience, empathy, and grounded wisdom.
              </p>
            </section>

            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="space-y-5">
                <h2>{section.title}</h2>
                {section.content}
              </section>
            ))}

            <section className="space-y-4">
              <h2>The Invitation to Other Parents</h2>
              <p>
                None of us grew up with this. There’s no manual. We’re learning in real time between work calls, grocery lists, and bedtime stories. The best thing
                we can do is stay present, keep learning, and let our kids teach us about their world while we teach them how to stay human inside it.
              </p>
              <p>
                One day they’ll be the ones teaching the next generation how to stay grounded in the digital storm. Let’s give them the confidence, awareness, and
                heart they’ll need to do it well.
              </p>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4">
              <h2>Need help building your family’s digital playbook?</h2>
              <p>
                Whether you want a safety workshop for your school, a SmartStart session for your teen founders, or help designing household tech rituals, I’d love
                to support. Reach out—we’ll build your plan together.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={handleContact}>
                Connect with us
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


