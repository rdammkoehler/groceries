import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { requireSession } from "@/lib/session";
import { withRLS } from "@/lib/rls";
import { prisma } from "@/lib/prisma";

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
  const { session, error } = await requireSession();
  if (error) return error;

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

  // Check if user is the owner or a shared user.
  // Shared users can only toggle purchase status, not modify other fields.
  const item = await withRLS(session.userId, async (transaction) => {
    const existingItem = await transaction.groceryItem.findUnique({
      where: { id },
      include: { list: { select: { ownerId: true } } },
    });

    if (!existingItem) return null;

    const lastPurchaseDate = purchased ? new Date() : null;

    return transaction.groceryItem.update({
      where: { id },
      data: { lastPurchaseDate },
    });
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const idError = validateId(id);
  if (idError) return idError;

  // Only list owners can delete items. Verify ownership before deleting.
  const item = await prisma.groceryItem.findUnique({
    where: { id },
    include: { list: { select: { ownerId: true } } },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.list.ownerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await withRLS(session.userId, (transaction) =>
      transaction.groceryItem.delete({ where: { id } })
    );
    return NextResponse.json({ success: true });
  } catch (deleteError) {
    if (
      deleteError instanceof Prisma.PrismaClientKnownRequestError &&
      deleteError.code === "P2025"
    ) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    throw deleteError;
  }
}
