// app/api/health/route.js
export async function GET() {
  return new Response("OK", { status: 200 });
}
