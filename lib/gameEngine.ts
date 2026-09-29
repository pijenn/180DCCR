import type { Participant, SubRoundConfig, Question, GameState, Round1Phase } from "./types.ts";

export const ROUND_1_SUBROUNDS: SubRoundConfig[] = [
  { id: 1, name: "BUSINESS ANALYST", points: 20, questionCount: 3 },
  { id: 2, name: "ASSOCIATE CONSULTANT", points: 30, questionCount: 3 },
  { id: 3, name: "CONSULTANT", points: 45, questionCount: 3 },
  { id: 4, name: "SENIOR CONSULTANT", points: 65, questionCount: 3 },
  { id: 5, name: "MANAGER", points: 90, questionCount: 3 },
  { id: 6, name: "PRINCIPAL", points: 120, questionCount: 3 },
  { id: 7, name: "CRISIS ROUND", points: 130, questionCount: 1 },
  { id: 8, name: "PARTNER", points: 170, questionCount: 3 },
];

export const GOLDEN_TICKET_NAMES = [
  "Rifqi Syarifuddin Yasykur",
  "Cyka Srihana Humaera",
  "Ahmad Reva Dany Fawwaz",
];

export function isGoldenTicket(p?: Participant | null): boolean {
  if (!p) return false;
  return Boolean(
    p.isGoldenTicket ||
    p.golden_ticket ||
    (p as any).golden_pass ||
    p.status === "golden_ticket" ||
    GOLDEN_TICKET_NAMES.includes(p.name)
  );
}

export const PARTICIPANT_PHOTO_MATCHERS = [
  { match: ["theresia", "rosma"], file: "2_Theresia Rosma Exaudi.jpg.jpeg" },
  { match: ["abdullah", "shamil"], file: "Abdullah Shamil Basayev.webp" },
  { match: ["achmad", "muchtarom", "achsan"], file: "Achmad Muchtarom Achsan.jpg" },
  { match: ["ahmad", "reva"], file: "Ahmad Reva.jpeg" },
  { match: ["alvyan"], file: "Alvyan Ananta Asis.jpg" },
  { match: ["ngurah", "anak agung"], file: "Anak Agung Ngurah.jpeg" },
  { match: ["cyka"], file: "Cyka Humaera.JPG" },
  { match: ["diva"], file: "Diva Salsabilla.jpeg" },
  { match: ["fachri"], file: "Fachri Fabian.jpeg" },
  { match: ["faris", "audah", "khalilullah", "faiz"], file: "Faris Audah.jpeg" },
  { match: ["hanindita", "hanandita"], file: "Hanandita Fernanda Elsharini.JPG" },
  { match: ["hilmi"], file: "Hilmi Hidayat.webp" },
  { match: ["ihsan"], file: "Ihsan Dianta.jpeg" },
  { match: ["jesslyn"], file: "Jesslyn Callista.jpeg" },
  { match: ["kelvin"], file: "Kelvin William.jpeg" },
  { match: ["fikri", "ali fikri"], file: "Mohammad Ali Fikri.png" },
  { match: ["yafis"], file: "Muchamad Yafis (1).png" },
  { match: ["fajar"], file: "Muhammad Fajar.jpeg" },
  { match: ["nafi"], file: "Nafi Satul.webp" },
  { match: ["naufal"], file: "Naufal Arya.jpeg" },
  { match: ["nindya", "nindiya"], file: "Nindiya Aliyah.jpg" },
  { match: ["rachelle"], file: "Rachelle H.jpeg" },
  { match: ["rexelnino"], file: "Rexelnino.jpg" },
  { match: ["rifqi"], file: "Rifqi Syarifuddin (1).png" },
  { match: ["sharlyf"], file: "Sharlyf Shaquille Syani.jpg" },
  { match: ["surya", "sura"], file: "Sura Rahmat Fatahillah (1).png" }
];

export function getParticipantPhoto(name?: string | null): string {
  if (!name) return "/participants/default-avatar.svg";
  const lower = name.toLowerCase().trim();
  for (const entry of PARTICIPANT_PHOTO_MATCHERS) {
    if (entry.match.some((m) => lower.includes(m))) {
      return `/participants/${entry.file}`;
    }
  }
  return "/participants/default-avatar.svg";
}

export function getParticipantPhotoPosition(name?: string | null): string {
  if (!name) return "center 20%";
  const lower = name.toLowerCase().trim();
  // Specifically adjust position for participants whose heads get cut off if centered too low
  if (
    lower.includes("abdullah") ||
    lower.includes("shamil") ||
    lower.includes("achmad") ||
    lower.includes("muchtarom") ||
    lower.includes("sharlyf") ||
    lower.includes("shaquille") ||
    lower.includes("rexelino") ||
    lower.includes("rexelnino") ||
    lower.includes("theresia") ||
    lower.includes("rosma")
  ) {
    return "center 5%"; // Focus near the very top to preserve full head & hair
  }
  return "center 20%";
}

export const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "p-01", name: "Rifqi Syarifuddin Yasykur", university: "Institut Teknologi Sepuluh Nopember", avatar: getParticipantPhoto("Rifqi Syarifuddin Yasykur"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", isGoldenTicket: true, golden_ticket: true, status: "golden_ticket" },
  { id: "p-02", name: "Mohammad Ali Fikri", university: "Universitas Malang", avatar: getParticipantPhoto("Mohammad Ali Fikri"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-03", name: "Cyka Srihana Humaera", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Cyka Srihana Humaera"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", isGoldenTicket: true, golden_ticket: true, status: "golden_ticket" },
  { id: "p-04", name: "Alvyan Ananta Asis", university: "Universitas Airlangga", avatar: getParticipantPhoto("Alvyan Ananta Asis"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-05", name: "Mohammad Hilmi Hidayatullah", university: "Institut Teknologi Sepuluh Nopember", avatar: getParticipantPhoto("Mohammad Hilmi Hidayatullah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-06", name: "Diva Salsabilla", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Diva Salsabilla"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-07", name: "Muchamad Yafis", university: "Universitas Malang", avatar: getParticipantPhoto("Muchamad Yafis"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-08", name: "Fachri Fabian", university: "Universitas Pembangunan Nasional “Veteran” Jawa Timur", avatar: getParticipantPhoto("Fachri Fabian"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-09", name: "Nafi Satul Fuadhah", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Nafi Satul Fuadhah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-10", name: "Ngurah Oka", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Ngurah Oka"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-11", name: "Rachelle Hasiane", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Rachelle Hasiane"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-12", name: "Ihsan Dianta", university: "Institut Teknologi Sepuluh Nopember", avatar: getParticipantPhoto("Ihsan Dianta"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-13", name: "Ahmad Reva Dany Fawwaz", university: "UNAIR", avatar: getParticipantPhoto("Ahmad Reva Dany Fawwaz"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", isGoldenTicket: true, golden_ticket: true, status: "golden_ticket" },
  { id: "p-14", name: "M. Fajar Akbar Nugeraha", university: "Universitas Brawijaya", avatar: getParticipantPhoto("M. Fajar Akbar Nugeraha"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-15", name: "Surya Rahmat Fatahillah", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Surya Rahmat Fatahillah"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-16", name: "Naufal Aryasatya", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Naufal Aryasatya"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-17", name: "Theresia Rosma Exaudi", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Theresia Rosma Exaudi"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-18", name: "Abdullah Shamil Basayev", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Abdullah Shamil Basayev"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-19", name: "Jesslyn Callista", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Jesslyn Callista"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-20", name: "Nindya Aliyah Maulidina", university: "Universitas Pembangunan Nasional “Veteran” Jawa Timur", avatar: getParticipantPhoto("Nindya Aliyah Maulidina"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-21", name: "Sharlyf Shaquille Syani", university: "Politeknik Negeri Malang", avatar: getParticipantPhoto("Sharlyf Shaquille Syani"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-22", name: "Rexelnino Rajendra", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Rexelnino Rajendra"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-23", name: "Hanindita Fernanda Elsharini", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Hanindita Fernanda Elsharini"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-24", name: "Kelvin William", university: "Universitas Ciputra", avatar: getParticipantPhoto("Kelvin William"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-25", name: "Achmad Muchtarom Achsany", university: "Universitas Brawijaya", avatar: getParticipantPhoto("Achmad Muchtarom Achsany"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
  { id: "p-26", name: "Khalilullah Al-Faiz", university: "180 Degrees Consulting UB", avatar: getParticipantPhoto("Khalilullah Al-Faiz"), score: 0, point_gauntlet: 0, point_rootmaster: 0, round2Status: "pending", status: "active" },
];

export function getSubRoundPointValue(subRoundIdx: number): number {
  if (subRoundIdx >= 0 && subRoundIdx < ROUND_1_SUBROUNDS.length) {
    return ROUND_1_SUBROUNDS[subRoundIdx].points;
  }
  return 0;
}

export function calculateLeaderboard(participants: Participant[]): (Participant & { rank: number })[] {
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

export function validateRound2Answer(input: string | number, target: number = 1467): boolean {
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!/^\d+$/.test(trimmed)) return false;
    return parseInt(trimmed, 10) === target;
  }
  return input === target;
}

/**
 * Format milliseconds into MM:SS for precision display (e.g. 29:59 = 29s and 59 cs)
 * For 30s timers: seconds : hundredths of a second (millisecond display requested: 29:59)
 */
export function formatTimerDisplay(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  const secStr = String(totalSeconds).padStart(2, "0");
  const msStr = String(hundredths).padStart(2, "0");
  return `${secStr}:${msStr}`;
}

/**
 * Format milliseconds into Minutes:Second:MilSec (Rootmaster countdown e.g. 05:00:00)
 */
export function formatPrecisionCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const minStr = String(mins).padStart(2, "0");
  const secStr = String(secs).padStart(2, "0");
  const msStr = String(hundredths).padStart(2, "0");

  return `${minStr}:${secStr}:${msStr}`;
}

// Sample Consulting Questions for Round 1
export const SAMPLE_QUESTIONS: Question[] = [
  // Sub-round 1: BUSINESS ANALYST (3 questions)
  {
    id: "q-1-1",
    roundId: 1,
    subRoundId: 1,
    questionNumber: 1,
    prompt: "In market sizing, what formula calculates the Total Addressable Market (TAM) for a retail coffee chain expanding to East Java?",
    options: [
      { key: "A", text: "Population × Coffee Drinker % × Annual Consumption Frequency × Avg Price" },
      { key: "B", text: "Total Revenue of Top 3 Competitors ÷ Market Share Multiplier" },
      { key: "C", text: "Total Store CapEx + OpEx × Expected Operating Margin" },
      { key: "D", text: "Working Population × High Income Household Ratio" },
      { key: "E", text: "Net Profit Margin × Customer Lifetime Value (CLV)" },
      { key: "F", text: "Daily foot traffic × Conversion Rate × Inflation Index" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-1-2",
    roundId: 1,
    subRoundId: 1,
    questionNumber: 2,
    prompt: "A client's EBITDA increased by 15% while Net Profit dropped by 10%. Which driver is the most probable root cause?",
    options: [
      { key: "A", text: "Higher Gross Profit Margin" },
      { key: "B", text: "Significant increase in Debt Interest Expenses or Tax liability" },
      { key: "C", text: "Reduction in Selling, General and Administrative expenses (SG&A)" },
      { key: "D", text: "Lower Cost of Goods Sold (COGS)" },
      { key: "E", text: "Increased operating cash flows from receivables" },
      { key: "F", text: "Expansion of domestic retail distribution network" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-1-3",
    roundId: 1,
    subRoundId: 1,
    questionNumber: 3,
    prompt: "Which consulting framework is most appropriate to evaluate external macro-environmental shocks affecting a social enterprise?",
    options: [
      { key: "A", text: "Ansoff Matrix" },
      { key: "B", text: "Porter's Five Forces" },
      { key: "C", text: "PESTLE Analysis" },
      { key: "D", text: "BCG Growth-Share Matrix" },
      { key: "E", text: "McKinsey 7S Framework" },
      { key: "F", text: "Value Chain Analysis" },
    ],
    correctAnswer: "C",
  },
  // Sub-round 2: ASSOCIATE CONSULTANT (3 questions)
  {
    id: "q-2-1",
    roundId: 1,
    subRoundId: 2,
    questionNumber: 1,
    prompt: "A client wants to optimize Unit Economics. CAC is $40, ARPU is $15/mo, and Monthly Churn is 5%. What is the LTV to CAC ratio?",
    options: [
      { key: "A", text: "3.5x" },
      { key: "B", text: "5.0x" },
      { key: "C", text: "7.5x ($300 LTV ÷ $40 CAC)" },
      { key: "D", text: "1.2x" },
      { key: "E", text: "10.0x" },
      { key: "F", text: "2.4x" },
    ],
    correctAnswer: "C",
  },
  {
    id: "q-2-2",
    roundId: 1,
    subRoundId: 2,
    questionNumber: 2,
    prompt: "When applying the MECE principle to breakdown cost reduction opportunities, what does MECE guarantee?",
    options: [
      { key: "A", text: "Mutually Exclusive, Collectively Exhaustive problem structuring" },
      { key: "B", text: "Maximum Efficiency, Cost Elimination" },
      { key: "C", text: "Market Equilibrium & Competitive Elasticity" },
      { key: "D", text: "Management Executive Consultation Excellence" },
      { key: "E", text: "Measurement of Enterprise Cashflow Efficiency" },
      { key: "F", text: "Monetary Evaluation of Client Engagements" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-2-3",
    roundId: 1,
    subRoundId: 2,
    questionNumber: 3,
    prompt: "In a pricing strategy engagement, which strategy prices a new disruptive product high initially then lowers it over time?",
    options: [
      { key: "A", text: "Penetration Pricing" },
      { key: "B", text: "Price Skimming" },
      { key: "C", text: "Freemium Tiering" },
      { key: "D", text: "Cost-Plus Markup" },
      { key: "E", text: "Dynamic Yield Management" },
      { key: "F", text: "Loss-Leader Strategy" },
    ],
    correctAnswer: "B",
  },
  // Sub-round 3: CONSULTANT (3 questions)
  {
    id: "q-3-1",
    roundId: 1,
    subRoundId: 3,
    questionNumber: 1,
    prompt: "During a commercial due diligence, target company has 80% market share in a market contracting at 12% CAGR. Where does it sit in BCG Matrix?",
    options: [
      { key: "A", text: "Star" },
      { key: "B", text: "Cash Cow with declining cash generation" },
      { key: "C", text: "Question Mark" },
      { key: "D", text: "Dog" },
      { key: "E", text: "Venture Accelerator" },
      { key: "F", text: "Core Strategic Incubator" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-3-2",
    roundId: 1,
    subRoundId: 3,
    questionNumber: 2,
    prompt: "If a logistics company has High Fixed Costs and Low Variable Costs, what is true regarding its Operating Leverage?",
    options: [
      { key: "A", text: "Low operating leverage; profit is insensitive to sales volume" },
      { key: "B", text: "High operating leverage; small percentage change in revenue causes large swing in EBIT" },
      { key: "C", text: "Zero financial leverage due to asset depreciation" },
      { key: "D", text: "Constant variable margin irrespective of route capacity" },
      { key: "E", text: "Linear correlation between SG&A and driver wages" },
      { key: "F", text: "High break-even price with instant variable coverage" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-3-3",
    roundId: 1,
    subRoundId: 3,
    questionNumber: 3,
    prompt: "Which quantitative method best isolates the specific impact of a revised packaging initiative from broader seasonal demand shifts?",
    options: [
      { key: "A", text: "Difference-in-Differences (DiD) quasi-experimental regression" },
      { key: "B", text: "Simple 3-month moving average trendline" },
      { key: "C", text: "SWOT matrix scoring" },
      { key: "D", text: "Unweighted consumer focus group polling" },
      { key: "E", text: "Historical Monte Carlo simulation with constant beta" },
      { key: "F", text: "Price elasticity midpoint formula" },
    ],
    correctAnswer: "A",
  },
  // Sub-round 4: SENIOR CONSULTANT (3 questions)
  {
    id: "q-4-1",
    roundId: 1,
    subRoundId: 4,
    questionNumber: 1,
    prompt: "A PE firm evaluates an LBO with $100M Enterprise Value, 60% Debt financed at 8% interest. If year 1 EBITDA is $25M, what is Debt/EBITDA ratio at close?",
    options: [
      { key: "A", text: "2.4x ($60M Debt ÷ $25M EBITDA)" },
      { key: "B", text: "4.0x" },
      { key: "C", text: "1.5x" },
      { key: "D", text: "5.2x" },
      { key: "E", text: "3.1x" },
      { key: "F", text: "0.8x" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-4-2",
    roundId: 1,
    subRoundId: 4,
    questionNumber: 2,
    prompt: "In a Post-Merger Integration (PMI), what category of synergies typically delivers faster realization with lower organizational disruption?",
    options: [
      { key: "A", text: "Cross-selling revenue synergies in newly integrated international markets" },
      { key: "B", text: "Procurement and operational cost synergies (SG&A consolidation, vendor renegotiation)" },
      { key: "C", text: "R&D co-development of next-generation product suites" },
      { key: "D", text: "Corporate culture synchronization and joint branding campaigns" },
      { key: "E", text: "Joint venture spin-offs to private equity partners" },
      { key: "F", text: "Complex ERP system migration and database unifications" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-4-3",
    roundId: 1,
    subRoundId: 4,
    questionNumber: 3,
    prompt: "Under the McKinsey 7S framework, which 3 elements constitute the 'Hard S' factors that are easiest to identify and directly influence?",
    options: [
      { key: "A", text: "Strategy, Structure, Systems" },
      { key: "B", text: "Shared Values, Skills, Staff" },
      { key: "C", text: "Style, Strategy, Synergy" },
      { key: "D", text: "Sales, Sourcing, Supply" },
      { key: "E", text: "Scope, Speed, Scale" },
      { key: "F", text: "Standards, Stakeholders, Sustainability" },
    ],
    correctAnswer: "A",
  },
  // Sub-round 5: MANAGER (3 questions)
  {
    id: "q-5-1",
    roundId: 1,
    subRoundId: 5,
    questionNumber: 1,
    prompt: "A client faces a classic 'Make vs Buy' decision. Fixed cost to Make is $500,000, variable cost is $20/unit. Buy price is $45/unit. What is the break-even volume?",
    options: [
      { key: "A", text: "15,000 units" },
      { key: "B", text: "20,000 units ($500k ÷ ($45 - $20))" },
      { key: "C", text: "25,000 units" },
      { key: "D", text: "12,500 units" },
      { key: "E", text: "30,000 units" },
      { key: "F", text: "18,200 units" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-5-2",
    roundId: 1,
    subRoundId: 5,
    questionNumber: 2,
    prompt: "When designing an incentive alignment structure for executive turnaround leadership, which compensation mechanism best prevents moral hazard?",
    options: [
      { key: "A", text: "Unrestricted upfront cash signing bonus" },
      { key: "B", text: "Long-term performance-vested stock options with clawback provisions tied to audited ROIC" },
      { key: "C", text: "Guaranteed annual severance package exceeding 36 months" },
      { key: "D", text: "Quarterly spot awards indexed strictly to top-line gross revenue" },
      { key: "E", text: "Discretionary board bonus without quantitative KPI gates" },
      { key: "F", text: "Fixed salary increases pegged to national inflation benchmarks" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-5-3",
    roundId: 1,
    subRoundId: 5,
    questionNumber: 3,
    prompt: "In managing a client steering committee with conflicting C-suite agendas, which stakeholder management tactic represents best practice?",
    options: [
      { key: "A", text: "Pre-wiring consensus via bilateral 1-on-1 syndication meetings prior to the formal steerco" },
      { key: "B", text: "Surprising dissenting executives during the live meeting to force public commitment" },
      { key: "C", text: "Excluding the Chief Financial Officer from early financial scenario models" },
      { key: "D", text: "Relying exclusively on email status memos rather than interactive working sessions" },
      { key: "E", text: "Changing project scope milestones unilaterally without formal change request" },
      { key: "F", text: "Presenting only the consensus option without showing trade-off alternatives" },
    ],
    correctAnswer: "A",
  },
  // Sub-round 6: PRINCIPAL (3 questions)
  {
    id: "q-6-1",
    roundId: 1,
    subRoundId: 6,
    questionNumber: 1,
    prompt: "A conglomerate client seeks to unlock shareholder value. Conglomerate discount is 28%, trading at 6x EBITDA vs pure-play peers at 11x EBITDA. What strategic transaction directly eliminates the discount?",
    options: [
      { key: "A", text: "Tax-free Spin-off / Carve-out IPO of the high-growth business unit" },
      { key: "B", text: "Acquisition of another low-margin unrelated subsidiary" },
      { key: "C", text: "Debt refinancing to increase balance sheet leverage" },
      { key: "D", text: "Reduction in common dividend payout without reinvestment plan" },
      { key: "E", text: "Minority stake share repurchase via secondary market auction" },
      { key: "F", text: "Consolidation of brand logos into a single unified umbrella" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-6-2",
    roundId: 1,
    subRoundId: 6,
    questionNumber: 2,
    prompt: "In valuation, when discounting Free Cash Flow to Firm (FCFF), what is the theoretically sound discount rate that reflects optimal capital structure?",
    options: [
      { key: "A", text: "Cost of Equity (Ke) via CAPM alone" },
      { key: "B", text: "Weighted Average Cost of Capital (WACC) using market values of debt and equity" },
      { key: "C", text: "Risk-Free Treasury yield plus prevailing consumer inflation rate" },
      { key: "D", text: "Historical book value return on capital employed (ROCE)" },
      { key: "E", text: "Pre-tax yield to maturity of highest rated corporate debt tranche" },
      { key: "F", text: "Internal Rate of Return (IRR) of company's previous fiscal year capex" },
    ],
    correctAnswer: "B",
  },
  {
    id: "q-6-3",
    roundId: 1,
    subRoundId: 6,
    questionNumber: 3,
    prompt: "A partner asks you to negotiate the scope of a commercial turnaround engagement. Which fee structure best aligns consulting incentives with tangible client results?",
    options: [
      { key: "A", text: "Pure time-and-materials hourly billing without caps" },
      { key: "B", text: "Base retainer fee combined with a structured success fee tied to verified bottom-line savings" },
      { key: "C", text: "100% upfront fixed fee with zero performance accountability" },
      { key: "D", text: "Cost-plus billing indexed to team hotel and travel expenses" },
      { key: "E", text: "Pro-bono advisory with future right of first refusal on audit work" },
      { key: "F", text: "Contingency fee payable only upon initial slide deck delivery" },
    ],
    correctAnswer: "B",
  },
  // Sub-round 7: CRISIS ROUND (1 question - 130 pts)
  {
    id: "q-7-1",
    roundId: 1,
    subRoundId: 7,
    questionNumber: 1,
    prompt: "[CRISIS ALERT] The client's core banking liquidity ratio plunged below statutory requirement with 48 hours to regulatory audit. What is the immediate First-100-Hours priority?",
    options: [
      { key: "A", text: "Activate Crisis War Room, enforce immediate cash burn freeze, draw committed revolving credit lines, and present emergency bridge collateral to Central Bank" },
      { key: "B", text: "Launch a 6-month brand rebranding campaign on national television" },
      { key: "C", text: "Commission an academic whitepaper on the history of interest rate cycles" },
      { key: "D", text: "Restructure long-term pension fund allocations through municipal bonds" },
      { key: "E", text: "Fire external auditors and postpone quarterly regulatory filing indefinitely" },
      { key: "F", text: "Issue unrated junk bonds directly to international retail investors" },
    ],
    correctAnswer: "A",
  },
  // Sub-round 8: PARTNER (3 questions - 170 pts each)
  {
    id: "q-8-1",
    roundId: 1,
    subRoundId: 8,
    questionNumber: 1,
    prompt: "As Senior Partner pitching a $15M Digital Transformation, the CEO remarks: 'My IT department says AI won't move our needle.' What is the most persuasive strategic counter?",
    options: [
      { key: "A", text: "Shift conversation from technical tools to business outcomes: demonstrate quantifiable EBITDA expansion in peer case studies, propose a phased value-gated pilot, and co-sponsor with the CFO" },
      { key: "B", text: "Concede immediately and downgrade the proposal to standard hardware upgrades" },
      { key: "C", text: "Argue aggressively with the Chief Information Officer in the room" },
      { key: "D", text: "Send a 400-page generic technical architecture manual to the CEO" },
      { key: "E", text: "Offer a 75% fee discount without changing deliverables" },
      { key: "F", text: "Threaten to take the proprietary ideas directly to the client's biggest competitor" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-8-2",
    roundId: 1,
    subRoundId: 8,
    questionNumber: 2,
    prompt: "A sovereign wealth fund seeks to allocate $2 Billion across ASEAN green infrastructure. Which risk management covenant is most critical for long-tenor capital protection?",
    options: [
      { key: "A", text: "Sovereign currency convertibility guarantees, off-take agreement bankability (PPA), and international arbitration jurisdiction" },
      { key: "B", text: "Exclusively oral handshake agreements with local municipal commissioners" },
      { key: "C", text: "Relying on floating spot electricity rates with no floor hedge" },
      { key: "D", text: "Financing 100% of construction through short-term unsecured bank overdrafts" },
      { key: "E", text: "Waiving environmental impact environmental audits to speed up civil works" },
      { key: "F", text: "Denominating project debt in volatile non-pegged regional currencies" },
    ],
    correctAnswer: "A",
  },
  {
    id: "q-8-3",
    roundId: 1,
    subRoundId: 8,
    questionNumber: 3,
    prompt: "In executive leadership succession, when a founding CEO steps down, what governance structure ensures sustainable institutional longevity while retaining founder wisdom?",
    options: [
      { key: "A", text: "Elevate founder to non-executive Chairman with clear charter boundaries, install a proven operating CEO with operational autonomy, and align long-term shareholder equity voting trusts" },
      { key: "B", text: "Retain founder with absolute veto over every daily operational purchase order" },
      { key: "C", text: "Rotate the CEO chair weekly among all board members" },
      { key: "D", text: "Dissolve the board of directors and operate without fiduciary governance" },
      { key: "E", text: "Eliminate all financial reporting to external institutional investors" },
      { key: "F", text: "Appoint an interim manager with no equity stake or long-term mandate" },
    ],
    correctAnswer: "A",
  },
];

export interface RoundEliminationConfig {
  round: number;
  name: string;
  startingCount: number;
  advancingCount: number;
  eliminatedCount: number;
  description: string;
}

export const ROUND_ELIMINATIONS: Record<number, RoundEliminationConfig> = {
  1: {
    round: 1,
    name: "The Gauntlet",
    startingCount: 23,
    advancingCount: 18,
    eliminatedCount: 5,
    description: "23 Peserta Awal → 18 Peserta Lolos (5 Tereliminasi)",
  },
  2: {
    round: 2,
    name: "Capital Conquest",
    startingCount: 18,
    advancingCount: 15,
    eliminatedCount: 3,
    description: "18 Peserta → 15 Peserta Lolos (3 Tereliminasi)",
  },
  3: {
    round: 3,
    name: "Rootmaster",
    startingCount: 15,
    advancingCount: 12,
    eliminatedCount: 3,
    description: "15 Peserta → 12 Peserta Lolos (3 Tereliminasi)",
  },
  4: {
    round: 4,
    name: "Sacred Handoff",
    startingCount: 12,
    advancingCount: 9,
    eliminatedCount: 3,
    description: "12 Peserta (3 Golden Ticket Masuk) → 9 Peserta Lolos (3 Tereliminasi)",
  },
  5: {
    round: 5,
    name: "Pressure Chamber",
    startingCount: 9,
    advancingCount: 5,
    eliminatedCount: 4,
    description: "9 Peserta → 5 Peserta Lolos (4 Tereliminasi)",
  },
  6: {
    round: 6,
    name: "Executive Pitch",
    startingCount: 5,
    advancingCount: 5,
    eliminatedCount: 0,
    description: "5 Peserta Final (Juara 1, 2, 3, Harapan 1 & 2)",
  },
};

export function getActiveRoundParticipants(
  participants: Participant[],
  roundNum: number
): Participant[] {
  if (roundNum <= 3) {
    // Rounds 1-3: Non-golden ticket participants who haven't been eliminated
    return participants.filter(
      (p) => !isGoldenTicket(p) && (p.eliminatedInRound === undefined || p.eliminatedInRound === null)
    );
  }
  // Round 4+: all participants who haven't been eliminated (including 3 Golden Ticket holders who join now!)
  return participants.filter(
    (p) => p.eliminatedInRound === undefined || p.eliminatedInRound === null
  );
}

export function eliminateParticipant(
  participants: Participant[],
  participantId: string,
  roundNum: number
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      return { ...p, status: "eliminated", eliminatedInRound: roundNum };
    }
    return p;
  });
}

export function reinstateParticipant(
  participants: Participant[],
  participantId: string
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      return {
        ...p,
        status: isGoldenTicket(p) ? "golden_ticket" : "active",
        eliminatedInRound: null,
      };
    }
    return p;
  });
}

export function autoAdvanceTopScorers(
  participants: Participant[],
  roundNum: number,
  targetAdvancingCount: number
): Participant[] {
  const eligible = getActiveRoundParticipants(participants, roundNum);
  const sorted = [...eligible].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  const advancingIds = new Set(sorted.slice(0, targetAdvancingCount).map((p) => p.id));
  const eligibleIds = new Set(eligible.map((p) => p.id));

  return participants.map((p) => {
    if (!eligibleIds.has(p.id)) return p;
    if (advancingIds.has(p.id)) {
      return { ...p, status: "active", eliminatedInRound: null };
    }
    return { ...p, status: "eliminated", eliminatedInRound: roundNum };
  });
}

export function getInitialGameState(): GameState {
  const regularParticipants = DEFAULT_PARTICIPANTS.filter((p) => !p.isGoldenTicket);
  const top9Names = regularParticipants.slice(0, 9).map((p) => p.name);
  const top5Names = regularParticipants.slice(0, 5).map((p) => p.name);

  return {
    currentRound: 1,
    subRoundIndex: 0,
    questionIndex: 0,
    round1Phase: "idle",
    round1TimeRemainingMs: 30000,
    round1TimerRunning: false,

    round2TargetAnswer: 1467,
    round2IsOpen: true,

    round3TimeRemainingMs: 300000, // 5 minutes default
    round3TimerRunning: false,
    round3InitialMs: 300000,

    round4SpinNames: top9Names,
    round4SelectedWinner: null,
    round4TimeRemainingMs: 300000,
    round4TimerRunning: false,

    round5SpinNames: top9Names,
    round5SelectedWinner: null,
    round5TimeRemainingMs: 60000,
    round5TimerRunning: false,
    round5GameEnded: false,

    round6SpinNames: top5Names,
    round6SelectedWinner: null,
    round6TimeRemainingMs: 180000,
    round6TimerRunning: false,
    round6GameEnded: false,

    participants: DEFAULT_PARTICIPANTS,
    soundEnabled: true,
    lastUpdated: Date.now(),
  };
}

export function applyScoreChange(
  participants: Participant[],
  participantId: string,
  delta: number,
  currentRound: number = 1
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      const newScore = Math.max(0, p.score + delta);
      const roundScores = { ...(p.roundScores || {}) };
      roundScores[currentRound] = Math.max(0, (roundScores[currentRound] || 0) + delta);

      let point_gauntlet = p.point_gauntlet ?? roundScores[1] ?? (currentRound === 1 ? newScore : 0);
      let point_rootmaster = p.point_rootmaster ?? roundScores[3] ?? 0;

      if (currentRound === 1) {
        point_gauntlet = Math.max(0, point_gauntlet + delta);
      } else if (currentRound === 3) {
        point_rootmaster = Math.max(0, point_rootmaster + delta);
      }

      return {
        ...p,
        score: newScore,
        roundScores,
        point_gauntlet,
        point_rootmaster,
      };
    }
    return p;
  });
}

export function updateRound2Status(
  participants: Participant[],
  participantId: string,
  status: "pending" | "passed" | "failed"
): Participant[] {
  return participants.map((p) => {
    if (p.id === participantId) {
      return { ...p, round2Status: status };
    }
    return p;
  });
}

export function searchParticipants(participants: Participant[], query: string): Participant[] {
  if (!query || !query.trim()) return participants;
  const q = query.trim().toLowerCase();
  return participants.filter(
    (p) => p.name.toLowerCase().includes(q) || p.university.toLowerCase().includes(q)
  );
}

export function getNextQuestionState(
  subRoundIndex: number,
  questionIndex: number
): { subRoundIndex: number; questionIndex: number; isCompleted: boolean } {
  const currentSubRound = ROUND_1_SUBROUNDS[subRoundIndex] || ROUND_1_SUBROUNDS[0];
  if (questionIndex + 1 < currentSubRound.questionCount) {
    return {
      subRoundIndex,
      questionIndex: questionIndex + 1,
      isCompleted: false,
    };
  }
  if (subRoundIndex + 1 < ROUND_1_SUBROUNDS.length) {
    return {
      subRoundIndex: subRoundIndex + 1,
      questionIndex: 0,
      isCompleted: false,
    };
  }
  return {
    subRoundIndex,
    questionIndex,
    isCompleted: true,
  };
}

export function getPrevQuestionState(
  subRoundIndex: number,
  questionIndex: number
): { subRoundIndex: number; questionIndex: number } {
  if (questionIndex > 0) {
    return {
      subRoundIndex,
      questionIndex: questionIndex - 1,
    };
  }
  if (subRoundIndex > 0) {
    const prevSubRound = ROUND_1_SUBROUNDS[subRoundIndex - 1];
    return {
      subRoundIndex: subRoundIndex - 1,
      questionIndex: prevSubRound.questionCount - 1,
    };
  }
  return { subRoundIndex: 0, questionIndex: 0 };
}

export function getNextRound1Phase(
  currentPhase: Round1Phase,
  isEndOfSubRound: boolean = true
): Round1Phase {
  switch (currentPhase) {
    case "idle":
    case "question_timer":
    case "preview":
      return "question_options";
    case "question_options":
    case "answering":
      return "correct_answer";
    case "correct_answer":
      return isEndOfSubRound ? "leaderboard" : "question_timer";
    case "leaderboard":
      return "question_timer";
    default:
      return "question_timer";
  }
}

export function getPrevRound1Phase(currentPhase: Round1Phase): Round1Phase {
  switch (currentPhase) {
    case "leaderboard":
      return "correct_answer";
    case "correct_answer":
      return "question_options";
    case "question_options":
    case "answering":
      return "question_timer";
    case "question_timer":
    case "preview":
    case "idle":
      return "idle";
    default:
      return "question_timer";
  }
}

