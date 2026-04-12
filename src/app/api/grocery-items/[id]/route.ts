import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/auth";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateId(id: string): NextResponse | null {
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  const idError = validateId(id);
  if (idError) return idError;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { purchased } = body;

  if (typeof purchased !== "boolean") {
    return NextResponse.json(
      { error: "'purchased' must be a boolean" },
      { status: 400 }
    );
  }

  const lastPurchaseDate = purchased ? new Date() : null;

  try {
    const item = await prisma.groceryItem.update({
      where: { id },
      data: { lastPurchaseDate },
    });
    return NextResponse.json(item);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  const idError = validateId(id);
  if (idError) return idError;

  try {
    await prisma.groceryItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    throw error;
  }
}
