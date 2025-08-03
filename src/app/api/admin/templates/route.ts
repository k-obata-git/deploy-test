import { NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth';

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

// テンプレート新規登録、更新
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(session?.user?.id && session?.user?.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const { id, title, description, questions } = await req.json();
  const newTemplate = await prisma.formTemplate.upsert({
    where: {
      id: id
    },
    update: {
      title: title,
      description: description,
      questions: questions,
    },
    create: {
      title: title,
      description: description,
      questions: questions,
      userId: Number(session?.user?.id),
    }
  });

  return NextResponse.json(newTemplate);
}
