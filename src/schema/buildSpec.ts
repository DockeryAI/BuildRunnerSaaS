export interface LinkMap { 
  [k: string]: string; 
}

export interface Microstep {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  criteria: string[];
  links?: LinkMap;
  depends_on?: string[];
  owner?: string;
  effort_points?: number;
  impact_score?: number;
  priority?: "P1" | "P2" | "P3";
  risk_level?: "low" | "medium" | "high";
  risk_notes?: string;
  demo_script?: string[];
  rollback_plan?: string;
  post_check?: string;
}

export interface Step { 
  id: string; 
  title: string; 
  microsteps: Microstep[]; 
}

export interface Milestone { 
  id: string; 
  title: string; 
  steps: Step[]; 
}

export interface BuildSpec {
  projectId: string;
  title: string;
  version: string;
  updatedAt: string;
  milestones: Milestone[];
}
