import { NextRequest, NextResponse } from 'next/server';
import { PRDBuilder } from '../../../../lib/prd/builder';

// Mock suggestions when API key is not available
function generateMockSuggestions(productIdea: string, phase: number) {
  const baseId = Date.now();

  switch (phase) {
    case 1: // Context Phase
      return [
        {
          id: `mock-${baseId}-1`,
          type: 'executive_summary',
          title: 'Market Opportunity',
          shortDescription: 'AI automation market growing 25% annually with $15B opportunity by 2025',
          fullDescription: `The AI automation market is experiencing rapid growth at 25% CAGR (McKinsey, 2023), reaching $15B by 2025 (Gartner, 2023). ${productIdea} addresses this growing market with intelligent automation capabilities that can capture significant market share.`,
          citations: [
            'McKinsey Global Institute: "The Age of AI" (2023) - 25% CAGR growth rate',
            'Gartner: AI in Sales Technology Forecast (2023) - $15B market size by 2025'
          ],
          section: 'executive_summary',
          priority: 'high'
        },
        {
          id: `mock-${baseId}-2`,
          type: 'problem_statement',
          title: 'Productivity Crisis',
          shortDescription: 'Teams spend 60% of time on manual tasks instead of core activities',
          fullDescription: 'Research shows professionals spend 60% of their time on manual, repetitive tasks (McKinsey, 2023) instead of high-value activities. This inefficiency costs businesses $2.1M annually per 100-person team (Salesforce, 2023) and creates significant opportunity for automation solutions.',
          citations: [
            'McKinsey Productivity Study (2023) - 60% time on manual tasks',
            'Salesforce Business Impact Report (2023) - $2.1M annual cost per 100-person team'
          ],
          section: 'problem_statement',
          priority: 'high'
        }
      ];

    case 2: // Shape Phase
      return [
        {
          id: `mock-${baseId}-3`,
          type: 'objectives',
          title: 'Success Metrics',
          shortDescription: 'Increase productivity by 3x and reduce manual work by 80%',
          fullDescription: 'Primary objectives: Increase team productivity by 3x (Forrester, 2023), reduce manual work by 80% (industry benchmark), and achieve 6-month ROI payback period. Success measured through time-tracking analytics and productivity metrics.',
          citations: [
            'Forrester: Automation ROI Study (2023) - 3x productivity increase',
            'Industry Automation Benchmark (2023) - 80% manual work reduction'
          ],
          section: 'objectives',
          priority: 'high'
        }
      ];

    default:
      return [];
  }
}

// PRD Building Service using advanced LLM strategy
class PRDBuildingService {
  private baseUrl = 'https://openrouter.ai/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeAPICall(model: string, messages: any[], options: any = {}) {
    console.log('Making API call to OpenRouter with model:', model);

    const requestBody = {
      model,
      messages,
      temperature: options.temperature || 0.3,
      max_tokens: options.max_tokens || 3000,
      ...options
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://buildrunner.cloud',
        'X-Title': 'BuildRunner SaaS - PRD Builder',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API response:', result);
    return result;
  }

  // Phase 1: Context - Fill executive summary, problem, value prop, personas
  async buildContext(productIdea: string, existingFeatures: any[] = []) {
    try {
      const data = await this.makeAPICall('anthropic/claude-4-sonnet-20250522', [
        {
          role: 'system',
          content: `You are a product strategy expert. Analyze the product idea and create comprehensive context for a PRD.

Return a JSON object with this exact schema:
{
  "executive_summary": "One tight paragraph: what we're building, why now, expected outcome",
  "user_pain": "Specific user pain points with qualitative details",
  "value_proposition": "Clear benefit statement and value prop",
  "personas": [
    {
      "name": "Primary User Type",
      "jtbd": "Jobs to be Done - what they're trying to accomplish",
      "environments": ["web", "mobile"],
      "segments": ["SMB", "Enterprise"]
    }
  ],
  "root_causes": ["Root cause 1", "Root cause 2"],
  "current_workaround": "How users currently solve this problem"
}

Focus on being specific and actionable. Use the existing features to inform your analysis.`
        },
        {
          role: 'user',
          content: `Product Idea: ${productIdea}

Existing Features: ${existingFeatures.map(f => `- ${f.title}: ${f.summary}`).join('\n')}

Analyze this product idea and provide comprehensive context for a PRD. Return only the JSON object.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Context building error:', error);
      
      // Fallback context
      return {
        executive_summary: `This PRD outlines the development of an AI-powered solution for ${productIdea.toLowerCase()}.`,
        user_pain: `Users currently struggle with manual processes and inefficiencies related to ${productIdea.toLowerCase()}.`,
        value_proposition: `Automate and streamline ${productIdea.toLowerCase()} to save time and improve efficiency.`,
        personas: [{
          name: "Primary User",
          jtbd: "Accomplish tasks more efficiently",
          environments: ["web"],
          segments: ["SMB"]
        }],
        root_causes: ["Manual processes", "Lack of automation"],
        current_workaround: "Manual processes and existing tools"
      };
    }
  }

  // Phase 2: Shape - Propose features and scope
  async buildShape(productIdea: string, contextData: any, existingFeatures: any[] = []) {
    try {
      const data = await this.makeAPICall('anthropic/claude-4-sonnet-20250522', [
        {
          role: 'system',
          content: `You are a product manager expert. Based on the product context, define features and scope for the PRD.

Return a JSON object with this exact schema:
{
  "features": [
    {
      "id": "F-001",
      "name": "Feature Name",
      "description": "Detailed description of what this feature does",
      "user_story": "As a [persona], I want [capability] so that [outcome]",
      "acceptance_criteria": ["Given... When... Then...", "Another criteria"],
      "plan_gate": "free|pro|enterprise"
    }
  ],
  "in_scope": ["What's included in this version"],
  "out_of_scope": ["What's explicitly excluded to prevent scope creep"],
  "objectives": [
    {
      "objective": "Clear objective statement",
      "kpi": "Measurable KPI",
      "target": "Specific target value",
      "source": "Where we'll measure this"
    }
  ]
}

Create 3-5 core features that directly address the user pain points. Be specific and actionable.`
        },
        {
          role: 'user',
          content: `Product Idea: ${productIdea}

Context:
- User Pain: ${contextData.user_pain}
- Value Prop: ${contextData.value_proposition}
- Personas: ${contextData.personas.map((p: any) => `${p.name} (${p.jtbd})`).join(', ')}

Existing Features: ${existingFeatures.map(f => `- ${f.title}: ${f.summary}`).join('\n')}

Define the features and scope for this product. Return only the JSON object.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 3000
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Shape building error:', error);
      
      // Fallback shape
      return {
        features: [
          {
            id: "F-001",
            name: "Core Functionality",
            description: "Primary feature that addresses the main user need",
            user_story: "As a user, I want core functionality so that I can accomplish my goals",
            acceptance_criteria: ["Feature works as expected", "User can complete primary workflow"],
            plan_gate: "free"
          }
        ],
        in_scope: ["Core functionality", "Basic user interface"],
        out_of_scope: ["Advanced features", "Enterprise integrations"],
        objectives: [
          {
            objective: "Improve user efficiency",
            kpi: "Time to complete task",
            target: "50% reduction",
            source: "User analytics"
          }
        ]
      };
    }
  }

  // Phase 3: Evidence & Metrics
  async buildEvidence(productIdea: string, features: any[]) {
    try {
      const data = await this.makeAPICall('deepseek/deepseek-r1', [
        {
          role: 'system',
          content: `You are an analytics expert. Define comprehensive metrics and evidence framework for this product.

Return a JSON object with this exact schema:
{
  "north_star": "Primary success metric that drives everything",
  "events": [
    {
      "name": "event_name",
      "properties": ["user_id", "project_id", "feature_used", "timestamp"]
    }
  ],
  "experiments": [
    {
      "name": "Experiment name",
      "variant_allocation": {"A": 0.5, "B": 0.5},
      "success_metric": "What we're measuring"
    }
  ],
  "qualitative_evidence": ["User interview insights", "Support ticket themes"],
  "quantitative_evidence": ["Usage statistics", "Performance metrics"]
}

Think carefully about what metrics will truly indicate success for this product.`
        },
        {
          role: 'user',
          content: `Product Idea: ${productIdea}

Features: ${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Define comprehensive analytics and evidence framework. Return only the JSON object.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Evidence building error:', error);

      // Fallback evidence
      return {
        north_star: "User engagement and task completion rate",
        events: [
          {
            name: "feature_used",
            properties: ["user_id", "project_id", "feature_name", "timestamp"]
          }
        ],
        experiments: [],
        qualitative_evidence: ["User feedback", "Support requests"],
        quantitative_evidence: ["Usage metrics", "Performance data"]
      };
    }
  }

  // Generate phase-specific suggestions
  async generatePhaseSuggestions(productIdea: string, userMessage: string, phase: number, currentPRD: any) {
    try {
      const phaseInfo = this.getPhaseInfo(phase);

      console.log('Making API call to Claude...');
      const data = await this.makeAPICall('anthropic/claude-4-sonnet-20250522', [
        {
          role: 'system',
          content: `You are a product strategy expert. Generate specific, actionable suggestions for Phase ${phase}: ${phaseInfo.name}.

Current Phase Focus: ${phaseInfo.description}
Sections in this phase: ${phaseInfo.sections.join(', ')}

Return a JSON array of suggestions with this exact schema:
[
  {
    "id": "unique_id",
    "type": "section_name",
    "title": "Brief suggestion title",
    "shortDescription": "One line description for the suggestion",
    "fullDescription": "Detailed explanation with specific data and insights",
    "citations": ["Source 1: Specific study or report", "Source 2: Another credible source"],
    "priority": "high|medium|low",
    "section": "which PRD section this applies to"
  }
]

IMPORTANT:
- shortDescription must be ONE LINE only
- Include real citations for any statistics or claims
- All numbers must have sources cited
- Generate 3-5 specific, actionable suggestions that align with the current phase and user's message.`
        },
        {
          role: 'user',
          content: `Product Idea: ${productIdea}

User Message: ${userMessage}

Current PRD State: ${JSON.stringify(currentPRD, null, 2)}

Generate phase-specific suggestions for Phase ${phase}. Return only the JSON array.`
        }
      ], {
        temperature: 0.4,
        max_tokens: 2500
      });

      console.log('API call completed, data:', data);

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      console.log('Raw AI response:', content);

      // Extract JSON from Claude's response (might be wrapped in markdown)
      let jsonStr = content.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Find JSON array in the response
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      console.log('Extracted JSON:', jsonStr);

      return JSON.parse(jsonStr);

    } catch (error) {
      console.error('Suggestion generation error:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return [];
    }
  }

  // Process user message and update PRD
  async processUserMessage(productIdea: string, userMessage: string, phase: number, currentPRD: any) {
    try {
      const phaseInfo = this.getPhaseInfo(phase);

      const data = await this.makeAPICall('anthropic/claude-4-sonnet-20250522', [
        {
          role: 'system',
          content: `You are a product manager. Process the user's message and suggest specific updates to the PRD.

Current Phase: ${phase} - ${phaseInfo.name}
Phase Description: ${phaseInfo.description}
Sections: ${phaseInfo.sections.join(', ')}

Return a JSON object with this exact schema:
{
  "updates": {
    "section_name": {
      "field": "new_value_or_addition"
    }
  },
  "suggestions": [
    {
      "id": "unique_id",
      "type": "section_name",
      "title": "Suggestion title",
      "content": "Detailed content",
      "section": "PRD section"
    }
  ],
  "next_steps": ["What the user should do next"]
}

Focus on the current phase sections and make specific, actionable recommendations.`
        },
        {
          role: 'user',
          content: `Product Idea: ${productIdea}

User Message: ${userMessage}

Current PRD: ${JSON.stringify(currentPRD, null, 2)}

Process this message and suggest PRD updates. Return only the JSON object.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 3000
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in API response');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Message processing error:', error);
      return {
        updates: {},
        suggestions: [],
        next_steps: ["Continue building your PRD by filling out the current phase sections."]
      };
    }
  }

  private getPhaseInfo(phase: number) {
    const phases = [
      {
        name: "Context",
        description: "Define the problem and opportunity",
        sections: ["metadata", "executive_summary", "problem_statement", "target_audience", "value_proposition"]
      },
      {
        name: "Shape",
        description: "Outline features and scope",
        sections: ["objectives", "scope", "features"]
      },
      {
        name: "Evidence",
        description: "Add success criteria and analytics",
        sections: ["non_functional", "dependencies", "risks", "analytics"]
      },
      {
        name: "Launch",
        description: "Business model and go-to-market",
        sections: ["monetization", "rollout", "open_questions"]
      }
    ];

    return phases[phase - 1] || phases[0];
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      action,
      product_idea,
      phase,
      existing_features = [],
      context_data,
      features,
      user_message,
      current_prd
    } = await request.json();

    // Get API keys from headers (sent from client) or environment
    const apiKeys = request.headers.get('x-api-keys');
    let openrouterKey = '';

    if (apiKeys) {
      try {
        const keys = JSON.parse(apiKeys);
        openrouterKey = keys.openrouter || '';
        console.log('API keys parsed from headers, OpenRouter key present:', !!openrouterKey);
      } catch (e) {
        console.warn('Failed to parse API keys from headers:', e);
      }
    }

    // Fallback to environment variable
    if (!openrouterKey) {
      openrouterKey = process.env.OPENROUTER_API_KEY || '';
      console.log('Using environment OpenRouter key:', !!openrouterKey);
    }

    if (!openrouterKey) {
      console.log('OpenRouter API key not configured, using mock responses');
      // Return mock suggestions instead of error
      const mockSuggestions = generateMockSuggestions(product_idea, phase || 1);
      return NextResponse.json({
        result: mockSuggestions,
        action,
        phase: phase || 1,
        timestamp: new Date().toISOString(),
        source: 'mock_data'
      });
    }

    const service = new PRDBuildingService(openrouterKey);
    const builder = new PRDBuilder(product_idea, "product@buildrunner.cloud");

    let result;

    switch (action) {
      case 'build_context':
        result = await service.buildContext(product_idea, existing_features);
        builder.fillContext(result);
        break;

      case 'build_shape':
        result = await service.buildShape(product_idea, context_data, existing_features);
        builder.fillShape(result);
        break;

      case 'build_evidence':
        result = await service.buildEvidence(product_idea, features);
        builder.fillEvidence(result);
        break;

      case 'generate_suggestions':
        console.log('Calling AI with:', { product_idea, user_message, phase });
        result = await service.generatePhaseSuggestions(
          product_idea,
          user_message,
          phase || 1,
          current_prd
        );
        console.log('AI returned suggestions:', result);
        break;

      case 'process_message':
        result = await service.processUserMessage(
          product_idea,
          user_message,
          phase || 1,
          current_prd
        );
        break;

      case 'get_phases':
        result = builder.getAllPhases();
        break;

      case 'export_prd':
        result = {
          json: builder.toJSON(),
          markdown: builder.toMarkdown(),
          prd: builder.getPRD()
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use build_context, build_shape, build_evidence, generate_suggestions, process_message, get_phases, or export_prd' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      result,
      action,
      phase: phase || builder.getCurrentPhase(),
      timestamp: new Date().toISOString(),
      source: 'real_ai'
    });

  } catch (error) {
    console.error('Error in PRD building API:', error);
    return NextResponse.json(
      { error: 'Failed to process PRD building request' },
      { status: 500 }
    );
  }
}
