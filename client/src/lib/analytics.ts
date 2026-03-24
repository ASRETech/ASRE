/**
 * analytics.ts — Optional runtime analytics loader
 *
 * Loads Umami analytics only if BOTH env vars are defined.
 * If either is missing, analytics is silently skipped — no build warning,
 * no runtime crash, no broken script tag.
 *
 * Usage: call initAnalytics() once at app startup (main.tsx).
 */

export function initAnalytics(): void {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;

  // Skip silently if either var is absent or empty
  if (!endpoint || !websiteId) {
    return;
  }

  // Dynamically inject the Umami script tag
  const script = document.createElement('script');
  script.defer = true;
  script.src = `${endpoint}/umami`;
  script.setAttribute('data-website-id', websiteId);
  document.head.appendChild(script);
}
