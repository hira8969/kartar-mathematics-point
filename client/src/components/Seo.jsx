import { useEffect } from "react";
import { INSTITUTE } from "../utils/constants";

const DEFAULT_SITE_URL = "https://kartarmathematics.in";
const DEFAULT_IMAGE_PATH = "/seo-preview.svg";

const getSiteUrl = () => (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const upsertJsonLd = (data) => {
  let element = document.head.querySelector('script[data-seo="json-ld"]');
  if (!data) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.seo = "json-ld";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
};

export default function Seo({
  title,
  description,
  path = "/",
  noindex = false,
  type = "website",
  imagePath = DEFAULT_IMAGE_PATH,
  jsonLd
}) {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
    const canonicalUrl = `${siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
    const imageUrl = `${siteUrl}${imagePath}`;

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" });
    upsertLink("canonical", canonicalUrl);

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: INSTITUTE.name });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });

    upsertJsonLd(jsonLd);
  }, [description, imagePath, jsonLd, noindex, path, title, type]);

  return null;
}
