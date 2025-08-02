import { NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma/prisma';
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth';

// テンプレート1件取得
export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', session }, { status: 401 });
  }

  const form = await prisma.formTemplate.findUnique({
    where: {
      id: Number(params.id),
    },
  });

  return NextResponse.json(form);
}