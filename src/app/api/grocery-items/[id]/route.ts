import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { purchased } = body;

  const lastPurchaseDate = purchased ? new Date() : null;

  const item = await prisma.groceryItem.update({
    where: { id },
    data: { lastPurchaseDate },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.groceryItem.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
