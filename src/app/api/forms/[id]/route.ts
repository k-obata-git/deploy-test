import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../prisma/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/auth';

// フォーム1件取得
export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const form = await prisma.form.findUnique({
    where: {
      id: Number(params.id),
      userId: Number(session?.user?.id)
    },
    include: {
      questions: {
        include: {
          options: {
            where: {
              isDeleted: false,
            }
          },
        },
        orderBy: { position: 'asc' },
      },
      responses: {
        include: {
          answers: true
        },
        orderBy: { submittedAt: 'asc' },
      }
    },
  });

  if (!form) {
    return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 });
  }

  return NextResponse.json(form);
}

// フォーム公開状態更新
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const body = await request.json();
  const updated = await prisma.form.update({
    where: { id: Number(params.id) },
    data: {
      isPublic: body.isPublic,
    },
  });

  return NextResponse.json(updated);
}


// フォーム1件削除
export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  await prisma.form.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ success: true });
}
