import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedEnvPath = path.join(__dirname, "..", "..", ".env");
const backendEnvPath = path.join(__dirname, "..", ".env");

const sharedEnvLoad = dotenv.config({ path: sharedEnvPath });
if (sharedEnvLoad.error) {
  dotenv.config({ path: backendEnvPath });
}

const apiKey = (process.env.RESEND_API_KEY || "").trim();
const from = (process.env.RESEND_FROM || "onboarding@resend.dev").trim();
const to = (process.argv[2] || process.env.RESEND_TEST_TO || "").trim();

if (!apiKey) {
  console.error("Missing RESEND_API_KEY.");
  process.exit(1);
}

if (!to) {
  console.error("Missing recipient email. Pass one arg or set RESEND_TEST_TO.");
  process.exit(1);
}

const resend = new Resend(apiKey);
const result = await resend.emails.send({
  from,
  to,
  subject: "Hello World",
  html: "<p>Congrats on sending your <strong>first email</strong>!</p>"
});

if (result?.error) {
  console.error("Resend send failed:", result.error);
  process.exit(1);
}

console.log(`Resend email sent. id=${result?.data?.id || "unknown"}`);
