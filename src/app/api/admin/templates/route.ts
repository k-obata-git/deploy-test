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
  const newTemplate = await prisma.formTemplate.create({
    data: {
      title: data.title,
      description: data.description,
      questions: data.questions,
      userId: data.userId,
    },
  });

  return NextResponse.json(newTemplate);
}

// テンプレート一覧取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user?.id && session?.user?.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const templates = await prisma.formTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}
