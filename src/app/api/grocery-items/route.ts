import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const items = await prisma.groceryItem.findMany({
    orderBy: { dateEntered: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const body = await request.json();
  const { name, quantity } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
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
