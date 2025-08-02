import { NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma'
import { authOptions } from '../auth/auth';
import { getServerSession } from 'next-auth';

// マスタ質問一覧取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const questions = await prisma.masterQuestion.findMany({
    include: { options: true },
    orderBy: { id: 'asc' }
  })
  return NextResponse.json(questions)
}
