export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Standalone auth — login is a local page, no external OAuth redirect.
export const getLoginUrl = (returnPath?: string): string => {
  const base = "/login";
  if (returnPath) {
    return `${base}?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return base;
};
