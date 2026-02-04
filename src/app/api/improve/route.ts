import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const improveSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  context: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // require authenticated user
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const clerkId = user.id;

    const body = await request.json();
    const { prompt, context } = improveSchema.parse(body);

    // ensure DB user exists
    await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId },
    });

    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if ((dbUser.credits ?? 0) < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const systemPrompt = `You are an expert prompt engineer. Your task is to take user prompts and improve them to be more effective for language models.\nFocus on:\n- Clarity: Make the intent crystal clear\n- Specificity: Add necessary details and constraints\n- Structure: Organize the prompt logically\n- Context: Ensure sufficient background is provided\n\n${context ? `Additional context: ${context}` : ''}\n\nReturn ONLY the improved prompt, no explanations or commentary.`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    // persist usage and decrement credits atomically
    await prisma.$transaction([
      prisma.user.update({ where: { clerkId }, data: { credits: { decrement: 1 } } }),
      prisma.promptUsage.create({
        data: {
          user: { connect: { id: dbUser.id } },
          originalPrompt: prompt,
          improvedPrompt: content.trim(),
          model: 'gpt-4o-mini',
        },
      }),
    ]);

    return NextResponse.json({
      originalPrompt: prompt,
      improvedPrompt: content.trim(),
      model: 'gpt-4o-mini',
    });
  } catch (error) {
    console.error('Improvement error:', error);
    return NextResponse.json({ error: 'Failed to improve prompt' }, { status: 500 });
  }
}
