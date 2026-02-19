import crypto from "crypto";

const ENCRYPTION_PREFIX = "enc:v1";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getEncryptionKey = () => {
  const source =
    process.env.ADVICE_ENCRYPTION_KEY ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET;

  if (!source) {
    throw new Error("Encryption key is missing. Set ADVICE_ENCRYPTION_KEY.");
  }

  return crypto.createHash("sha256").update(String(source)).digest();
};

const isEncrypted = (value) =>
  typeof value === "string" && value.startsWith(`${ENCRYPTION_PREFIX}:`);

export const encryptAdviceText = (plainText) => {
  if (!plainText) return "";
  if (isEncrypted(plainText)) return plainText;

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

export const decryptAdviceText = (value) => {
  if (!value) return "";
  if (!isEncrypted(value)) return value;

  const parts = value.split(":");
  if (parts.length !== 5) return value;

  try {
    const iv = Buffer.from(parts[2], "base64");
    const tag = Buffer.from(parts[3], "base64");
    const encrypted = Buffer.from(parts[4], "base64");
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    return value;
  }
};

