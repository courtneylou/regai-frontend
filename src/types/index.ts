export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface Scenario {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  stakeholders: Stakeholder[];
  category: string;
}

export interface Requirement {
  id: string;
  type: 'functional' | 'non-functional';
  description: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}