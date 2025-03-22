import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST() {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        message: "Google API key not configured"
      }, { status: 500 });
    }
    
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. Like this : 'Who is your crush?' || 'If you could have dinner with any historical figure, who would it be?' || 'I love you' || 'I am your biggest fan' or any confession or question. Send different questions, not the same question";

    // Obtain the text stream from the Gemini model
    // Note: Adjust the destructuring according to what streamText returns.
    const { textStream } = await streamText({
      model: google('gemini-1.5-pro-latest'),
      prompt: prompt,
      // The API key is automatically read from the environment
    });

    // Create a ReadableStream that iterates over the textStream asynchronously
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Iterate over each chunk in the text stream
          for await (const chunk of textStream) {
            const encodedChunk =
              typeof chunk === 'string'
                ? new TextEncoder().encode(chunk)
                : chunk;
            controller.enqueue(encodedChunk);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({
      success: false,
      message: "Error generating suggestions",
      error: errorMessage
    }, { status: 500 });
  }
}