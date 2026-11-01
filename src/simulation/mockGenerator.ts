import { Deal, Stage, StageId } from '../types/pipeline';

export const PIPELINE_STAGES: Stage[] = [
  { id: 'new_lead', label: 'New Lead', color: '#6366f1', badgeBg: 'bg-indigo-500/10', badgeBorder: 'border-indigo-500/30' },
  { id: 'contacted', label: 'Contacted', color: '#0ea5e9', badgeBg: 'bg-sky-500/10', badgeBorder: 'border-sky-500/30' },
  { id: 'demo_done', label: 'Demo Done', color: '#06b6d4', badgeBg: 'bg-cyan-500/10', badgeBorder: 'border-cyan-500/30' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: '#f59e0b', badgeBg: 'bg-amber-500/10', badgeBorder: 'border-amber-500/30' },
  { id: 'negotiation', label: 'Negotiation', color: '#ec4899', badgeBg: 'bg-pink-500/10', badgeBorder: 'border-pink-500/30' },
  { id: 'won', label: 'Won', color: '#10b981', badgeBg: 'bg-emerald-500/10', badgeBorder: 'border-emerald-500/30' },
  { id: 'lost', label: 'Lost', color: '#ef4444', badgeBg: 'bg-rose-500/10', badgeBorder: 'border-rose-500/30' },
];

export const TEAM_MEMBERS = [
  'Gnanakumar (You)',
  'Rahul Sharma',
  'Amit Patel',
  'Sneha Rao',
  'Vikram Malhotra',
  'Ananya Iyer',
  'Rohan Mehta',
  'Pooja Verma',
  'Karthik Nair',
  'Divya Reddy',
  'Manoj Joshi',
  'Neha Gupta',
  'Arjun Kapoor',
  'Ritu Saxena',
  'Sanjay Kulkarni',
  'Meera Menon',
  'Deepak Chaudhary',
  'Sunita Biswas',
  'Rajesh Nambiar',
  'Kavita Deshmukh'
];

export const CURRENT_USER = 'Gnanakumar (You)';

const COMPANIES = [
  'Acme Corp', 'Tata Digital', 'Reliance Retail', 'Infosys Cloud', 'Flipkart Tech',
  'Zomato Enterprise', 'Swiggy Suite', 'Zepto Logistics', 'Paytm Core', 'Razorpay Labs',
  'CRED Network', 'Meesho Sellers', 'Delhivery Freight', 'Nykaa Brands', 'PhonePe Merchant',
  'Freshworks Hub', 'Postman Dev', 'BrowserStack Grid', 'Zerodha Capital', 'Lenskart Vision',
  'Urban Company Pro', 'Groww Fin', 'PolicyBazaar Insure', 'Cars24 Fleet', 'Spinny Auto',
  'Pine Labs POS', 'Chargebee Billing', 'CleverTap CRM', 'MoEngage AI', 'InMobi Ads'
];

const PRODUCT_LINES = [
  'Enterprise License', 'Platform Tier 1', 'Annual Subscription', 'API Volume Pack',
  'Cloud Migration', 'Security Suite', 'Support SLA Pro', 'Dedicated Instance'
];

const TAG_POOL = [
  'Enterprise', 'Urgent', 'Q4 Renewal', 'Upsell', 'High Value', 'Inbound Lead',
  'Decision Pending', 'Procurement Review', 'Champion Left', 'Competitor Threat'
];

/**
 * Fast generation of 50,000 realistic deals
 * Target distribution ensures ~10,000 deals in large stages as described in the prompt
 */
export function generateMockDeals(): {
  dealsById: Map<string, Deal>;
  stageDealIds: Record<StageId, string[]>;
} {
  const dealsById = new Map<string, Deal>();
  const stageDealIds: Record<StageId, string[]> = {
    new_lead: [],
    contacted: [],
    demo_done: [],
    proposal_sent: [],
    negotiation: [],
    won: [],
    lost: []
  };

  // Stage distribution quotas (summing to 50,000)
  // Reflects real CRM stages where early stages are fat (~10k-12k) and later stages taper
  const stageWeights: { stage: StageId; count: number }[] = [
    { stage: 'new_lead', count: 12000 },
    { stage: 'contacted', count: 10500 },
    { stage: 'demo_done', count: 8500 },
    { stage: 'proposal_sent', count: 6500 },
    { stage: 'negotiation', count: 5000 },
    { stage: 'won', count: 4000 },
    { stage: 'lost', count: 3500 },
  ];

  let idCounter = 1;
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (const { stage, count } of stageWeights) {
    for (let i = 0; i < count; i++) {
      const id = `DEAL-${idCounter.toString().padStart(6, '0')}`;
      const company = COMPANIES[(idCounter + i * 3) % COMPANIES.length];
      const product = PRODUCT_LINES[(idCounter + i) % PRODUCT_LINES.length];
      
      // Rep assignment: 25% chance of Gnanakumar (the user) so "My Deals" has ~12,500 deals to filter
      const owner = (idCounter % 4 === 0) 
        ? CURRENT_USER 
        : TEAM_MEMBERS[(idCounter + i) % TEAM_MEMBERS.length];

      const licenses = ((idCounter * 7) % 49 + 1) * 10; // 10 to 500 licenses
      // Value roughly ₹50,000 to ₹50,00,000
      const basePricePerLicense = 8000 + ((idCounter * 17) % 15000);
      const rawValue = licenses * basePricePerLicense;
      // Round to clean 10,000s
      const value = Math.round(rawValue / 10000) * 10000;

      // Stale calculation (days since last touch)
      const daysStale = (idCounter * 13 + i * 7) % 90;
      const lastContactedDate = new Date(now - daysStale * DAY_MS).toISOString();
      const createdDate = new Date(now - (daysStale + 15) * DAY_MS).toISOString();

      // Pick 1-2 tags
      const tagIndex = (idCounter + i) % TAG_POOL.length;
      const tags = [TAG_POOL[tagIndex]];
      if (value > 2000000) tags.push('High Value');
      if (daysStale > 30) tags.push('Stale');

      const deal: Deal = {
        id,
        title: `${company} - ${product}`,
        company,
        licenses,
        value,
        owner,
        stage,
        createdAt: createdDate,
        lastContactedAt: lastContactedDate,
        daysStale,
        tags,
        syncStatus: 'synced',
      };

      dealsById.set(id, deal);
      stageDealIds[stage].push(id);
      idCounter++;
    }
  }

  return { dealsById, stageDealIds };
}
