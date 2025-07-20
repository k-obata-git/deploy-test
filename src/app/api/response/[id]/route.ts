import { prisma } from '../../../../../prisma/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:example@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const formId = Number(params.id);
  const session = await getServerSession(authOptions);

  const userId: number | null = session ? Number(session.user.id) : null;


  const body = await req.json();

  try {
    const response = await prisma.response.create({
      include: {
        form: true
      },
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

    // 回答者以外に通知を送信
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: response.form?.userId },
    });

    const payload = JSON.stringify({
      title: '新しい回答があります',
      body: `フォーム「${response.form?.title}」に新しい回答が届きました。`,
    });

    await Promise.all(
      subscriptions.map((sub: any) =>
        webpush.sendNotification(sub, payload).catch((err) => {
          console.error('通知送信エラー:', err);
        })
      )
    );

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '回答の保存に失敗しました' }, { status: 500 });
  }
}
