import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

// Prepare cupping data for AI analysis
function prepareCuppingData(sampleData: any, scores: any[], flavorDescriptors: any[]) {
  const avgScore = scores.length > 0
    ? scores.reduce((sum, score) => sum + score.totalScore, 0) / scores.length
    : 0;

  const categories = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity', 'overall'];
  const categoryScores = categories.map(category => {
    const categoryAvg = scores.length > 0
      ? scores.reduce((sum, score) => sum + (score[category] || 0), 0) / scores.length
      : 0;
    return `${category}: ${categoryAvg.toFixed(2)}`;
  }).join(', ');

  const positiveDescriptors = flavorDescriptors
    .filter(fd => fd.category === 'POSITIVE')
    .map(fd => `${fd.name} (${fd.intensity})`)
    .join(', ');

  const negativeDescriptors = flavorDescriptors
    .filter(fd => fd.category === 'NEGATIVE')
    .map(fd => `${fd.name} (${fd.intensity})`)
    .join(', ');

  const notes = scores
    .filter(score => score.notes)
    .map(score => score.notes)
    .join('. ');

  return {
    avgScore,
    categoryScores,
    positiveDescriptors,
    negativeDescriptors,
    notes,
    sampleInfo: {
      name: sampleData.sample.name,
      origin: sampleData.sample.origin || 'Unknown',
      variety: sampleData.sample.variety || 'Unknown',
      processing: sampleData.sample.processingMethod || 'Unknown'
    }
  };
}

// Generate AI prompt for cupping analysis
function generateCuppingPrompt(data: any): string {
  return `
As a professional coffee cupping expert, write a comprehensive summary report for this coffee sample:

Sample Information:
- Name: ${data.sampleInfo.name}
- Origin: ${data.sampleInfo.origin}
- Variety: ${data.sampleInfo.variety}
- Processing: ${data.sampleInfo.processing}

Cupping Results:
- Overall Score: ${data.avgScore.toFixed(2)}/100
- Category Scores: ${data.categoryScores}
- Positive Flavor Notes: ${data.positiveDescriptors || 'None noted'}
- Negative Flavor Notes: ${data.negativeDescriptors || 'None noted'}
- Cupper Notes: ${data.notes || 'No additional notes'}

Please provide a professional, detailed summary that includes:
1. Overall quality assessment
2. Flavor profile analysis
3. Strengths and weaknesses
4. Recommendations for brewing or use
5. Market positioning suggestions

Keep the summary between 200-400 words and write in a professional tone suitable for coffee industry professionals.
`;
}

// Gemini AI integration
async function generateGeminiSummary(apiKey: string, prompt: string): Promise<string> {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini summary:', error);
    throw new Error('Failed to generate AI summary with Gemini');
  }
}

// OpenRouter AI integration
async function generateOpenRouterSummary(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3001',
        'X-Title': 'Coffee Cupping Lab'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: any = await response.json();
    return data.choices[0]?.message?.content || 'Failed to generate summary';
  } catch (error) {
    console.error('Error generating OpenRouter summary:', error);
    throw new Error('Failed to generate AI summary with OpenRouter');
  }
}

// Main AI summary generation function
async function generateAISummary(
  provider: string,
  apiKey: string,
  model: string,
  sampleData: any,
  scores: any[],
  flavorDescriptors: any[]
): Promise<string> {
  const cuppingData = prepareCuppingData(sampleData, scores, flavorDescriptors);
  const prompt = generateCuppingPrompt(cuppingData);

  switch (provider) {
    case 'gemini':
      return generateGeminiSummary(apiKey, prompt);
    case 'openrouter':
      return generateOpenRouterSummary(apiKey, model, prompt);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export const generateSessionSampleSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId, sampleId } = req.params;

    // Get organization settings for AI configuration
    const organization = await prisma.organization.findUnique({
      where: {
        id: req.user!.organizationId,
      },
      select: {
        settings: true,
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: { message: 'Organization not found' },
      });
    }

    const settings = organization.settings as Record<string, any>;
    const aiProvider = settings.aiProvider || 'gemini';
    const geminiApiKey = settings.geminiApiKey;
    const openRouterApiKey = settings.openRouterApiKey;
    const openRouterModel = settings.openRouterModel || 'anthropic/claude-3.5-sonnet';

    // Validate API key based on provider
    let apiKey: string;
    if (aiProvider === 'gemini') {
      if (!geminiApiKey) {
        return res.status(400).json({
          success: false,
          error: { message: 'Gemini API key not configured. Please add it in Settings.' },
        });
      }
      apiKey = geminiApiKey;
    } else if (aiProvider === 'openrouter') {
      if (!openRouterApiKey) {
        return res.status(400).json({
          success: false,
          error: { message: 'OpenRouter API key not configured. Please add it in Settings.' },
        });
      }
      apiKey = openRouterApiKey;
    } else {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid AI provider configured. Please check your settings.' },
      });
    }

    // Get session sample data
    const sessionSample = await prisma.sessionSample.findFirst({
      where: {
        sessionId,
        sampleId,
        session: {
          organizationId: req.user!.organizationId,
        },
      },
      include: {
        sample: true,
        scores: {
          include: {
            user: true,
            flavorDescriptors: {
              include: {
                flavorDescriptor: true,
              },
            },
          },
        },
      },
    });

    if (!sessionSample) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session sample not found' },
      });
    }

    // Prepare flavor descriptors data
    const flavorDescriptors: Array<{ name: string; category: string; intensity: number }> = [];
    sessionSample.scores.forEach(score => {
      score.flavorDescriptors?.forEach(fd => {
        const existing = flavorDescriptors.find(d => d.name === fd.flavorDescriptor.name);
        if (existing) {
          existing.intensity = Math.max(existing.intensity, fd.intensity);
        } else {
          flavorDescriptors.push({
            name: fd.flavorDescriptor.name,
            category: fd.flavorDescriptor.category,
            intensity: fd.intensity,
          });
        }
      });
    });

    // Generate AI summary
    const aiSummary = await generateAISummary(
      aiProvider,
      apiKey,
      openRouterModel,
      sessionSample,
      sessionSample.scores,
      flavorDescriptors
    );

    // Note: AI summary storage in database is currently disabled
    // The aiSummary and aiGeneratedAt fields have been removed from the schema
    // Return the generated summary without storing it
    res.json({
      success: true,
      data: {
        aiSummary,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
