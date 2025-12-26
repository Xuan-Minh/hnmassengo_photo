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

    const { fullName, email, subject, message } = await request.json();

    // Validation côté serveur
    const errors = [];
    if (!fullName || fullName.trim().length < 2) {
      errors.push("Le nom complet est requis (au moins 2 caractères).");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Une adresse email valide est requise.");
    }
    if (!message || message.trim().length < 10) {
      errors.push("Le message est requis (au moins 10 caractères).");
    }
    if (subject && subject.length > 100) {
      errors.push("Le sujet ne peut pas dépasser 100 caractères.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Erreurs de validation", errors },
        { status: 400 }
      );
    }

    // Ici, la validation est faite, mais l'envoi sera géré par Netlify
    return NextResponse.json(
      { success: true, message: "Validation réussie, envoi en cours..." },
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
