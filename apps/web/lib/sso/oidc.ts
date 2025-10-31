import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface OIDCConfig {
  id: string;
  orgId: string;
  name: string;
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  attributeMapping: {
    email: string;
    name: string;
    groups?: string;
  };
  autoProvision: boolean;
  defaultRole: string;
}

export interface OIDCUserInfo {
  sub: string;
  email: string;
  name?: string;
  groups?: string[];
  [key: string]: any;
}

export class OIDCProvider {
  private config: OIDCConfig;
  private discoveryDocument: any = null;

  constructor(config: OIDCConfig) {
    this.config = config;
  }

  /**
   * Get OIDC discovery document
   */
  async getDiscoveryDocument() {
    if (this.discoveryDocument) {
      return this.discoveryDocument;
    }

    try {
      const response = await fetch(this.config.issuer);
      if (!response.ok) {
        throw new Error(`Failed to fetch discovery document: ${response.statusText}`);
      }

      this.discoveryDocument = await response.json();
      return this.discoveryDocument;
    } catch (error) {
      console.error('Failed to fetch OIDC discovery document:', error);
      throw new Error('Invalid OIDC issuer configuration');
    }
  }

  /**
   * Generate authorization URL for OIDC login
   */
  async getAuthorizationUrl(redirectUri: string, state?: string): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
  }> {
    const discovery = await this.getDiscoveryDocument();
    
    // Generate PKCE parameters
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    
    // Generate state if not provided
    const authState = state || this.generateState();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: this.config.scopes.join(' '),
      state: authState,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return {
      url: `${discovery.authorization_endpoint}?${params.toString()}`,
      state: authState,
      codeVerifier,
    };
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    codeVerifier: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const discovery = await this.getDiscoveryDocument();

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(discovery.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokens = await response.json();

    return {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    };
  }

  /**
   * Get user info from OIDC provider
   */
  async getUserInfo(accessToken: string): Promise<OIDCUserInfo> {
    const discovery = await this.getDiscoveryDocument();

    const response = await fetch(discovery.userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userInfo = await response.json();

    // Map attributes according to configuration
    const mappedUser: OIDCUserInfo = {
      sub: userInfo.sub,
      email: userInfo[this.config.attributeMapping.email],
      name: userInfo[this.config.attributeMapping.name],
    };

    // Map groups if configured
    if (this.config.attributeMapping.groups) {
      const groups = userInfo[this.config.attributeMapping.groups];
      if (Array.isArray(groups)) {
        mappedUser.groups = groups;
      } else if (typeof groups === 'string') {
        mappedUser.groups = groups.split(',').map(g => g.trim());
      }
    }

    return mappedUser;
  }

  /**
   * Validate ID token (basic validation)
   */
  async validateIdToken(idToken: string): Promise<any> {
    // In production, this should include proper JWT validation
    // including signature verification, issuer validation, etc.
    try {
      const [header, payload, signature] = idToken.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString()
      );

      // Basic validations
      if (decodedPayload.iss !== this.config.issuer) {
        throw new Error('Invalid issuer');
      }

      if (decodedPayload.aud !== this.config.clientId) {
        throw new Error('Invalid audience');
      }

      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      console.error('ID token validation failed:', error);
      throw new Error('Invalid ID token');
    }
  }

  /**
   * Create or update user from OIDC info
   */
  async provisionUser(userInfo: OIDCUserInfo): Promise<{
    userId: string;
    isNewUser: boolean;
  }> {
    try {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userInfo.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: userInfo.name,
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;

        return {
          userId: existingUser.id,
          isNewUser: false,
        };
      } else if (this.config.autoProvision) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: userInfo.email,
            name: userInfo.name,
            auth_provider: 'oidc',
            auth_provider_id: userInfo.sub,
            email_verified: true, // Trust OIDC provider
            last_login_at: new Date().toISOString(),
          }])
          .select('id')
          .single();

        if (createError) throw createError;

        // Assign default role if specified
        if (this.config.defaultRole) {
          await this.assignDefaultRole(newUser.id);
        }

        return {
          userId: newUser.id,
          isNewUser: true,
        };
      } else {
        throw new Error('User not found and auto-provisioning is disabled');
      }
    } catch (error) {
      console.error('User provisioning failed:', error);
      throw new Error('Failed to provision user');
    }
  }

  /**
   * Assign default role to new user
   */
  private async assignDefaultRole(userId: string): Promise<void> {
    try {
      // This would integrate with the role system from Phase 10
      // For now, we'll just log the action
      await supabase
        .from('runner_events')
        .insert([{
          actor: 'system',
          action: 'user_auto_provisioned',
          payload: {
            user_id: userId,
            org_id: this.config.orgId,
            default_role: this.config.defaultRole,
            provider: 'oidc',
          },
          metadata: {
            provisioning_timestamp: new Date().toISOString(),
            idp_config_id: this.config.id,
          },
        }]);
    } catch (error) {
      console.error('Failed to assign default role:', error);
      // Don't throw here as user creation succeeded
    }
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Generate PKCE code challenge
   */
  private generateCodeChallenge(verifier: string): string {
    return createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  /**
   * Generate random state parameter
   */
  private generateState(): string {
    return randomBytes(16).toString('hex');
  }
}

/**
 * Load OIDC configuration from database
 */
export async function loadOIDCConfig(orgId: string, idpName?: string): Promise<OIDCConfig | null> {
  try {
    let query = supabase
      .from('org_idp')
      .select('*')
      .eq('org_id', orgId)
      .eq('type', 'oidc')
      .eq('enabled', true);

    if (idpName) {
      query = query.eq('name', idpName);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      orgId: data.org_id,
      name: data.name,
      issuer: data.oidc_issuer,
      clientId: data.oidc_client_id,
      clientSecret: data.oidc_client_secret_encrypted, // Would need decryption in production
      scopes: data.oidc_scopes || ['openid', 'email', 'profile'],
      attributeMapping: data.attribute_mapping || {
        email: 'email',
        name: 'name',
        groups: 'groups',
      },
      autoProvision: data.auto_provision,
      defaultRole: data.default_role,
    };
  } catch (error) {
    console.error('Failed to load OIDC config:', error);
    return null;
  }
}
