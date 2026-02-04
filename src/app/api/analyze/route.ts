import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const analyzeSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = analyzeSchema.parse(body);

    const message = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: `Analyze this prompt and provide a detailed analysis in JSON format with the following structure:
{
  "clarity": <score 0-100>,
  "specificity": <score 0-100>,
  "contextCompleteness": <score 0-100>,
  "overall": <score 0-100>,
  "suggestions": [<array of improvement suggestions>]
}

Prompt to analyze:
"${prompt}"

Respond ONLY with valid JSON, no additional text.`,
        },
      ],
    });

    const content = message.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    );
  }
}
