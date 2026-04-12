import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id: listId, shareId } = await params;

  if (!UUID_REGEX.test(listId) || !UUID_REGEX.test(shareId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const list = await prisma.groceryList.findUnique({
    where: { id: listId },
  });

  if (!list || list.ownerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const share = await prisma.listShare.findUnique({
    where: { id: shareId },
  });

  if (!share || share.listId !== listId) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  await prisma.listShare.delete({ where: { id: shareId } });

  return NextResponse.json({ success: true });
}
