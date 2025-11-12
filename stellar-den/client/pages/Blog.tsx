import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import { ArrowRight, Calendar, Timer, PenNib } from "lucide-react";
import StructuredData from "@/components/StructuredData";

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  readingTime: string;
  image: string;
  category: string;
};

const blogPosts: BlogPost[] = [
  {
    slug: "/blog/letter-to-the-builders",
    title: "A Letter to the Builders of Tomorrow",
    description: "Udi Shkolnik’s personal invitation to every builder who refuses to follow outdated playbooks and wants to create with structure and soul.",
    publishDate: "2025-11-12",
    readingTime: "8 min read",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    category: "SmartStart Stories",
  },
  {
    slug: "/blog/builders-manifesto",
    title: "The SmartStart Builders’ Manifesto",
    description: "Twelve living principles that power the SmartStart ecosystem—alignment before acceleration, community over competition, and momentum as a shared asset.",
    publishDate: "2025-11-12",
    readingTime: "10 min read",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    category: "SmartStart Manifesto",
  },
  {
    slug: "/blog/the-smartstart-way",
    title: "The SmartStart Way: Building a New Kind of Business Community",
    description: "Discover the hybrid ecosystem where business strategy, creativity, and self-development merge so founders can build on their own terms.",
    publishDate: "2025-11-12",
    readingTime: "9 min read",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    category: "SmartStart Stories",
  },
  {
    slug: "/blog/beyond-silicon-valley-canadian-students",
    title: "Beyond Silicon Valley: How Canadian Students Are Building a New Culture of Innovation",
    description: "Canadian students are reinventing innovation with empathy, diversity, and purpose-driven ventures that outlast hype cycles.",
    publishDate: "2025-11-12",
    readingTime: "7 min read",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    category: "Innovation",
  },
  {
    slug: "/blog/new-generation-of-builders",
    title: "The New Generation of Builders: How Canada’s Young Innovators Are Rewriting the Future",
    description: "A look at the students and creators building Canada’s next wave of companies, tools, and cultural movements.",
    publishDate: "2025-11-12",
    readingTime: "8 min read",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    category: "Innovation",
  },
  {
    slug: "/blog/innovation-on-campus",
    title: "Innovation on Campus: How Canadian University Students Can Turn Ideas into Impact",
    description: "A practical roadmap for Canadian students to turn campus resources into launch-ready ventures in one semester.",
    publishDate: "2025-11-12",
    readingTime: "7 min read",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    category: "Education",
  },
  {
    slug: "/blog/cybersecurity-for-toronto-smes",
    title: "Cybersecurity for Toronto & GTA SMEs: Why It’s Not Just an IT Cost—It’s a Strategic Asset",
    description: "How Toronto SMEs can turn cybersecurity into a growth advantage with PHIPA/PIPEDA readiness and rapid incident response.",
    publishDate: "2025-11-12",
    readingTime: "9 min read",
    image: "https://images.unsplash.com/photo-1531498860502-7c67cf02f77b?auto=format&fit=crop&w=1600&q=80",
    category: "Cybersecurity",
  },
];

export default function Blog() {
  const { isExpanded } = useSidebar();

  return (
    <>
      <Helmet>
        <title>SmartStart Blog | Stories, Playbooks, and Manifestos for Builders</title>
        <meta
          name="description"
          content="Read the latest SmartStart stories, manifestos, and playbooks. Discover how Canadian builders are combining cybersecurity, innovation, and community."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SmartStart Blog | Stories, Playbooks, and Manifestos for Builders" />
        <meta
          property="og:description"
          content="A living library of SmartStart thought leadership—manifestos, letters, and tactical guides for Canadian innovators."
        />
        <meta property="og:url" content="https://alicesolutionsgroup.com/blog" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80" />
        <meta property="og:site_name" content="AliceSolutions Group" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SmartStart Blog | Stories, Playbooks, and Manifestos for Builders" />
        <meta
          name="twitter:description"
          content="Fuel your next move with SmartStart manifestos, GTM guides, and innovation spotlights."
        />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80" />
        <meta name="geo.region" content="CA-ON" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "SmartStart Blog",
              description: "Stories, manifestos, and guides for Canadian builders in the SmartStart ecosystem.",
              itemListElement: blogPosts.map((post, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `https://alicesolutionsgroup.com${post.slug}`,
                name: post.title,
              })),
            }),
          }}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`transition-all duration-300 ${isExpanded ? "md:ml-72 ml-0" : "md:ml-20 ml-0"} md:pt-0 pt-20`}>
          <StructuredData
            type="page"
            title="SmartStart Blog | Stories, Playbooks, and Manifestos for Builders"
            description="SmartStart manifestos, GTM playbooks, and innovation stories for Canadian builders."
            url="https://alicesolutionsgroup.com/blog"
            breadcrumbs={[
              { name: "Home", url: "/" },
              { name: "Blog", url: "/blog" },
            ]}
          />
          <section className="pt-10 pb-12 px-4">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <PenNib className="w-4 h-4 text-primary" />
                  <span className="text-primary text-sm font-medium">SmartStart Blog</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                  Stories & Playbooks for Builders
                </h1>
                <p className="text-lg text-muted-foreground mb-10">
                  Manifestos, strategy guides, and community spotlights for the people reinventing cybersecurity, innovation, and venture building in Canada.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="pb-20 px-4">
            <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg hover:border-primary/50 transition-all overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary/80">
                      <span>{post.category}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{post.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishDate).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <div className="pt-2">
                      <a
                        href={post.slug}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Read article
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
}


