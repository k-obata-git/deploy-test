import { NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth';

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

// マスタ質問新規登録、更新
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(session?.user?.id && session?.user?.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }
  
  const { id, label, type, options } = await req.json();

  const newQuestion = await prisma.masterQuestion.upsert({
    where: {
      id: id
    },
    update: {
      label: label,
      type: type,
    },
    create: {
      label: label,
      type: type,
    },
  });

  if (type === 'radio' || type === 'checkbox' || type === 'select') {
    // 既存の選択肢を全件物理削除
    await prisma.masterOption.deleteMany({
      where: {
        masterQuestionId: newQuestion.id
      },
    });

    const optionsData = (options || []).map((opt: any, j: number) => ({
      text: opt.text,
      position: opt.position,
      masterQuestionId: newQuestion.id,
    }));

    await prisma.masterOption.createMany({
      data: optionsData,
    });
  }

  return NextResponse.json(newQuestion);
}
