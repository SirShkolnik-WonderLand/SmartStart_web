import { Helmet } from "react-helmet";

interface StructuredDataProps {
  type?: "home" | "page" | "article";
  title?: string;
  description?: string;
  url?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export default function StructuredData({
  type = "home",
  title,
  description,
  url,
  breadcrumbs,
}: StructuredDataProps) {
  const baseUrl = "https://alicesolutionsgroup.com";

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AliceSolutions Group",
    url: baseUrl,
    logo: `${baseUrl}/logos/AliceSolutionsGroup-logo-compact.svg`,
    sameAs: ["https://www.linkedin.com/company/alicesolutionsgroup/"],
    founder: {
      "@type": "Person",
      name: "Sagi Ehud (Udi) Shkolnik",
      jobTitle: "Founder & CTO",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Toronto",
        addressRegion: "ON",
        addressCountry: "CA",
      },
    },
  };

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AliceSolutions Group",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={query}`,
      "query-input": "required name=query",
    },
  };

  // Breadcrumb Schema (if provided)
  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`,
        })),
      }
    : null;

  return (
    <Helmet>
      {/* Organization + Website Schema (always included) */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>

      {/* Breadcrumb Schema (if provided) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}

