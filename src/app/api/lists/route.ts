import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const ownList = await prisma.groceryList.findUnique({
    where: { ownerId: session.userId },
    include: {
      owner: { select: { name: true, email: true } },
      items: { orderBy: { dateEntered: "desc" } },
    },
  });

  const sharedLists = await prisma.listShare.findMany({
    where: { userId: session.userId },
    include: {
      list: {
        include: {
          owner: { select: { name: true, email: true } },
          items: { orderBy: { dateEntered: "desc" } },
        },
      },
    },
  });

  return NextResponse.json({
    ownList,
    sharedLists: sharedLists.map((share) => ({
      shareId: share.id,
      ...share.list,
    })),
  });
}
