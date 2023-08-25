import * as fs from "fs";
import * as mime from "mime-types";
import * as crypto from "crypto";

export async function getMimeType(filePath: fs.PathLike) {
  // const buffer = fs.readFileSync(filePath);
  // const contentType = getType(filePath.toString());
  // return contentType;
  // const type = mime.lookup(filePath);

  // get the filename with the extension
  const filename = filePath.toString().split("/").pop();
  if (filename == "index.html") {
    return "text/html";
  }
  console.log("Filename: : : :", filename);

  // const t = await mime.contentType(filePath.toString());

  const t = mime.lookup(filename);
  console.log("Type: : : :", t);

  if (t) {
    return t.toString();
  } else {
    return "text/html";
  }
}

const SECRET = crypto.scryptSync("stacking@Cloud!secret_key", "salt", 32);
const IV = crypto.randomBytes(16);

export function encryptString(str: string) {
  const algorithm = "aes-256-cbc";

  const cipher = crypto.createCipheriv(algorithm, SECRET, IV);
  let encrypted = cipher.update(str, "utf8", "hex");
  encrypted += cipher.final("hex");
  const ivHex = IV.toString("hex");

  console.log("Encrypted:", encrypted);
  console.log("IV:", ivHex);
  return { encrypted, ivHex };
}

export function decryptString(encrypted: string, ivHex: string) {
  const iv = Buffer.from(ivHex, "hex");
  const algorithm = "aes-256-cbc";

  const decipher = crypto.createDecipheriv(algorithm, SECRET, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  console.log("Decrypted:", decrypted);
  return decrypted;
}
