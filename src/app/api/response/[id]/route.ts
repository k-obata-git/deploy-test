import { prisma } from '../../../../../prisma/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const formId = Number(params.id);
  const session = await getServerSession(authOptions);

  const userId: number | null = session ? Number(session.user.id) : null;


  const body = await req.json();

  try {
    const response = await prisma.response.create({
      data: {
        formId,
        userId,
        answers: {
          create: body.items.map((item: { questionId: string; optionId: string; value: string }) => ({
            questionId: item.questionId,
            optionId: item.optionId,
            text: item.value,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '回答の保存に失敗しました' }, { status: 500 });
  }
}
