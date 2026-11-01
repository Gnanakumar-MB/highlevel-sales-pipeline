export type StageId = 
  | 'new_lead' 
  | 'contacted' 
  | 'demo_done' 
  | 'proposal_sent' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export interface Stage {
  id: StageId;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  licenses: number;
  value: number; // in INR (₹)
  owner: string; // e.g. Gnanakumar, Rahul, Amit
  stage: StageId;
  createdAt: string;
  lastContactedAt: string;
  daysStale: number;
  tags: string[];
  
  // UI & Sync metadata
  syncStatus?: 'synced' | 'pending' | 'failed';
  lastModifiedBy?: string; // teammate name if modified externally
  isBuffered?: boolean;   // if updated by teammate while in viewport
}

export interface OptimisticMutation {
  dealId: string;
  previousStage: StageId;
  targetStage: StageId;
  timestamp: number;
  retryCount: number;
  error?: string;
}

export interface TeammateEvent {
  id: string;
  type: 'DEAL_MOVED' | 'DEAL_UPDATED' | 'DEAL_WON' | 'DEAL_LOST';
  dealId: string;
  teammateName: string;
  previousStage?: StageId;
  newStage: StageId;
  timestamp: number;
  dealSnapshot: Deal;
}

export interface SimulationConfig {
  latencyMinMs: number;
  latencyMaxMs: number;
  failureRate: number; // 0 to 1 (e.g. 0.1 for 10%)
  teammateIntervalSec: number;
  isTeammateActive: boolean;
  isOffline: boolean;
}

export interface FilterState {
  searchQuery: string;
  ownerFilter: string; // 'all' or specific owner
  quickFilter: 'all' | 'my_deals' | 'stale' | 'high_value' | 'closing_soon';
  stageFilter: StageId | 'all';
}
