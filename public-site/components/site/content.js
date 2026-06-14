export function isService(tag = "") {
  return /service|repair|clean|salon|tailor|tutor|coach|trade|professional/i.test(tag);
}

export function isFood(tag = "") {
  return /food|produce|bake|farm/i.test(tag);
}

export function offerings(content) {
  const products = Array.isArray(content.products) ? content.products : [];
  if (products.length > 0) return products;
  return [
    { name: "Core service", price: "Contact us", emoji: "✓", bg: "var(--site-surface)" },
    { name: "Custom solution", price: "Contact us", emoji: "★", bg: "var(--site-surface-2)" },
    { name: "Consultation", price: "Contact us", emoji: "→", bg: "var(--site-surface)" }
  ];
}

export function features(content) {
  if (Array.isArray(content.features) && content.features.length > 0) return content.features;
  if (isService(content.tag)) {
    return [
      { icon: "⚡", title: "Fast Turnaround", body: `Same-day service available across ${content.location}.` },
      { icon: "🛡️", title: "Quality Guaranteed", body: "Every job backed by our satisfaction guarantee." },
      { icon: "📍", title: "Locally Rooted", body: `Proudly serving ${content.location} and surrounding areas.` },
      { icon: "💬", title: "Always Responsive", body: "Reach us by phone, message or walk-in - we answer fast." }
    ];
  }
  if (isFood(content.tag)) {
    return [
      { icon: "🌱", title: "Locally Sourced", body: `Produce picked fresh from farms near ${content.location}.` },
      { icon: "📦", title: "Weekly Delivery", body: "Reliable door-to-door delivery on a schedule that suits you." },
      { icon: "✅", title: "Certified Quality", body: "Every batch meets our strict freshness standards." },
      { icon: "♻️", title: "Sustainable Packaging", body: "Minimal waste, 100% recyclable materials." }
    ];
  }
  return [
    { icon: "✨", title: "Handcrafted Quality", body: "Every item made with care and attention to detail." },
    { icon: "📦", title: "Fast Dispatch", body: "Orders packed and shipped within 24-48 hours." },
    { icon: "📍", title: `Made in ${content.location}`, body: "Proudly local, available worldwide." },
    { icon: "💬", title: "Personal Service", body: "Talk directly to the maker - not a call centre." }
  ];
}

export function testimonials(content) {
  if (Array.isArray(content.testimonials) && content.testimonials.length > 0) return content.testimonials;
  return [
    { name: "Amara D.", location: content.location, text: `Best ${String(content.tag || "business").toLowerCase()} I have found. The quality is outstanding and delivery was faster than expected.`, rating: 5 },
    { name: "James K.", location: content.location, text: "Incredibly professional and reliable. I recommend them to everyone I know.", rating: 5 },
    { name: "Sofia M.", location: content.location, text: "Discovered them through a friend and have not looked back since. Genuinely brilliant.", rating: 5 }
  ];
}

export function values(content) {
  if (Array.isArray(content.values) && content.values.length > 0) return content.values;
  if (isService(content.tag)) {
    return [
      { icon: "🎯", title: "Precision", body: "We treat every job as if it were our own. No shortcuts." },
      { icon: "⏱️", title: "Punctuality", body: "We show up when we say we will and finish when we promise." },
      { icon: "💬", title: "Transparency", body: "Clear pricing, honest timelines, no hidden fees." }
    ];
  }
  return [
    { icon: "✨", title: "Craft", body: "We take pride in every item. If it is not right, we make it right." },
    { icon: "💬", title: "Honesty", body: "Straightforward pricing and honest communication, always." },
    { icon: "🌍", title: "Community", body: "Local roots, global reach. Proud of where we come from." }
  ];
}

export function productPageCopy(tag = "") {
  if (isService(tag)) {
    return {
      label: "Services",
      headline: "Everything we offer",
      sub: "Browse our full range of services. Every job is handled with care and backed by our quality guarantee.",
      cardCta: "Book this service"
    };
  }
  if (isFood(tag)) {
    return {
      label: "Products",
      headline: "Fresh from our hands to yours",
      sub: "Seasonal, locally sourced goods - available every week. Order yours before we sell out.",
      cardCta: "Order now"
    };
  }
  return {
    label: "Products",
    headline: "Our full collection",
    sub: "Handpicked, quality-checked, and ready to ship. Browse everything we make and sell.",
    cardCta: "Enquire"
  };
}

export function extendedOfferings(content) {
  const products = offerings(content);
  if (products.length >= 6) return products;
  const extras = isService(content.tag)
    ? [
        { name: "Emergency Call-Out", price: "POA", emoji: "🚨", bg: "#fcebeb", badge: "Priority" },
        { name: "Monthly Maintenance", price: "From $99/mo", emoji: "📅", bg: "#e6f1fb", badge: "Popular" },
        { name: "Consultation", price: "Free", emoji: "🤝", bg: "#eaf3de", badge: "No charge" }
      ]
    : [
        { name: "Custom Order", price: "POA", emoji: "🎨", bg: "#fbeaf0", badge: "Bespoke" },
        { name: "Bulk / Wholesale", price: "Contact us", emoji: "📦", bg: "#e6f1fb", badge: "Trade" },
        { name: "Gift Voucher", price: "From $20", emoji: "🎁", bg: "#eaf3de", badge: "Gift" }
      ];
  return [...products, ...extras].slice(0, 6);
}

export function faqs(content) {
  if (Array.isArray(content.faq) && content.faq.length > 0) return content.faq;
  if (isService(content.tag)) {
    return [
      { q: "How quickly can you respond?", a: "We aim to reply within a few hours. For urgent jobs, call us directly." },
      { q: "Do you offer free quotes?", a: "Yes, all initial consultations and quotes are completely free." },
      { q: "What areas do you cover?", a: "We primarily serve our local area but can travel for larger projects." },
      { q: "Are your services guaranteed?", a: "Every job comes with our satisfaction guarantee. If it is not right, we fix it." }
    ];
  }
  return [
    { q: "Can I place a custom order?", a: "Absolutely. Get in touch with what you have in mind and we will make it happen." },
    { q: "How long does delivery take?", a: "Standard delivery is 3-5 working days. Express options are available on request." },
    { q: "What is your return policy?", a: "If you are not happy, we will make it right with a replacement, refund, or credit." },
    { q: "Do you do wholesale or bulk?", a: "Yes. Contact us for trade pricing and minimum order quantities." }
  ];
}

export function initial(name = "W") {
  return name.charAt(0).toUpperCase();
}
