import { cookies } from "next/headers";

export async function POST(request: Request) {
  let key: unknown;
  try {
    ({ key } = await request.json());
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const secretKey = process.env.DROP_SECRET_KEY ?? "4THQRT";

  if (
    typeof key !== "string" ||
    key.trim().toUpperCase() !== secretKey.toUpperCase()
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("qrt_access", "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return Response.json({ ok: true });
}
