import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SymptomCheck from '@/lib/models/SymptomCheck';
import { analyzeSymptoms } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symptoms } = await request.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    // Analyze symptoms with AI
    const analysis = await analyzeSymptoms(symptoms);

    // Save to database
    await connectDB();
    const symptomCheck = new SymptomCheck({
      userId: session.user.id,
      symptoms,
      analysis: analysis.analysis,
      suggestedConditions: analysis.suggestedConditions,
      severity: analysis.severity,
    });

    await symptomCheck.save();

    return NextResponse.json({
      symptoms,
      analysis: analysis.analysis,
      suggestedConditions: analysis.suggestedConditions,
      severity: analysis.severity,
      createdAt: symptomCheck.createdAt,
    });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const symptomChecks = await SymptomCheck.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ symptomChecks });
  } catch (error) {
    console.error('Get symptom history error:', error);
    return NextResponse.json(
      { error: 'Failed to get symptom history' },
      { status: 500 }
    );
  }
}
