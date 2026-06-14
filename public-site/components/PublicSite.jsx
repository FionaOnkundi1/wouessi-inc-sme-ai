import { siteTheme } from "../lib/site";
import AboutPage from "./site/AboutPage";
import ContactPage from "./site/ContactPage";
import Footer from "./site/Footer";
import HomePage from "./site/HomePage";
import Navbar from "./site/Navbar";
import ProductsPage from "./site/ProductsPage";

export default function PublicSite({ site, currentPage }) {
  const content = site.siteContent || {};

  return (
    <div className="site-shell" style={siteTheme(site.styleTokens)}>
      <Navbar slug={site.slug} content={content} currentPage={currentPage} />
      {currentPage === "home" && <HomePage slug={site.slug} content={content} />}
      {currentPage === "products" && <ProductsPage slug={site.slug} content={content} />}
      {currentPage === "about" && <AboutPage slug={site.slug} content={content} />}
      {currentPage === "contact" && <ContactPage content={content} />}
      <Footer slug={site.slug} content={content} />
    </div>
  );
}
