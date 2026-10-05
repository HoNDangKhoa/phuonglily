import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNED_FIELDS = [
  "order_amount",
  "merchant",
  "currency",
  "operation",
  "order_description",
  "order_invoice_number",
  "customer_id",
  "payment_method",
  "success_url",
  "error_url",
  "cancel_url",
] as const;

export function sepayCheckoutUrl() {
  const env = (process.env.SEPAY_ENV || "sandbox").trim().toLowerCase();
  return env === "production"
    ? "https://pay.sepay.vn/v1/checkout/init"
    : "https://pay-sandbox.sepay.vn/v1/checkout/init";
}

export function sepayConfig() {
  const merchant = process.env.SEPAY_MERCHANT_ID?.trim() || "";
  const secret = process.env.SEPAY_SECRET_KEY?.trim() || "";
  return { merchant, secret, enabled: Boolean(merchant && secret), checkoutUrl: sepayCheckoutUrl() };
}

/** QR chuyển khoản vào tài khoản ngân hàng đã liên kết trên my.sepay.vn. */
export function sepayQrConfig() {
  const account = process.env.SEPAY_BANK_ACCOUNT?.replace(/\s+/g, "") || "";
  const bank = process.env.SEPAY_BANK_CODE?.trim() || "";
  const holder = process.env.SEPAY_ACCOUNT_HOLDER?.trim() || "";
  const webhookKey = process.env.SEPAY_WEBHOOK_API_KEY?.trim() || "";
  return { account, bank, holder, webhookKey, enabled: Boolean(account && bank) };
}

export function sepayQrUrl(amount: number, description: string) {
  const { account, bank } = sepayQrConfig();
  const params = new URLSearchParams({
    acc: account,
    bank,
    amount: String(Math.max(0, Math.round(amount))),
    des: description,
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

export function webhookAuthorized(header: string | null, key: string) {
  if (!header || !key) return false;
  const token = header.match(/^(?:Apikey|Bearer)\s+(.+)$/i)?.[1]?.trim() || header.trim();
  const given = Buffer.from(token);
  const expected = Buffer.from(key);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function signSepayFields(fields: Record<string, string>, secret: string) {
  const signed = SIGNED_FIELDS.filter((field) => fields[field]).map(
    (field) => `${field}=${fields[field]}`,
  );
  return createHmac("sha256", secret).update(signed.join(",")).digest("base64");
}

export function safeSepayText(value: string) {
  return value.replace(/[,=\r\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

export function secretMatches(header: string | null, secret: string) {
  if (!header || !secret) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
