export interface LinkMap { 
  [k: string]: string; 
}

export interface Microstep { 
  id: string; 
  title: string; 
  status: "todo" | "doing" | "done"; 
  criteria: string[]; 
  links?: LinkMap; 
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
