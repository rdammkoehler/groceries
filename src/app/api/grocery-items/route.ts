import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/auth";

const DEFAULT_LIMIT = 100;

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    DEFAULT_LIMIT
  );
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  const items = await prisma.groceryItem.findMany({
    orderBy: { dateEntered: "desc" },
    take: limit,
    skip: offset,
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

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

  const item = await prisma.groceryItem.create({
    data: {
      name: name.trim(),
      quantity: parsedQuantity,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
