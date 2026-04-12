import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function verifyListOwnership(
  listId: string,
  userId: string
): Promise<NextResponse | null> {
  if (!UUID_REGEX.test(listId)) {
    return NextResponse.json({ error: "Invalid list ID" }, { status: 400 });
  }

  const list = await prisma.groceryList.findUnique({
    where: { id: listId },
  });

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  if (list.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: listId } = await params;
  const ownershipError = await verifyListOwnership(listId, session.userId);
  if (ownershipError) return ownershipError;

  const shares = await prisma.listShare.findMany({
    where: { listId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(shares);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: listId } = await params;
  const ownershipError = await verifyListOwnership(listId, session.userId);
  if (ownershipError) return ownershipError;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { email } = body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    );
  }

  const invitee = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!invitee) {
    return NextResponse.json(
      { error: "No user found with that email address. They must sign up first." },
      { status: 404 }
    );
  }

  if (invitee.id === session.userId) {
    return NextResponse.json(
      { error: "You cannot share a list with yourself" },
      { status: 400 }
    );
  }

  const existingShare = await prisma.listShare.findUnique({
    where: { listId_userId: { listId, userId: invitee.id } },
  });

  if (existingShare) {
    return NextResponse.json(
      { error: "This list is already shared with that user" },
      { status: 409 }
    );
  }

  const share = await prisma.listShare.create({
    data: { listId, userId: invitee.id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json(share, { status: 201 });
}
