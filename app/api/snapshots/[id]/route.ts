import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { id } = await params;
  const snapshot = await prisma.storeSnapshot.findFirst({
    where: { id, userId: user.id },
  });
  if (!snapshot) {
    return NextResponse.json({ message: "Snapshot not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: snapshot.id,
    name: snapshot.name,
    primaryKey: snapshot.primaryKey,
    headers: snapshot.headers as string[],
    rows: snapshot.rows as Record<string, string>[],
    createdAt: snapshot.createdAt,
  });
}
