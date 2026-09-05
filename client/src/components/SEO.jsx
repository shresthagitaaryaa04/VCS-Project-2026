import { useEffect } from 'react';

/**
 * Helper component for 100% SEO Optimization
 * Dynamically updates document title, meta description, OpenGraph tags, and JSON-LD structured data.
 */
export default function SEO({
  title = 'Trek Sathi - Find Trekking Buddies & Join Groups in Nepal',
  description = 'Connect with passionate Himalayan trekkers, form group adventures, find companions, and explore Nepal\'s stunning trekking trails.',
  keywords = 'trekking Nepal, hiking buddies, Himalayan treks, Everest Base Camp, Annapurna Circuit, trek companions, adventure groups',
  canonicalUrl,
  structuredData
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or update meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', 'index, follow');
    setMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');

    // OpenGraph Meta Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    if (canonicalUrl) {
      setMetaTag('property', 'og:url', canonicalUrl);
    }

    // Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    // 3. Inject JSON-LD Structured Data for SEO indexing
    let scriptElement = document.getElementById('json-ld-seo');
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'json-ld-seo';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Cleanup JSON-LD on unmount if needed
      const el = document.getElementById('json-ld-seo');
      if (el) el.remove();
    };
  }, [title, description, keywords, canonicalUrl, structuredData]);

  return null;
}
