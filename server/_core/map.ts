/**
 * Maps stub — Forge proxy removed.
 * Use Google Maps API directly with GOOGLE_MAPS_API_KEY when needed.
 */
export async function makeRequest(_path: string, _params?: Record<string, string>): Promise<unknown> {
  throw new Error("Maps API is not configured in this deployment.");
}
