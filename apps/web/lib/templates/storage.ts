import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Template storage interfaces
export interface TemplateDef {
  id: string;
  slug: string;
  title: string;
  description?: string;
  json_spec: Record<string, any>;
  version: string;
  tags: string[];
  installs_count: number;
  author_id?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: string;
  json_spec: Record<string, any>;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface TemplatePack {
  id: string;
  slug: string;
  title: string;
  description?: string;
  json_patch: any[];
  tags: string[];
  installs_count: number;
  author_id?: string;
  is_public: boolean;
  is_featured: boolean;
  dependencies: string[];
  conflicts: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateAudit {
  id: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  payload: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Template Storage Service
 */
export class TemplateStorage {
  /**
   * Create a new template definition
   */
  static async createTemplate(template: Omit<TemplateDef, 'id' | 'created_at' | 'updated_at' | 'installs_count'>): Promise<TemplateDef> {
    const { data, error } = await supabase
      .from('template_defs')
      .insert([template])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    // Log audit event
    await this.logAudit({
      actor: template.author_id || 'system',
      action: 'template_created',
      resource_type: 'template',
      resource_id: data.id,
      payload: { slug: template.slug, title: template.title },
      metadata: { version: template.version },
    });

    return data;
  }

  /**
   * Get template by ID or slug
   */
  static async getTemplate(identifier: string): Promise<TemplateDef | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const { data, error } = await supabase
      .from('template_defs')
      .select('*')
      .eq(isUuid ? 'id' : 'slug', identifier)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get template: ${error.message}`);
    }

    return data;
  }

  /**
   * List templates with filters
   */
  static async listTemplates(options: {
    tags?: string[];
    featured?: boolean;
    public?: boolean;
    author_id?: string;
    limit?: number;
    offset?: number;
    sort?: 'created_at' | 'installs_count' | 'title';
    order?: 'asc' | 'desc';
  } = {}): Promise<{ templates: TemplateDef[]; total: number }> {
    let query = supabase.from('template_defs').select('*', { count: 'exact' });

    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags);
    }

    if (options.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    if (options.public !== undefined) {
      query = query.eq('is_public', options.public);
    }

    if (options.author_id) {
      query = query.eq('author_id', options.author_id);
    }

    // Sorting
    const sort = options.sort || 'created_at';
    const order = options.order || 'desc';
    query = query.order(sort, { ascending: order === 'asc' });

    // Pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list templates: ${error.message}`);
    }

    return { templates: data || [], total: count || 0 };
  }

  /**
   * Update template
   */
  static async updateTemplate(id: string, updates: Partial<TemplateDef>): Promise<TemplateDef> {
    const { data, error } = await supabase
      .from('template_defs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }

    // Log audit event
    await this.logAudit({
      actor: updates.author_id || 'system',
      action: 'template_updated',
      resource_type: 'template',
      resource_id: id,
      payload: updates,
      metadata: {},
    });

    return data;
  }

  /**
   * Delete template
   */
  static async deleteTemplate(id: string, actor: string): Promise<void> {
    const { error } = await supabase
      .from('template_defs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }

    // Log audit event
    await this.logAudit({
      actor,
      action: 'template_deleted',
      resource_type: 'template',
      resource_id: id,
      payload: {},
      metadata: {},
    });
  }

  /**
   * Create template version
   */
  static async createVersion(version: Omit<TemplateVersion, 'id' | 'created_at'>): Promise<TemplateVersion> {
    const { data, error } = await supabase
      .from('template_versions')
      .insert([version])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create version: ${error.message}`);
    }

    // Log audit event
    await this.logAudit({
      actor: version.created_by || 'system',
      action: 'version_created',
      resource_type: 'version',
      resource_id: data.id,
      payload: { template_id: version.template_id, version: version.version },
      metadata: {},
    });

    return data;
  }

  /**
   * Get template versions
   */
  static async getVersions(templateId: string): Promise<TemplateVersion[]> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get versions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create template pack
   */
  static async createPack(pack: Omit<TemplatePack, 'id' | 'created_at' | 'updated_at' | 'installs_count'>): Promise<TemplatePack> {
    const { data, error } = await supabase
      .from('template_packs')
      .insert([pack])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pack: ${error.message}`);
    }

    // Log audit event
    await this.logAudit({
      actor: pack.author_id || 'system',
      action: 'pack_created',
      resource_type: 'pack',
      resource_id: data.id,
      payload: { slug: pack.slug, title: pack.title },
      metadata: {},
    });

    return data;
  }

  /**
   * Get pack by ID or slug
   */
  static async getPack(identifier: string): Promise<TemplatePack | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const { data, error } = await supabase
      .from('template_packs')
      .select('*')
      .eq(isUuid ? 'id' : 'slug', identifier)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get pack: ${error.message}`);
    }

    return data;
  }

  /**
   * List packs with filters
   */
  static async listPacks(options: {
    tags?: string[];
    featured?: boolean;
    public?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ packs: TemplatePack[]; total: number }> {
    let query = supabase.from('template_packs').select('*', { count: 'exact' });

    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags);
    }

    if (options.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }

    if (options.public !== undefined) {
      query = query.eq('is_public', options.public);
    }

    query = query.order('installs_count', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list packs: ${error.message}`);
    }

    return { packs: data || [], total: count || 0 };
  }

  /**
   * Increment install count
   */
  static async incrementInstalls(type: 'template' | 'pack', id: string, actor: string): Promise<void> {
    const table = type === 'template' ? 'template_defs' : 'template_packs';
    
    const { error } = await supabase
      .from(table)
      .update({ 
        installs_count: supabase.raw('installs_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to increment installs: ${error.message}`);
    }

    // Log audit event
    await this.logAudit({
      actor,
      action: type === 'template' ? 'template_installed' : 'pack_installed',
      resource_type: type,
      resource_id: id,
      payload: {},
      metadata: {},
    });
  }

  /**
   * Log audit event
   */
  static async logAudit(audit: Omit<TemplateAudit, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('template_audit')
      .insert([audit]);

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Get audit trail
   */
  static async getAuditTrail(options: {
    resource_type?: string;
    resource_id?: string;
    actor?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<TemplateAudit[]> {
    let query = supabase.from('template_audit').select('*');

    if (options.resource_type) {
      query = query.eq('resource_type', options.resource_type);
    }

    if (options.resource_id) {
      query = query.eq('resource_id', options.resource_id);
    }

    if (options.actor) {
      query = query.eq('actor', options.actor);
    }

    query = query.order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get audit trail: ${error.message}`);
    }

    return data || [];
  }
}
