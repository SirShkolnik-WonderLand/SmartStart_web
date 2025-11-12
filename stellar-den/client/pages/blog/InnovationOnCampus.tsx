import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const PAGE_URL = "https://alicesolutionsgroup.com/blog/innovation-on-campus";
const PUBLISH_DATE = "2025-11-12T09:15:00-05:00";
const FEATURE_IMAGE = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Innovation on Campus: How Canadian University Students Can Turn Ideas into Impact",
  description:
    "Canadian university students can turn campus innovation opportunities into real impact. Learn why it matters, what pathways exist, and how to get started this semester.",
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

const sections: Array<{ headingId: string; heading: string; content: JSX.Element }> = [
  {
    headingId: "toc",
    heading: "Quick reference (table of contents)",
    content: (
      <ul>
        <li>
          <a className="text-primary font-medium" href="#why-innovation">
            Why innovation at university matters—in Canada, now
          </a>
        </li>
        <li>
          <a className="text-primary font-medium" href="#pathways">
            What’s available for you: student innovation pathways
          </a>
        </li>
        <li>
          <a className="text-primary font-medium" href="#roadmap">
            Your innovation roadmap: a semester plan to get going
          </a>
        </li>
        <li>
          <a className="text-primary font-medium" href="#future-advantages">
            Why this matters for your future
          </a>
        </li>
        <li>
          <a className="text-primary font-medium" href="#hurdles">
            Common hurdles & how to overcome them
          </a>
        </li>
        <li>
          <a className="text-primary font-medium" href="#checklist">
            A quick checklist to keep handy
          </a>
        </li>
        <li>
          <a className="text-primary font-medium" href="#final-thoughts">
            Final thoughts
          </a>
        </li>
      </ul>
    ),
  },
  {
    headingId: "why-innovation",
    heading: "Why innovation at university matters—in Canada, now",
    content: (
      <>
        <p>
          Innovation isn’t just a buzzword. In Canada, post-secondary institutions and students are playing a key role in shaping future industries, societal
          change, and economic growth. Canada’s leading research universities account for over 75% of industry-sponsored R&D. ([U15 Canada][1])
        </p>
        <p>
          Universities like Ontario Tech are involving undergrads and grads alike in entrepreneurial and innovation programmes, offering hands-on experience in
          labs, maker spaces, and industry partnerships. ([Ontario Tech University Research][2])
        </p>
        <p>
          From climate tech to digital health, from AI tools to social enterprises—Canadian students today have unique opportunities to turn ideas into solutions.
        </p>
      </>
    ),
  },
  {
    headingId: "pathways",
    heading: "What’s available for you: student innovation pathways",
    content: (
      <>
        <p>
          You don’t need to wait until graduation to start building. There are accessible, meaningful innovation paths across Canadian campuses right now. Here are
          a few:
        </p>
        <ol>
          <li>
            <strong>Student-led innovation clubs and competitions</strong>: Groups like Enactus Canada empower students to develop social enterprises, network with
            peers, and pitch real ideas. ([Enactus Canada][3])
          </li>
          <li>
            <strong>Research and innovation labs tied to your university</strong>: Institutions like the University of Toronto offer co-working space, IP
            training, and industry connections through research and innovation hubs. ([University of Toronto Research][4])
          </li>
          <li>
            <strong>Cross-discipline teaming and community-engaged projects</strong>: Innovation thrives when different disciplines work together. The University
            of Victoria’s community-engaged software engineering model is a great example. ([arXiv][5])
          </li>
          <li>
            <strong>Government funding and innovation support</strong>: Canada’s innovation funding programmes provide R&D support, commercialization help, and
            regional innovation assistance. ([Canada][6])
          </li>
        </ol>
      </>
    ),
  },
  {
    headingId: "roadmap",
    heading: "Your innovation roadmap: a semester plan to get going",
    content: (
      <>
        <p>Here’s a suggested roadmap to turn an idea into action over the next 3–4 months:</p>
        <ol>
          <li>
            <strong>Week 1-2 – Ideate & reflect</strong>: Observe pain points on campus or in the community; jot down at least five.
          </li>
          <li>
            <strong>Week 3-4 – Form a team & pick one idea</strong>: Partner with classmates from other faculties; set a clear, achievable goal.
          </li>
          <li>
            <strong>Week 5-8 – Research & build an MVP</strong>: Leverage maker spaces, labs, or design studios to create prototypes and gather feedback.
          </li>
          <li>
            <strong>Week 9-12 – Test & iterate</strong>: Pilot your solution, document results, and refine.
          </li>
          <li>
            <strong>Week 13-16 – Present / deploy / reflect</strong>: Showcase at a competition, publish your work, or join an incubator.
          </li>
        </ol>
      </>
    ),
  },
  {
    headingId: "future-advantages",
    heading: "Why this matters for your future",
    content: (
      <>
        <p>
          Future employers and collaborators value portfolios, not just GPAs. Innovation work helps you build tangible outcomes, grow your network, and gain
          confidence tackling real problems. Each student project contributes to Canada’s wider innovation story. ([U15 Canada][1])
        </p>
      </>
    ),
  },
  {
    headingId: "hurdles",
    heading: "Common hurdles & how to overcome them",
    content: (
      <>
        <ul>
          <li>
            <strong>“I’m just a student—who would back me?”</strong> Start small and leverage campus networks for feedback and mentorship.
          </li>
          <li>
            <strong>“I don’t have the technical skills.”</strong> Innovation spans more than code; pair up with complementary skill sets and learn as you go.
          </li>
          <li>
            <strong>“I’ll wait until I graduate.”</strong> Campus is the perfect sandbox—experiment now while support and resources surround you.
          </li>
          <li>
            <strong>“Funding is hard to access.”</strong> Look for student grants, maker spaces, or departmental funds; you often need momentum more than massive
            capital.
          </li>
        </ul>
      </>
    ),
  },
  {
    headingId: "checklist",
    heading: "A quick checklist to keep handy",
    content: (
      <>
        <ul>
          <li>Identify one user/problem this week.</li>
          <li>Build a small cross-disciplinary team.</li>
          <li>Book time with your campus innovation centre or maker space.</li>
          <li>Set a four-week sprint to build and test.</li>
          <li>Document everything for your portfolio.</li>
          <li>Ask: “What value am I delivering, and for whom?”</li>
          <li>Plan how you will showcase the results at the semester’s end.</li>
        </ul>
      </>
    ),
  },
  {
    headingId: "final-thoughts",
    heading: "Final thoughts",
    content: (
      <>
        <p>
          Innovation isn’t reserved for tech moguls. It’s for students who are curious, who spot problems, and who want to build solutions right now. Canadian
          campuses are aligning to support that. So ask yourself: what can I create this semester?
        </p>
      </>
    ),
  },
];

export default function InnovationOnCampus() {
  const { isExpanded } = useSidebar();

  return (
    <>
      <Helmet>
        <title>Innovation on Campus: How Canadian Students Turn Ideas into Impact</title>
        <meta
          name="description"
          content="Canadian university students can transform campus innovation opportunities into real impact. See why it matters, what pathways exist, and how to get started this semester."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Innovation on Campus: How Canadian Students Turn Ideas into Impact" />
        <meta
          property="og:description"
          content="Explore Canadian campus innovation opportunities, from clubs to labs, and follow a semester roadmap to launch your idea."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={FEATURE_IMAGE} />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Innovation on Campus: How Canadian Students Turn Ideas into Impact" />
        <meta
          name="twitter:description"
          content="Canadian university students can transform campus innovation opportunities into real impact. Start with this semester plan."
        />
        <meta name="twitter:image" content={FEATURE_IMAGE} />
        <meta name="geo.region" content="CA" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>
      <StructuredData
        type="article"
        title="Innovation on Campus: How Canadian University Students Can Turn Ideas into Impact"
        description="Canadian university students can transform innovation opportunities into real impact. Learn why it matters and how to begin now."
        url={PAGE_URL}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
          { name: "Innovation on Campus", url: "/blog/innovation-on-campus" },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-16`}>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 prose prose-slate dark:prose-invert">
            <header className="mb-10">
              <motion.img
                src={FEATURE_IMAGE}
                alt="Canadian university students collaborating on innovation projects"
                className="w-full rounded-3xl border border-border/60 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  Student Innovation
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                  Innovation on Campus: How Canadian University Students Can Turn Ideas into Impact
                </h1>
                <p className="text-sm text-muted-foreground">
                  Published {new Date(PUBLISH_DATE).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · Approx. 7 min read
                </p>
              </motion.div>
            </header>

            <section className="space-y-6">
              <p>
                When you’re walking through the halls of your university—whether you’re in Toronto, Vancouver, Montreal or somewhere in between—you might see
                posters for “startup bootcamps”, “hackathons”, “innovation challenges”. They’re not just for show. Students are increasingly the drivers of
                innovation, not just recipients of it.
              </p>
              <p>
                If you’re a university student in Canada wondering how to engage with innovation, why it matters, and how to turn curiosity into creation—this
                guide is for you. Let’s explore why innovation matters now, what pathways exist, and how you can get started this semester.
              </p>
            </section>

            {sections.map((section) => (
              <section key={section.heading} id={section.headingId} className="space-y-5">
                <h2>{section.heading}</h2>
                {section.content}
              </section>
            ))}

            <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl space-y-4">
              <h2>Ready to launch your campus innovation faster?</h2>
              <p>
                The AliceSolutions SmartStart program supports Canadian student innovators with mentorship, security-by-design guidance, and community. Learn more
                about the{" "}
                <a className="text-primary font-semibold" href="/smartstart">
                  SmartStart ecosystem
                </a>{" "}
                and see how founders grow ideas into ventures.
              </p>
              <Button className="inline-flex items-center gap-2" onClick={() => (window.location.href = "/smartstart")}>
                Explore SmartStart
                <Rocket className="h-4 w-4" />
              </Button>
            </section>

            <footer className="mt-12 border-t border-border/40 pt-6 text-sm text-muted-foreground space-y-3">
              <p>
                <strong>References:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  <a className="text-primary" href="https://u15.ca/publications/statements-releases/driving-innovation-canadas-leading-research-universities-and-the-path-to-home-grown-prosperity-february-2025/" target="_blank" rel="noopener noreferrer">
                    Driving Innovation – Canada’s Leading Research Universities (U15)
                  </a>
                </li>
                <li>
                  <a className="text-primary" href="https://research.ontariotechu.ca/discover-research/welcome-message.php" target="_blank" rel="noopener noreferrer">
                    Ontario Tech University – Research & Innovation
                  </a>
                </li>
                <li>
                  <a className="text-primary" href="https://enactus.ca/" target="_blank" rel="noopener noreferrer">
                    Enactus Canada – Student Social Enterprise Network
                  </a>
                </li>
                <li>
                  <a className="text-primary" href="https://research.utoronto.ca/" target="_blank" rel="noopener noreferrer">
                    University of Toronto Research & Innovation
                  </a>
                </li>
                <li>
                  <a className="text-primary" href="https://arxiv.org/abs/2302.07100" target="_blank" rel="noopener noreferrer">
                    Software Engineering Through Community-Engaged Learning – University of Victoria
                  </a>
                </li>
                <li>
                  <a className="text-primary" href="https://www.canada.ca/en/services/science/innovation/funding.html" target="_blank" rel="noopener noreferrer">
                    Government of Canada – Innovation Funding and Support
                  </a>
                </li>
              </ol>
            </footer>
          </article>
        </div>
        <Footer />
      </div>
    </>
  );
}


