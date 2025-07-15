import { prisma } from '../../../../../prisma/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const formId = params.id;

  try {
    const form = await prisma.form.findUnique({
      where: { id: Number(formId) },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: {
            options: {
              where: {
                isDeleted: false,
              },
              orderBy: { position: 'asc' }
            },
          },
        },
      },
    });

    if (!form || form.isPublic === false) {
      return NextResponse.json({ error: '公開されていないか、存在しません。' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '取得エラー' }, { status: 500 });
  }
}
