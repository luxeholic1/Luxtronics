import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
}

const SEO = ({
  title = "Luxtronics — Premium Electronics & Gadgets Store",
  description = "Shop premium electronics: smartphones, audio, wearables, laptops, gaming and cameras. Curated brands, fast shipping, 2-year warranty.",
  keywords = "electronics, gadgets, smartphones, laptops, audio, wearables, gaming, cameras, premium tech",
  image = "https://luxtronics.com/og-image.jpg",
  url = "https://luxtronics.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Luxtronics",
  canonical,
  noindex = false,
  nofollow = false,
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes("Luxtronics") ? title : `${title} | Luxtronics`;
  const fullUrl = canonical || url;
  const robots = `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Luxtronics",
    "url": "https://luxtronics.com",
    "description": description,
    "publisher": {
      "@type": "Organization",
      "name": "Luxtronics",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luxtronics.com/logo.png",
        "width": 200,
        "height": 200,
      },
    },
  };

  const dataToUse = structuredData || defaultStructuredData;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", author);
    updateMetaTag("robots", robots);

    // Update Open Graph tags
    updatePropertyTag("og:title", fullTitle);
    updatePropertyTag("og:description", description);
    updatePropertyTag("og:image", image);
    updatePropertyTag("og:url", fullUrl);
    updatePropertyTag("og:type", type);
    updatePropertyTag("og:site_name", "Luxtronics");
    updatePropertyTag("og:locale", "en_US");

    // Update Twitter tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
    updateMetaTag("twitter:site", "@luxtronics");
    updateMetaTag("twitter:creator", "@luxtronics");

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullUrl);

    // Update structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement("script");
      structuredDataScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(dataToUse);

    // Cleanup function
    return () => {
      // We don't remove the meta tags on cleanup to avoid flickering
      // They will be overwritten by the next SEO component
    };
  }, [
    fullTitle,
    description,
    keywords,
    author,
    robots,
    image,
    fullUrl,
    type,
    dataToUse,
    publishedTime,
    modifiedTime,
  ]);

  // This component doesn't render anything visible
  return null;
};

export default SEO;