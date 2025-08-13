import { createHmac } from "crypto";
const config = require("../../config");

const JWT_SECRET = config.token.jwtSecret;

const base64url = (input: string | Buffer): string => {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const fromBase64url = (input: string): Buffer => {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = 4 - (input.length % 4);
  if (pad !== 4) input += "=".repeat(pad);
  return Buffer.from(input, "base64");
};

export const signJwt = (payload: object): string => {
  const header = { alg: "HS256", typ: "JWT" };
  // No expiration - tokens will never expire until manually invalidated
  const payloadB64 = base64url(JSON.stringify(payload));
  const headerB64 = base64url(JSON.stringify(header));
  const data = `${headerB64}.${payloadB64}`;
  const signature = base64url(
    createHmac("sha256", JWT_SECRET).update(data).digest()
  );
  return `${data}.${signature}`;
};

export const verifyJwt = <T>(token: string): T | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = base64url(
      createHmac("sha256", JWT_SECRET).update(data).digest()
    );
    if (expectedSig !== signature) return null;
    const payload = JSON.parse(fromBase64url(payloadB64).toString());
    return payload as T;
  } catch (error) {
    return null;
  }
};
