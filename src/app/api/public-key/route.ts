import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
}
