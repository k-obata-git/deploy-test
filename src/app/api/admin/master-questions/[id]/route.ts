import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../prisma/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';

// マスタ質問1件削除
export async function DELETE(_: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!(session?.user?.id && session?.user?.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const params = await props.params;
  // 選択肢を削除
  await prisma.masterOption.deleteMany({
    where: {
      masterQuestionId: Number(params.id)
    },
  });

  await prisma.masterQuestion.delete({
    where: {
      id: Number(params.id)
    }
  });
  return NextResponse.json({ success: true });
}
