import { NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma/prisma'

// POST 新規テンプレート作成
export async function POST(req: Request) {
  const data = await req.json();
  const newTemplate = await prisma.formTemplate.create({
    data: {
      title: data.title,
      description: data.description,
      questions: data.questions,
      userId: data.userId,
    },
  });

  return NextResponse.json(newTemplate);
}

// GET 一覧取得
export async function GET() {
  const templates = await prisma.formTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}
