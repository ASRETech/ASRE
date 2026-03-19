/**
 * Image generation stub — Forge dependency removed.
 * Integrate with DALL-E or Stable Diffusion when needed.
 */
export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{ url: string; mimeType: string }>;
};

export async function generateImage(
  _options: GenerateImageOptions
): Promise<{ url: string }> {
  throw new Error("Image generation is not configured in this deployment.");
}
