import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }
  const snapshots = await prisma.storeSnapshot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      primaryKey: true,
      createdAt: true,
      headers: true,
    },
  });
  return NextResponse.json(
    snapshots.map((s) => ({
      id: s.id,
      name: s.name,
      primaryKey: s.primaryKey,
      createdAt: s.createdAt,
      headerCount: Array.isArray(s.headers) ? (s.headers as string[]).length : 0,
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }
  let body: { name: string; headers: string[]; rows: Record<string, string>[]; primaryKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const { name, headers, rows, primaryKey } = body;
  if (!name || !Array.isArray(headers) || !Array.isArray(rows)) {
    return NextResponse.json(
      { message: "Missing name, headers, or rows" },
      { status: 400 }
    );
  }
  const snapshot = await prisma.storeSnapshot.create({
    data: {
      userId: user.id,
      name: String(name).trim() || "Unnamed snapshot",
      primaryKey: primaryKey ?? null,
      headers,
      rows,
    },
  });
  return NextResponse.json({
    id: snapshot.id,
    name: snapshot.name,
    primaryKey: snapshot.primaryKey,
    createdAt: snapshot.createdAt,
  });
}
