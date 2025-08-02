import { NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth';

// プッシュ通知登録
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

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
