export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerName: process.env.OWNER_NAME ?? "",
  isProduction: process.env.NODE_ENV === "production",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceSelfGuided: process.env.STRIPE_PRICE_SELF_GUIDED ?? "",
  stripePriceGroup: process.env.STRIPE_PRICE_GROUP ?? "",
  stripePriceOneOnOne: process.env.STRIPE_PRICE_ONE_ON_ONE ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  appUrl: process.env.APP_URL ?? "",
};
