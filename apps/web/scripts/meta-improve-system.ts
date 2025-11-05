/**
 * Meta-Improvement System
 *
 * Uses top 7 LLMs to analyze and suggest improvements to:
 * 1. Build plan generator
 * 2. Learning system
 *
 * Then implements the best suggestions.
 */

import * as fs from 'fs';
import * as path from 'path';

// Top 7 LLMs for code analysis and system design
const TOP_LLMS = [
  {
    model: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4',
    strength: 'Code analysis, nuanced understanding'
  },
  {
    model: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    strength: 'Deep reasoning, system design'
  },
  {
    model: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    strength: 'Balanced quality and speed'
  },
  {
    model: 'openai/gpt-4o',
    name: 'GPT-4 Omni',
    strength: 'System architecture, patterns'
  },
  {
    model: 'google/gemini-2.5-flash',
    name: 'Gemini 2.0 Flash',
    strength: 'Pattern recognition, large context'
  },
  {
    model: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    strength: 'Code optimization, best practices'
  },
  {
    model: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    strength: 'Open source, comprehensive analysis'
  }
];

interface LLMFeedback {
  model: string;
  modelName: string;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: {
      priority: 'critical' | 'high' | 'medium' | 'low';
      category: string;
      description: string;
      implementation: string;
      expectedImpact: string;
    }[];
  };
}

async function getSystemContext(): Promise<string> {
  const files = [
    'app/api/prd/generate-plan/route.ts',
    'lib/consensus-learning.ts',
    'lib/consensus-auto-fix.ts',
    'lib/build-orchestrator.ts'
  ];

  let context = '# CURRENT SYSTEM CODE\n\n';

  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      context += `## ${file}\n\n\`\`\`typescript\n${content}\n\`\`\`\n\n`;
    }
  }

  return context;
}

async function askLLMForFeedback(
  model: string,
  modelName: string,
  systemContext: string,
  openrouterKey: string
): Promise<LLMFeedback> {
  console.log(`🤖 Asking ${modelName} for feedback...`);

  const prompt = `You are an expert in AI-powered build systems, learning systems, and software architecture.

I'm going to show you a self-improving build plan generator and learning system. Your job is to analyze it deeply and suggest concrete improvements.

# SYSTEM OVERVIEW

This is a Build Plan Generator with a Learning System:

1. **Build Plan Generator**: Takes a product idea and generates a structured build plan (components, dependencies, file paths)
2. **Learning System**: Extracts patterns from consensus discussions, auto-injects learned rules into prompts
3. **Auto-Fix System**: Automatically fixes plans between consensus iterations based on AI feedback

${systemContext}

# YOUR TASK

Analyze this system thoroughly and provide:

1. **Strengths** (3-5 bullet points): What's working well?

2. **Weaknesses** (3-5 bullet points): What are the critical flaws or limitations?

3. **Improvements** (5-10 suggestions): Concrete, actionable improvements

For each improvement, specify:
- **Priority**: critical | high | medium | low
- **Category**: prompt-engineering | pattern-extraction | auto-fix | learning-algorithm | architecture | other
- **Description**: What needs to change?
- **Implementation**: How to implement it (be specific with code/algorithm changes)
- **Expected Impact**: What improvement will this bring? (quantify if possible)

Focus on:
- Pattern extraction quality (are we missing patterns?)
- Learning effectiveness (is it learning the right things?)
- Auto-fix capabilities (what else can we fix automatically?)
- Prompt injection strategy (are learned rules effective?)
- System architecture (any fundamental issues?)

Return your response as JSON in this format:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": [
    {
      "priority": "critical",
      "category": "pattern-extraction",
      "description": "...",
      "implementation": "...",
      "expectedImpact": "..."
    }
  ]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner Meta-Improvement',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower for more consistent analysis
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter API response (${response.status}):`, errorBody);
      throw new Error(`OpenRouter error: ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Extract JSON from response
    let jsonStr = content.trim();
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || jsonStr;
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.match(/```\s*([\s\S]*?)\s*```/)?.[1] || jsonStr;
    }

    const feedback = JSON.parse(jsonStr);

    console.log(`✅ ${modelName} provided ${feedback.improvements?.length || 0} improvements`);

    return {
      model,
      modelName,
      feedback
    };

  } catch (error) {
    console.error(`❌ Error getting feedback from ${modelName}:`, error);
    throw error;
  }
}

async function aggregateAndRankImprovements(allFeedback: LLMFeedback[]): Promise<any[]> {
  console.log('\n📊 Aggregating feedback from all models...\n');

  // Collect all improvements
  const allImprovements = allFeedback.flatMap(f =>
    f.feedback.improvements.map(imp => ({
      ...imp,
      suggestedBy: f.modelName
    }))
  );

  // Group similar improvements
  const grouped = new Map<string, any[]>();

  allImprovements.forEach(improvement => {
    // Simple grouping by category + first 50 chars of description
    const key = `${improvement.category}:${improvement.description.substring(0, 50)}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(improvement);
  });

  // Score and rank improvements
  const rankedImprovements = Array.from(grouped.entries()).map(([key, improvements]) => {
    // Calculate consensus score (how many models agree)
    const consensusScore = improvements.length / allFeedback.length;

    // Priority score
    const priorityScores: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const avgPriority = improvements.reduce((sum, imp) =>
      sum + (priorityScores[imp.priority] || 1), 0
    ) / improvements.length;

    // Merge implementations
    const mergedImplementation = improvements
      .map(imp => `[${imp.suggestedBy}]: ${imp.implementation}`)
      .join('\n\n');

    return {
      category: improvements[0].category,
      description: improvements[0].description,
      priority: improvements[0].priority,
      implementation: mergedImplementation,
      expectedImpact: improvements[0].expectedImpact,
      consensusScore,
      avgPriority,
      suggestedBy: improvements.map(imp => imp.suggestedBy),
      overallScore: consensusScore * avgPriority
    };
  });

  // Sort by overall score
  rankedImprovements.sort((a, b) => b.overallScore - a.overallScore);

  return rankedImprovements;
}

async function generateImplementationPlan(
  rankedImprovements: any[]
): Promise<string> {
  console.log('\n📝 Generating implementation plan...\n');

  let plan = '# Meta-Improvement Implementation Plan\n\n';
  plan += `Generated: ${new Date().toISOString()}\n\n`;
  plan += `Total Improvements Identified: ${rankedImprovements.length}\n\n`;

  // Critical improvements (consensus > 0.5, priority >= high)
  const critical = rankedImprovements.filter(imp =>
    imp.consensusScore > 0.5 && ['critical', 'high'].includes(imp.priority)
  );

  plan += `## Critical Improvements (${critical.length})\n\n`;
  plan += 'These have high consensus and high priority. Implement immediately.\n\n';

  critical.forEach((imp, idx) => {
    plan += `### ${idx + 1}. ${imp.description}\n\n`;
    plan += `**Category**: ${imp.category}\n`;
    plan += `**Priority**: ${imp.priority}\n`;
    plan += `**Consensus**: ${(imp.consensusScore * 100).toFixed(0)}% (${imp.suggestedBy.length}/${imp.suggestedBy.length} models)\n`;
    plan += `**Suggested by**: ${imp.suggestedBy.join(', ')}\n\n`;
    plan += `**Expected Impact**: ${imp.expectedImpact}\n\n`;
    plan += `**Implementation**:\n${imp.implementation}\n\n`;
    plan += `---\n\n`;
  });

  // High-value improvements
  const highValue = rankedImprovements.filter(imp =>
    !critical.includes(imp) && imp.consensusScore > 0.3
  );

  plan += `## High-Value Improvements (${highValue.length})\n\n`;
  plan += 'Strong suggestions from multiple models. Implement after critical ones.\n\n';

  highValue.forEach((imp, idx) => {
    plan += `### ${idx + 1}. ${imp.description}\n\n`;
    plan += `**Category**: ${imp.category}\n`;
    plan += `**Consensus**: ${(imp.consensusScore * 100).toFixed(0)}%\n`;
    plan += `**Suggested by**: ${imp.suggestedBy.join(', ')}\n\n`;
    plan += `**Expected Impact**: ${imp.expectedImpact}\n\n`;
    plan += `**Implementation** (summary):\n${imp.implementation.split('\n\n')[0]}\n\n`;
    plan += `---\n\n`;
  });

  return plan;
}

async function main() {
  console.log('🚀 Meta-Improvement System: Using Top 7 LLMs to Improve the Build System\n');

  // Get OpenRouter API key from .env.local
  let openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) {
    // Try to load from .env.local
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/OPENROUTER_API_KEY=(.+)/);
        if (match) {
          openrouterKey = match[1].trim();
          console.log('✅ Loaded OPENROUTER_API_KEY from .env.local\n');
        }
      }
    } catch (error) {
      console.error('Failed to load .env.local:', error);
    }
  }

  if (!openrouterKey) {
    console.error('❌ OPENROUTER_API_KEY not found in environment or .env.local');
    process.exit(1);
  }

  // Load system context
  console.log('📖 Loading system code...\n');
  const systemContext = await getSystemContext();
  console.log(`✅ Loaded ${systemContext.length} characters of system code\n`);

  // Get feedback from all 7 LLMs
  console.log('🤖 Querying top 7 LLMs for feedback...\n');

  const allFeedback: LLMFeedback[] = [];

  for (const llm of TOP_LLMS) {
    try {
      const feedback = await askLLMForFeedback(
        llm.model,
        llm.name,
        systemContext,
        openrouterKey
      );
      allFeedback.push(feedback);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to get feedback from ${llm.name}, continuing...`);
    }
  }

  if (allFeedback.length === 0) {
    console.error('❌ Failed to get any feedback from LLMs');
    process.exit(1);
  }

  console.log(`\n✅ Received feedback from ${allFeedback.length}/${TOP_LLMS.length} models\n`);

  // Save raw feedback
  const feedbackPath = path.join(process.cwd(), 'meta-feedback-raw.json');
  fs.writeFileSync(feedbackPath, JSON.stringify(allFeedback, null, 2));
  console.log(`💾 Saved raw feedback to ${feedbackPath}\n`);

  // Aggregate and rank improvements
  const rankedImprovements = await aggregateAndRankImprovements(allFeedback);

  // Generate implementation plan
  const implementationPlan = await generateImplementationPlan(rankedImprovements);

  // Save implementation plan
  const planPath = path.join(process.cwd(), 'META_IMPROVEMENTS.md');
  fs.writeFileSync(planPath, implementationPlan);
  console.log(`📝 Generated implementation plan: ${planPath}\n`);

  // Print summary
  console.log('📊 SUMMARY\n');
  console.log(`Total LLMs consulted: ${allFeedback.length}`);
  console.log(`Total improvements identified: ${rankedImprovements.length}`);
  console.log(`Critical improvements: ${rankedImprovements.filter(i => i.consensusScore > 0.5 && ['critical', 'high'].includes(i.priority)).length}`);
  console.log(`\nTop 5 improvements by consensus:\n`);

  rankedImprovements.slice(0, 5).forEach((imp, idx) => {
    console.log(`${idx + 1}. [${imp.category}] ${imp.description}`);
    console.log(`   Consensus: ${(imp.consensusScore * 100).toFixed(0)}% | Priority: ${imp.priority}`);
    console.log(`   Suggested by: ${imp.suggestedBy.join(', ')}\n`);
  });

  console.log(`\n✅ Meta-improvement analysis complete!`);
  console.log(`📖 Review META_IMPROVEMENTS.md for full implementation plan`);
}

export { main as metaImproveSystem };

// Run if executed directly
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
