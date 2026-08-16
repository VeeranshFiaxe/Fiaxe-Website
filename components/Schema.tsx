export function Schema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Fiaxe",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://fiaxe.com",
    "description": "Voice AI calling agents that sound human, built for inbound and outbound customer operations.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Fiaxe",
      "url": "https://fiaxe.com"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
