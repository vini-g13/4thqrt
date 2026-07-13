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

  return Response.json({ ok: true });
}
