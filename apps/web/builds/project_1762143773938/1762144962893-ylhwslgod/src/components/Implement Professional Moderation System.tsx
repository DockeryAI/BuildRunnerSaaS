```typescript
import { useState, useCallback, useEffect } from 'react';
import { OpenRouter } from '@/lib/openrouter';
import { toast } from 'react-hot-toast';

type ModerationType = 'text' | 'image' | 'video';
type ModerationResult = {
  isApproved: boolean;
  confidence: number;
  categories: string[];
  reason?: string;
};

interface ModerationConfig {
  sensitivityLevel: number;
  autoReject: boolean;
  customRules?: RegExp[];
  bannedKeywords?: string[];
}

/**
 * Professional content moderation system component
 * @param {Object} props Component properties
 * @param {ModerationType} props.type Type of content to moderate
 * @param {string} props.content Content to analyze
 * @param {ModerationConfig} props.config Moderation configuration
 * @param {(result: ModerationResult) => void} props.onResult Callback for moderation results
 */
export const ContentModerator: React.FC<{
  type: ModerationType;
  content: string;
  config: ModerationConfig;
  onResult: (result: ModerationResult) => void;
}> = ({ type, content, config, onResult }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ModerationResult | null>(null);

  const moderateContent = useCallback(async () => {
    if (!content) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const openRouter = new OpenRouter();
      
      // Basic content checks
      if (config.bannedKeywords?.some(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
      )) {
        const result: ModerationResult = {
          isApproved: false,
          confidence: 1,
          categories: ['banned_keyword'],
          reason: 'Content contains banned keywords'
        };
        setResult(result);
        onResult(result);
        return;
      }

      if (config.customRules?.some(rule => rule.test(content))) {
        const result: ModerationResult = {
          isApproved: false,
          confidence: 1,
          categories: ['custom_rule'],
          reason: 'Content violates custom rules'
        };
        setResult(result);
        onResult(result);
        return;
      }

      // AI-based moderation
      const prompt = `
        Please analyze the following content for moderation:
        Type: ${type}
        Content: ${content}
        
        Evaluate for:
        - Inappropriate content
        - Hate speech
        - Violence
        - Adult content
        - Spam
        - Harassment
        
        Return JSON with:
        {
          "isApproved": boolean,
          "confidence": number (0-1),
          "categories": string[],
          "reason": string (optional)
        }
      `;

      const aiResponse = await openRouter.complete({
        prompt,
        model: 'openai/gpt-4',
        maxTokens: 500
      });

      const moderationResult: ModerationResult = JSON.parse(aiResponse.text);
      
      // Apply sensitivity threshold
      if (moderationResult.confidence < config.sensitivityLevel) {
        moderationResult.isApproved = true;
      }

      if (config.autoReject && !moderationResult.isApproved) {
        toast.error('Content rejected by moderation system');
      }

      setResult(moderationResult);
      onResult(moderationResult);

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Moderation failed';
      setError(error);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [content, config, type, onResult]);

  useEffect(() => {
    moderateContent();
  }, [moderateContent]);

  return (
    <div className="content-moderator">
      {isLoading && (
        <div className="moderator-loading">
          Analyzing content...
        </div>
      )}

      {error && (
        <div className="moderator-error">
          Error: {error}
        </div>
      )}

      {result && (
        <div className={`moderator-result ${result.isApproved ? 'approved' : 'rejected'}`}>
          <div className="result-status">
            Status: {result.isApproved ? 'Approved' : 'Rejected'}
          </div>
          <div className="result-confidence">
            Confidence: {Math.round(result.confidence * 100)}%
          </div>
          {result.categories.length > 0 && (
            <div className="result-categories">
              Categories: {result.categories.join(', ')}
            </div>
          )}
          {result.reason && (
            <div className="result-reason">
              Reason: {result.reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Default moderation config
export const DEFAULT_MODERATION_CONFIG: ModerationConfig = {
  sensitivityLevel: 0.8,
  autoReject: true,
  bannedKeywords: [],
  customRules: []
};

// CSS Module
export const styles = `
  .content-moderator {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .moderator-loading {
    color: #666;
    font-style: italic;
  }

  .moderator-error {
    color: #dc3545;
    margin: 0.5rem 0;
  }

  .moderator-result {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 4px;
  }

  .moderator-result.approved {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  }

  .moderator-result.rejected {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }

  .result-status {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .result-confidence,
  .result-categories,
  .result-reason {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
`;
```