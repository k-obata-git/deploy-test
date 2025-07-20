import { NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { subscription, userId } = body;

  await prisma.pushSubscription.create({
    data: {
      userId: Number(userId),
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
  });

  return NextResponse.json({ success: true });
}
