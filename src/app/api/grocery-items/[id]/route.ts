import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;

  await prisma.groceryItem.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
