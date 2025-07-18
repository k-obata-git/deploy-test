import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../prisma/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/auth';

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

export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);

  // フォーム削除
  await prisma.form.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
