import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { withRLS } from "@/lib/rls";

const DEFAULT_LIMIT = 100;

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("listId");
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    DEFAULT_LIMIT
  );
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  const items = await withRLS(session.userId, (transaction) =>
    transaction.groceryItem.findMany({
      where: listId ? { listId } : undefined,
      orderBy: { dateEntered: "desc" },
      take: limit,
      skip: offset,
    })
  );

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { name, quantity } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (name.trim().length > 255) {
    return NextResponse.json(
      { error: "Name must be 255 characters or fewer" },
      { status: 400 }
    );
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return NextResponse.json(
      { error: "Quantity must be a positive integer" },
      { status: 400 }
    );
  }

  const item = await withRLS(session.userId, async (transaction) => {
    const groceryList = await transaction.groceryList.findUnique({
      where: { ownerId: session.userId },
    });

    if (!groceryList) {
      return null;
    }

    return transaction.groceryItem.create({
      data: {
        listId: groceryList.id,
        name: name.trim(),
        quantity: parsedQuantity,
      },
    });
  });

  if (!item) {
    return NextResponse.json(
      { error: "Grocery list not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(item, { status: 201 });
}
