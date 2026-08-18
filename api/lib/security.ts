const DEV_FALLBACK_SECRET = "foodie-market-dev-secret-change-in-production";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not set. Refusing to start in production with a predictable secret.");
    }
    return DEV_FALLBACK_SECRET;
  }
  return secret;
}
