import { NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma/prisma'

export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.masterQuestion.create({ data });
  return NextResponse.json(created);
}

export async function GET() {
  const questions = await prisma.masterQuestion.findMany();
  return NextResponse.json(questions);
}
