import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const variationsSchema = z.object({
  prompt: z.string().min(10),
  count: z.number().int().min(1).max(10).default(3),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, count } = variationsSchema.parse(body);

    const message = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: `Generate ${count} different variations of this prompt, each optimized for different use cases or approaches. 
Each variation should maintain the core intent but approach it differently.

Original prompt:
"${prompt}"

Return ONLY a JSON object like: {"variations": ["variation1", "variation2", "variation3"]}
No additional text or explanations.`,
        },
      ],
    });

    const content = message.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const parsed = JSON.parse(content);
    const variations = parsed.variations || parsed;

    return NextResponse.json({
      originalPrompt: prompt,
      variations: Array.isArray(variations) ? variations : [variations],
      count: Array.isArray(variations) ? variations.length : 1,
    });
  } catch (error) {
    console.error('Variations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate variations' },
      { status: 500 }
    );
  }
}
