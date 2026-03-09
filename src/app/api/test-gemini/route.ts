import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Try to list models
    console.log('Testing Gemini API connection...');
    
    // Try different model names
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest', 
      'gemini-1.5-flash-001',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'gemini-pro-latest'
    ];

    const results = [];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = result.response;
        const text = response.text();
        
        results.push({
          model: modelName,
          status: 'success',
          response: text.substring(0, 100) + '...'
        });
        break; // Stop at first working model
      } catch (error) {
        results.push({
          model: modelName,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to test Gemini API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
