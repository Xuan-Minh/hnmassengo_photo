import { NextResponse } from "next/server";
import { logger } from "../../../lib/logger";

// Simple in-memory rate limiter (reset every 10min)
const RATE_LIMIT = 5; // max 5 req/10min/ip
const WINDOW_MS = 10 * 60 * 1000;
const ipHits = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, { first, count }] of ipHits.entries()) {
    if (now - first > WINDOW_MS) ipHits.delete(ip);
  }
}

export async function POST(request) {
  try {
    cleanupOldEntries();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const entry = ipHits.get(ip) || { first: now, count: 0 };
    if (now - entry.first < WINDOW_MS && entry.count >= RATE_LIMIT) {
      return NextResponse.json(
        { success: false, message: "Trop de requêtes, réessayez plus tard." },
        { status: 429 }
      );
    }
    entry.count++;
    ipHits.set(ip, entry);

    const formData = await request.formData();
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    // Ici, vous pouvez ajouter la logique d'envoi d'email
    // Par exemple avec Nodemailer, SendGrid, etc.

    // Pour l'instant, on simule un succès
    return NextResponse.json(
      { success: true, message: "Message reçu avec succès!" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("API Contact Error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
