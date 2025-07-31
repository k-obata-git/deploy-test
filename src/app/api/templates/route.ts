import { NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/prisma';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth';

export async function GET() {
  try {
    const templates = await prisma.formTemplate.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        questions: true,
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { title, description = '', questions } = body

    if (!title || !questions) {
      return NextResponse.json({ message: 'title and questions are required' }, { status: 400 })
    }

    const template = await prisma.formTemplate.create({
      data: {
        title,
        description,
        questions,
        userId: Number(session.user.id),
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Template creation error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
