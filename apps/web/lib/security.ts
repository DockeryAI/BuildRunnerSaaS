import { z } from 'zod';
import { NextRequest } from 'next/server';
import { auditLogger } from './audit';

// Rate limiting configuration
export const RateLimitConfigSchema = z.object({
  windowMs: z.number().default(60000), // 1 minute
  maxRequests: z.number().default(100),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
  keyGenerator: z.function().optional(),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

// Input validation schemas
export const SafeStringSchema = z.string()
  .min(1)
  .max(1000)
  .regex(/^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%^&*+=|\\/<>~`]*$/, 'Contains invalid characters');

export const SafeEmailSchema = z.string()
  .email()
  .max(254)
  .toLowerCase();

export const SafeUUIDSchema = z.string()
  .uuid('Invalid UUID format');

export const SafeJSONSchema = z.record(z.any())
  .refine(
    (data) => {
      try {
        const str = JSON.stringify(data);
        return str.length <= 10000; // Max 10KB JSON
      } catch {
        return false;
      }
    },
    'JSON too large or invalid'
  );

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

/**
 * Rate Limiter - In-memory rate limiting for API endpoints
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...RateLimitConfigSchema.parse({}), ...config };
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let requestData = this.requests.get(key);
    
    if (!requestData || requestData.resetTime <= now) {
      // New window or expired
      requestData = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.requests.set(key, requestData);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: requestData.resetTime,
      };
    }
    
    if (requestData.count >= this.config.maxRequests) {
      // Rate limit exceeded
      await auditLogger.logSecurityEvent(
        'rate_limit_exceeded',
        { type: 'api', id: key },
        'rate_limit_exceeded',
        { key, count: requestData.count, limit: this.config.maxRequests },
        false
      );
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestData.resetTime,
      };
    }
    
    // Increment count
    requestData.count++;
    this.requests.set(key, requestData);
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - requestData.count,
      resetTime: requestData.resetTime,
    };
  }

  /**
   * Generate rate limit key from request
   */
  generateKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }
    
    // Default: use IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    return `ip:${ip}`;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime <= now) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Input Sanitizer - Clean and validate user inputs
 */
export class InputSanitizer {
  /**
   * Sanitize string input
   */
  static sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Remove null bytes and control characters
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Validate with schema
    return SafeStringSchema.parse(sanitized);
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('Email must be a string');
    }
    
    return SafeEmailSchema.parse(input.trim());
  }

  /**
   * Sanitize UUID input
   */
  static sanitizeUUID(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('UUID must be a string');
    }
    
    return SafeUUIDSchema.parse(input.trim());
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJSON(input: unknown): Record<string, any> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }
    
    return SafeJSONSchema.parse(input);
  }

  /**
   * Detect potential XSS attempts
   */
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect potential SQL injection attempts
   */
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/)/gi,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }
}

/**
 * CSRF Protection - Generate and validate CSRF tokens
 */
export class CSRFProtection {
  private static readonly SECRET = process.env.CSRF_SECRET || 'default-csrf-secret';
  
  /**
   * Generate CSRF token
   */
  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const payload = `${sessionId}:${timestamp}`;
    
    // In production, use proper HMAC signing
    const token = Buffer.from(payload).toString('base64');
    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string, sessionId: string): boolean {
    try {
      const payload = Buffer.from(token, 'base64').toString();
      const [tokenSessionId, timestamp] = payload.split(':');
      
      // Check session ID matches
      if (tokenSessionId !== sessionId) {
        return false;
      }
      
      // Check token age (valid for 1 hour)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 3600000) { // 1 hour
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware(config: {
  rateLimit?: Partial<RateLimitConfig>;
  requireCSRF?: boolean;
  validateInput?: boolean;
} = {}) {
  const rateLimiter = new RateLimiter(config.rateLimit);
  
  return async function securityMiddleware(request: NextRequest) {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      const rateLimitKey = rateLimiter.generateKey(request);
      const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey);
      
      if (!rateLimitResult.allowed) {
        await auditLogger.logSecurityEvent(
          'rate_limit_exceeded',
          {
            type: 'api',
            id: rateLimitKey,
            ip_address: request.ip,
            user_agent: request.headers.get('user-agent'),
          },
          'rate_limit_exceeded',
          {
            endpoint: request.url,
            method: request.method,
            remaining: rateLimitResult.remaining,
          },
          false
        );
        
        return new Response('Rate limit exceeded', {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.rateLimit?.maxRequests?.toString() || '100',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        });
      }

      // CSRF protection for state-changing operations
      if (config.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionId = request.headers.get('x-session-id') || 'anonymous';
        
        if (!csrfToken || !CSRFProtection.validateToken(csrfToken, sessionId)) {
          await auditLogger.logSecurityEvent(
            'permission_denied',
            {
              type: 'api',
              id: rateLimitKey,
              ip_address: request.ip,
              user_agent: request.headers.get('user-agent'),
            },
            'csrf_validation_failed',
            {
              endpoint: request.url,
              method: request.method,
              has_token: !!csrfToken,
            },
            false
          );
          
          return new Response('CSRF token invalid', { status: 403 });
        }
      }

      // Input validation for request body
      if (config.validateInput && request.body) {
        try {
          const body = await request.json();
          
          // Check for XSS and SQL injection in string values
          const checkValue = (value: any): void => {
            if (typeof value === 'string') {
              if (InputSanitizer.detectXSS(value)) {
                throw new Error('Potential XSS detected');
              }
              if (InputSanitizer.detectSQLInjection(value)) {
                throw new Error('Potential SQL injection detected');
              }
            } else if (typeof value === 'object' && value !== null) {
              Object.values(value).forEach(checkValue);
            }
          };
          
          checkValue(body);
        } catch (error) {
          await auditLogger.logSecurityEvent(
            'suspicious_activity',
            {
              type: 'api',
              id: rateLimitKey,
              ip_address: request.ip,
              user_agent: request.headers.get('user-agent'),
            },
            'malicious_input_detected',
            {
              endpoint: request.url,
              method: request.method,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false
          );
          
          return new Response('Invalid input detected', { status: 400 });
        }
      }

      // Add security headers to response
      const response = new Response(null, { status: 200 });
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.rateLimit?.maxRequests?.toString() || '100');
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

      return response;
      
    } catch (error) {
      await auditLogger.logSecurityEvent(
        'api_error',
        {
          type: 'system',
          id: 'security-middleware',
        },
        'security_middleware_error',
        {
          endpoint: request.url,
          method: request.method,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now() - startTime,
        },
        false
      );
      
      return new Response('Internal security error', { status: 500 });
    }
  };
}

// Global rate limiters for different endpoint types
export const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
});

export const authRateLimiter = new RateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 5, // Stricter for auth endpoints
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 3600000, // 1 hour
  maxRequests: 10, // Very strict for uploads
});
