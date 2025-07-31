import { NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma'

export async function GET() {
  const questions = await prisma.masterQuestion.findMany({
    include: { options: true },
    orderBy: { id: 'asc' }
  })
  return NextResponse.json(questions)
}
