import { NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth';

// テンプレート一覧取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const templates = await prisma.formTemplate.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      questions: true,
    },
    orderBy: { id: 'asc' }
  });

  return NextResponse.json(templates);
}
