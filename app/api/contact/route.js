import { NextResponse } from "next/server";
import { logger } from "../../../lib/logger";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    console.log("=== API ROUTE CONTACT ===");
    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Subject:", subject);
    console.log("Message:", message);

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
