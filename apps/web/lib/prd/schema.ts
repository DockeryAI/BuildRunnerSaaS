import { z } from "zod";

// Comprehensive PRD Schema based on BuildRunner best practices
export const PRDSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    version: z.string().default("0.1"),
    status: z.enum(["Draft", "In Review", "Final"]).default("Draft"),
    owner: z.array(z.string()).nonempty(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(["P0", "P1", "P2", "P3"]).default("P2"),
    stakeholders: z.array(z.string()).default(["PM", "Eng", "Design", "GTM"]),
    links: z.object({
      design: z.array(z.string()).default([]),
      tickets: z.array(z.string()).default([]),
      research: z.array(z.string()).default([])
    }).default({})
  }),
  
  executive_summary: z.string().min(1),
  
  problem: z.object({
    user_pain: z.string(),
    evidence: z.object({
      qualitative: z.array(z.string()).default([]),
      quantitative: z.array(z.string()).default([])
    }).default({}),
    current_workaround: z.string().default(""),
    cost_of_doing_nothing: z.string().default(""),
    root_causes: z.array(z.string()).default([])
  }),
  
  audience: z.object({
    personas: z.array(z.object({
      name: z.string(),
      jtbd: z.string(), // Jobs to be Done
      environments: z.array(z.string()).default(["web"]),
      segments: z.array(z.string()).default(["SMB"])
    })),
    constraints: z.object({
      compliance: z.array(z.string()).default([]),
      regions: z.array(z.string()).default([])
    }).default({})
  }),
  
  value_prop: z.object({
    statement: z.string(),
    differentiators: z.array(z.string()).default([]),
    alternatives_considered: z.array(z.string()).default([]),
    strategic_alignment: z.array(z.string()).default([])
  }),
  
  objectives: z.array(z.object({
    objective: z.string(),
    kpi: z.string(),
    target: z.string(),
    source: z.string()
  })).default([]),
  
  scope: z.object({
    in_scope: z.array(z.string()).default([]),
    out_of_scope: z.array(z.string()).default([])
  }),
  
  features: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    user_story: z.string(),
    acceptance_criteria: z.array(z.string()).default([]),
    ux_notes: z.array(z.string()).default(["empty", "loading", "error"]),
    telemetry: z.object({
      events: z.array(z.object({
        name: z.string(),
        properties: z.array(z.string()).default(["user_id", "project_id"])
      })).default([])
    }).default({}),
    performance: z.object({
      p95_latency_ms: z.number().default(1500),
      max_payload_kb: z.number().default(256)
    }).default({}),
    plan_gate: z.enum(["free", "pro", "enterprise"]).default("free")
  })).default([]),
  
  non_functional: z.object({
    performance: z.object({
      slo: z.string().default("99.5% monthly"),
      rate_limits: z.object({
        rpm: z.number().default(60)
      }).default({})
    }).default({}),
    reliability: z.object({
      retries: z.string().default("exponential backoff"),
      idempotency: z.boolean().default(true)
    }).default({}),
    security: z.object({
      auth: z.string().default("JWT"),
      pii: z.string().default("encrypted_at_rest")
    }).default({}),
    compliance: z.array(z.string()).default([]),
    accessibility: z.object({
      wcag: z.string().default("2.1 AA")
    }).default({}),
    i18n: z.object({
      locales: z.array(z.string()).default(["en-US"])
    }).default({}),
    observability: z.object({
      logs: z.boolean().default(true),
      metrics: z.boolean().default(true),
      traces: z.boolean().default(true)
    }).default({})
  }).default({}),
  
  monetization: z.object({
    pricing_model: z.string().default("tiered"),
    meter_unit: z.string().default("projects"),
    plan_matrix: z.array(z.object({
      plan: z.string(),
      limits: z.record(z.any()).default({}),
      features: z.array(z.string()).default([])
    })).default([]),
    trial: z.object({
      days: z.number().default(14)
    }).default({}),
    billing_enforcement: z.string().default("server"),
    entitlements: z.array(z.object({
      feature_id: z.string(),
      min_plan: z.string()
    })).default([])
  }).default({}),
  
  dependencies: z.object({
    internal: z.array(z.string()).default([]),
    external: z.array(z.string()).default([]),
    feature_flags: z.array(z.string()).default([])
  }).default({}),
  
  risks: z.array(z.object({
    risk: z.string(),
    likelihood: z.enum(["Low", "Med", "High"]),
    impact: z.enum(["Low", "Med", "High"]),
    mitigation: z.string()
  })).default([]),
  
  analytics: z.object({
    north_star: z.string().default(""),
    guardrails: z.array(z.string()).default(["error_rate", "latency"]),
    events: z.array(z.object({
      name: z.string(),
      properties: z.array(z.string()).default(["user_id", "project_id", "ts"])
    })).default([]),
    experiments: z.array(z.object({
      name: z.string(),
      variant_allocation: z.record(z.number()).default({}),
      success_metric: z.string()
    })).default([])
  }).default({}),
  
  rollout: z.object({
    phases: z.array(z.object({
      name: z.string(),
      criteria: z.array(z.string()).default([])
    })).default([]),
    kill_switch: z.boolean().default(true),
    rollback_plan: z.string().default("")
  }).default({}),
  
  open_questions: z.array(z.object({
    question: z.string(),
    owner: z.string(),
    due: z.string()
  })).default([]),
  
  decisions: z.array(z.object({
    decision: z.string(),
    owner: z.string(),
    date: z.string(),
    context: z.string()
  })).default([]),
  
  appendix: z.object({
    research_refs: z.array(z.string()).default([]),
    artifacts: z.array(z.string()).default([])
  }).default({})
});

export type PRDDocument = z.infer<typeof PRDSchema>;

// Default PRD template
export const createDefaultPRD = (title: string = "", owner: string = "product@buildrunner.cloud"): PRDDocument => ({
  meta: {
    title,
    version: "0.1",
    status: "Draft",
    owner: [owner],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: "",
    priority: "P2",
    stakeholders: ["PM", "Eng", "Design", "GTM"],
    links: {
      design: [],
      tickets: [],
      research: []
    }
  },
  executive_summary: "",
  problem: {
    user_pain: "",
    evidence: {
      qualitative: [],
      quantitative: []
    },
    current_workaround: "",
    cost_of_doing_nothing: "",
    root_causes: []
  },
  audience: {
    personas: [],
    constraints: {
      compliance: [],
      regions: []
    }
  },
  value_prop: {
    statement: "",
    differentiators: [],
    alternatives_considered: [],
    strategic_alignment: []
  },
  objectives: [],
  scope: {
    in_scope: [],
    out_of_scope: []
  },
  features: [],
  non_functional: {
    performance: {
      slo: "99.5% monthly",
      rate_limits: { rpm: 60 }
    },
    reliability: {
      retries: "exponential backoff",
      idempotency: true
    },
    security: {
      auth: "JWT",
      pii: "encrypted_at_rest"
    },
    compliance: [],
    accessibility: {
      wcag: "2.1 AA"
    },
    i18n: {
      locales: ["en-US"]
    },
    observability: {
      logs: true,
      metrics: true,
      traces: true
    }
  },
  monetization: {
    pricing_model: "tiered",
    meter_unit: "projects",
    plan_matrix: [
      { plan: "Free", limits: { projects: 1 }, features: [] },
      { plan: "Pro", limits: { projects: 10 }, features: [] },
      { plan: "Enterprise", limits: { projects: "unlimited" }, features: [] }
    ],
    trial: { days: 14 },
    billing_enforcement: "server",
    entitlements: []
  },
  dependencies: {
    internal: [],
    external: [],
    feature_flags: []
  },
  risks: [],
  analytics: {
    north_star: "",
    guardrails: ["error_rate", "latency"],
    events: [],
    experiments: []
  },
  rollout: {
    phases: [
      { name: "Private Beta", criteria: [] },
      { name: "Public GA", criteria: [] }
    ],
    kill_switch: true,
    rollback_plan: ""
  },
  open_questions: [],
  decisions: [],
  appendix: {
    research_refs: [],
    artifacts: []
  }
});

// PRD Building Phases
export const PRD_PHASES = [
  {
    id: 1,
    name: "Context",
    description: "Define the problem and opportunity",
    sections: ["metadata", "executive_summary", "problem_statement", "target_audience", "value_proposition"]
  },
  {
    id: 2,
    name: "Shape",
    description: "Outline features and scope",
    sections: ["objectives", "scope", "features"]
  },
  {
    id: 3,
    name: "Evidence",
    description: "Add success criteria and analytics",
    sections: ["non_functional", "dependencies", "risks", "analytics"]
  },
  {
    id: 4,
    name: "Launch",
    description: "Business model and go-to-market",
    sections: ["monetization", "rollout", "open_questions"]
  }
];
