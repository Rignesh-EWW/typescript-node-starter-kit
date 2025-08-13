import { signJwt, verifyJwt } from "@/utils/jwt";

// Store currently issued auth tokens in memory
// This ensures tokens are only valid if they exist in the store
const authTokenStore = new Map<number, string>();

export const issueAuthToken = (id: number, role: "user" | "admin"): string => {
  const token = signJwt({ id, role, iat: Date.now() });
  // Store the token - it will remain valid until explicitly invalidated
  authTokenStore.set(id, token);
  return token;
};

export const verifyAuthToken = <T extends { id: number; role: string }>(
  token: string
): T | null => {
  try {
    // First verify the JWT signature and structure
    const payload = verifyJwt<T>(token);
    if (!payload) return null;

    // Check if the token exists in our store (this prevents expired/invalidated tokens)
    const stored = authTokenStore.get(payload.id);
    if (stored !== token) return null;

    return payload;
  } catch (error) {
    return null;
  }
};

export const invalidateAuthToken = (id: number): boolean => {
  // Remove the token from store, making it invalid immediately
  return authTokenStore.delete(id);
};

export const isTokenValid = (id: number, token: string): boolean => {
  const stored = authTokenStore.get(id);
  return stored === token;
};

export const getAllActiveTokens = (): Map<number, string> => {
  return new Map(authTokenStore);
};
