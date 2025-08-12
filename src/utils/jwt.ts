import { createHmac } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

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
  // Add expiration set to year 9999 to make token never expire
  const payloadWithExp = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 9999 * 365 * 24 * 60 * 60,
  };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payloadWithExp));
  const data = `${headerB64}.${payloadB64}`;
  const signature = base64url(
    createHmac("sha256", JWT_SECRET).update(data).digest()
  );
  return `${data}.${signature}`;
};

export const verifyJwt = <T>(token: string): T | null => {
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
};
