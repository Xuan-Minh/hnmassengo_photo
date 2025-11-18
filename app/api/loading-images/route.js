import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "loading");
    let entries = [];
    try {
      entries = await fs.promises.readdir(dir);
    } catch (e) {
      // dossier peut ne pas exister
      entries = [];
    }
    const images = entries
      .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
      .sort()
      .map((name) => `/loading/${name}`);

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ images: [], error: "READ_ERROR" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
