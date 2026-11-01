import { Deal, SimulationConfig, StageId, TeammateEvent } from '../types/pipeline';
import { generateMockDeals, PIPELINE_STAGES, TEAM_MEMBERS, CURRENT_USER } from './mockGenerator';

class MockPipelineApiService {
  private masterDb: Map<string, Deal>;
  private config: SimulationConfig = {
    latencyMinMs: 300,
    latencyMaxMs: 1500,
    failureRate: 0.10, // ~1 in 10 fail as per requirement
    teammateIntervalSec: 6,
    isTeammateActive: true,
    isOffline: false,
  };

  private listeners: Set<(event: TeammateEvent) => void> = new Set();
  private teammateTimer: number | null = null;

  constructor() {
    const { dealsById } = generateMockDeals();
    this.masterDb = dealsById;
    this.startTeammateSimulation();
  }

  public getConfig(): SimulationConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SimulationConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.isTeammateActive !== undefined || newConfig.teammateIntervalSec !== undefined) {
      this.restartTeammateSimulation();
    }
  }

  public getInitialDeals(): {
    dealsById: Map<string, Deal>;
    stageDealIds: Record<StageId, string[]>;
  } {
    // Clone initial dataset
    const stageDealIds: Record<StageId, string[]> = {
      new_lead: [],
      contacted: [],
      demo_done: [],
      proposal_sent: [],
      negotiation: [],
      won: [],
      lost: []
    };

    const dealsById = new Map<string, Deal>();
    for (const [id, deal] of this.masterDb.entries()) {
      const clonedDeal = { ...deal };
      dealsById.set(id, clonedDeal);
      stageDealIds[deal.stage].push(id);
    }

    return { dealsById, stageDealIds };
  }

  /**
   * Simulates an async network save for moving or updating a single deal
   */
  public async updateDeal(dealId: string, updates: Partial<Deal>): Promise<Deal> {
    if (this.config.isOffline) {
      throw new Error('Network Error: You are currently offline. Changes queued.');
    }

    // Randomized delay between min and max (0.3s - 1.5s default)
    const delay = Math.floor(
      this.config.latencyMinMs + Math.random() * (this.config.latencyMaxMs - this.config.latencyMinMs)
    );
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulated 10% failure rate
    if (Math.random() < this.config.failureRate) {
      throw new Error(`500 Save Error: Connection timeout or concurrent edit lock on ${dealId}.`);
    }

    const existing = this.masterDb.get(dealId);
    if (!existing) {
      throw new Error(`404 Not Found: Deal ${dealId} does not exist in backend database.`);
    }

    const updatedDeal: Deal = {
      ...existing,
      ...updates,
      syncStatus: 'synced',
    };

    this.masterDb.set(dealId, updatedDeal);
    return updatedDeal;
  }

  /**
   * Simulates bulk moving deals (e.g. quarter-end move 3,000 deals to Lost)
   */
  public async bulkUpdateStage(
    dealIds: string[],
    targetStage: StageId
  ): Promise<{ updatedCount: number; failedIds?: string[] }> {
    if (this.config.isOffline) {
      throw new Error('Network Error: Cannot execute bulk operation while offline.');
    }

    // Delay scales slightly with batch size, but capped at 1.8s
    const baseDelay = this.config.latencyMinMs + 400;
    const delay = Math.min(baseDelay + Math.floor(dealIds.length * 0.1), 1800);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Bulk failure simulation (if triggered, some fail or all fail)
    if (Math.random() < this.config.failureRate) {
      throw new Error(`Bulk Update Failed: Database transaction rolled back for ${dealIds.length} deals.`);
    }

    let count = 0;
    for (const id of dealIds) {
      const deal = this.masterDb.get(id);
      if (deal) {
        deal.stage = targetStage;
        deal.syncStatus = 'synced';
        count++;
      }
    }

    return { updatedCount: count };
  }

  /**
   * Real-time Teammates Simulation (WebSocket / Event Stream simulation)
   */
  public subscribeToTeammateEvents(listener: (event: TeammateEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcastEvent(event: TeammateEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in teammate event listener:', err);
      }
    });
  }

  private startTeammateSimulation() {
    if (!this.config.isTeammateActive || typeof window === 'undefined') return;

    this.teammateTimer = window.setInterval(() => {
      this.generateRandomTeammateMutation();
    }, this.config.teammateIntervalSec * 1000);
  }

  private stopTeammateSimulation() {
    if (this.teammateTimer !== null) {
      clearInterval(this.teammateTimer);
      this.teammateTimer = null;
    }
  }

  private restartTeammateSimulation() {
    this.stopTeammateSimulation();
    this.startTeammateSimulation();
  }

  /**
   * Generates a realistic random mutation from a teammate
   */
  public generateRandomTeammateMutation(targetDealId?: string): TeammateEvent | null {
    if (this.masterDb.size === 0) return null;

    let deal: Deal | undefined;

    if (targetDealId) {
      deal = this.masterDb.get(targetDealId);
    } else {
      // Pick a random deal from the 50,000 deals
      const randomIndex = Math.floor(Math.random() * this.masterDb.size);
      const keys = Array.from(this.masterDb.keys());
      deal = this.masterDb.get(keys[randomIndex]);
    }

    if (!deal) return null;

    // Pick a teammate who isn't the current user
    const otherMembers = TEAM_MEMBERS.filter((m) => m !== CURRENT_USER);
    const teammateName = otherMembers[Math.floor(Math.random() * otherMembers.length)];

    const previousStage = deal.stage;
    // Choose a different stage
    const otherStages = PIPELINE_STAGES.map((s) => s.id).filter((s) => s !== previousStage);
    const newStage = otherStages[Math.floor(Math.random() * otherStages.length)];

    // Mutate master DB
    deal.stage = newStage;
    deal.lastModifiedBy = teammateName;

    const event: TeammateEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: newStage === 'won' ? 'DEAL_WON' : newStage === 'lost' ? 'DEAL_LOST' : 'DEAL_MOVED',
      dealId: deal.id,
      teammateName,
      previousStage,
      newStage,
      timestamp: Date.now(),
      dealSnapshot: { ...deal },
    };

    this.broadcastEvent(event);
    return event;
  }
}

// Export singleton instance
export const mockBackendApi = new MockPipelineApiService();
