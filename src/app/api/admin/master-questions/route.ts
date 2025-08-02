import { NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth';

// TODO
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(session?.user?.id && session?.user?.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const data = await req.json();
  const created = await prisma.masterQuestion.create({ data });
  return NextResponse.json(created);
}

// マスタ質問一覧取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user?.id && session?.user?.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const questions = await prisma.masterQuestion.findMany({
    include: {
      options: {
        orderBy: { position: 'asc' },
      }
    }
  });
  return NextResponse.json(questions);
}
