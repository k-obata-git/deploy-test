import { prisma } from '../../../../prisma/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const forms = await prisma.form.findMany({
    where: {
      userId: Number(session?.user?.id),
    },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: { position: 'asc' },
      },
      responses: {
        orderBy: { id: 'asc' },
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const { id, title, description, questions } = await req.json();

  // フォームの基本情報更新
  if(id) {
    const updatedForm = await prisma.form.update({
      where: {
        id: Number(id)
      },
      include: {
        questions: true
      },
      data: {
        title,
        description,
      },
    });

    // 既存の選択肢を全件論理削除
    await prisma.option.updateMany({
      where: {
        question: { formId: Number(id) },
      },
      data: {
        isDeleted: true,
      }
     });

    // 質問・選択肢を登録
    const newQuestions = await insertQuestionAndOption(updatedForm.id, questions);

    // 削除された質問を物理削除
    for (let i = 0; i < updatedForm.questions.length; i++) {
      const oldId = updatedForm.questions[i].id;
      if(!newQuestions.some(nq => nq.id === oldId)) {
        await prisma.question.delete({
          where: { id: oldId },
        });
      }
    }

    // 再取得して返す
    return NextResponse.json(await getFormRecord(updatedForm.id));
  } else {
    const createdForm = await prisma.form.create({
      data: {
        title,
        description,
        userId: Number(session.user.id)
      },
    });
    // 質問・選択肢を登録
    await insertQuestionAndOption(createdForm.id, questions);

    // 再取得して返す
    return NextResponse.json(await getFormRecord(createdForm.id));
  }
}

async function getFormRecord(formId: number) {
  return await prisma.form.findUnique({
    where: {
      id: formId
    },
    include: {
      questions: {
        orderBy: { position: 'asc' },
        include: {
          options: {
            orderBy: { position: 'asc' }
          },
        },
      },
    },
  });
}

async function insertQuestionAndOption(formId: number, questions: any) {
  // 質問と選択肢を再作成
  let newQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const newQuestion = await prisma.question.upsert({
      where: {
        id: q.id
      },
      update: {
        label: q.label,
        type: q.type,
        position: q.position,
      },
      create: {
        formId: formId,
        label: q.label,
        type: q.type,
        position: q.position,
      },
    });

    if (q.type === 'radio' || q.type === 'checkbox') {
      const optionsData = (q.options || []).map((opt: any, j: number) => ({
        text: opt.text,
        position: opt.position,
        questionId: newQuestion.id,
      }));

      await prisma.option.createMany({
        data: optionsData,
      });
    }

    newQuestions.push(newQuestion);
  }

  return newQuestions;
}
