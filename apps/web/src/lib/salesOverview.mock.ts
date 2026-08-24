export interface SalesOverviewData {
  kpis: {
    totalRevenue: { value: string; percentChange: number; description: string };
    pipelineValue: {
      value: string;
      percentChange: number;
      description: string;
    };
    totalLeads: { value: string; percentChange: number; description: string };
    qualifiedLeads: {
      value: string;
      percentChange: number;
      description: string;
    };
    conversionRate: {
      value: string;
      percentChange: number;
      description: string;
    };
    salesActivities: {
      value: string;
      percentChange: number;
      description: string;
    };
  };
  performance: {
    date: string;
    revenue: number;
    deals: number;
    opportunities: number;
    conversion: number;
  }[];
  insights: {
    id: string;
    type: "opportunity" | "risk" | "growth";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    action: string;
    cta: string;
  }[];
  pipeline: {
    stage: string;
    opportunities: number;
    value: string;
    percent: number;
  }[];
  funnel: {
    stage: string;
    count: number;
    conversionPercent: number;
    dropoffPercent: number;
  }[];
  recentLeads: {
    id: string;
    name: string;
    company: string;
    score: number;
    stage: string;
    owner: string;
    lastActivity: string;
  }[];
  followUps: {
    id: string;
    name: string;
    company: string;
    status: "overdue" | "today" | "upcoming";
    description: string;
    cta: string;
  }[];
  meetings: {
    id: string;
    time: string;
    contact: string;
    company: string;
    type: string;
    status: string;
  }[];
  recommendedActions: {
    id: string;
    title: string;
    description: string;
    cta: string;
  }[];
  discoverySummary: {
    discovered: number;
    aiQualified: number;
    highQuality: number;
    opportunitiesCreated: number;
  };
  forecast: {
    currentPipeline: string;
    expectedRevenue: string;
    confidence: number;
    expectedDeals: number;
    explanation: string;
  };
  leadSources: { source: string; percentage: number }[];
  industryPerformance: { industry: string; percentage: number }[];
  recentActivity: {
    id: string;
    description: string;
    timeAgo: string;
    type: "email" | "stage_change" | "ai_generate" | "meeting" | "opportunity";
  }[];
}

export const getMockSalesOverview = async (
  dateRange: string,
): Promise<SalesOverviewData> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    kpis: {
      totalRevenue: {
        value: "₹24.8L",
        percentChange: 18.4,
        description: "vs previous period",
      },
      pipelineValue: {
        value: "₹78.5L",
        percentChange: 12.7,
        description: "23 opportunities",
      },
      totalLeads: {
        value: "1,248",
        percentChange: 15.2,
        description: "+164 this month",
      },
      qualifiedLeads: {
        value: "386",
        percentChange: 9.8,
        description: "31% qualification rate",
      },
      conversionRate: {
        value: "18.6%",
        percentChange: 3.2,
        description: "vs previous period",
      },
      salesActivities: {
        value: "642",
        percentChange: 21.4,
        description: "Today: 38",
      },
    },
    performance: [
      { date: "Mon", revenue: 2.1, deals: 1, opportunities: 3, conversion: 12 },
      { date: "Tue", revenue: 3.4, deals: 2, opportunities: 4, conversion: 15 },
      { date: "Wed", revenue: 1.8, deals: 0, opportunities: 2, conversion: 14 },
      { date: "Thu", revenue: 4.2, deals: 3, opportunities: 5, conversion: 18 },
      { date: "Fri", revenue: 5.6, deals: 4, opportunities: 8, conversion: 22 },
      { date: "Sat", revenue: 2.3, deals: 1, opportunities: 1, conversion: 20 },
      {
        date: "Sun",
        revenue: 5.4,
        deals: 3,
        opportunities: 6,
        conversion: 18.6,
      },
    ],
    insights: [
      {
        id: "1",
        type: "opportunity",
        title: "High-priority opportunity",
        description:
          "Acme Technologies has increased engagement with your sales emails and visited the pricing page multiple times.",
        priority: "high",
        action: "Schedule a product demo within 24 hours.",
        cta: "View Opportunity",
      },
      {
        id: "2",
        type: "risk",
        title: "Pipeline Risk",
        description:
          "5 opportunities worth ₹12.4L have had no activity for more than 14 days.",
        priority: "high",
        action: "Follow up or mark as closed lost.",
        cta: "Review Pipeline",
      },
      {
        id: "3",
        type: "growth",
        title: "Growth Opportunity",
        description:
          "SaaS leads have a higher conversion rate than the overall sales average.",
        priority: "medium",
        action: "Focus outreach on SaaS targets this week.",
        cta: "Explore Leads",
      },
    ],
    pipeline: [
      { stage: "New", opportunities: 45, value: "₹10.5L", percent: 100 },
      { stage: "Qualified", opportunities: 32, value: "₹15.2L", percent: 80 },
      { stage: "Contacted", opportunities: 28, value: "₹18.4L", percent: 65 },
      { stage: "Meeting", opportunities: 15, value: "₹22.1L", percent: 45 },
      { stage: "Proposal", opportunities: 8, value: "₹35.5L", percent: 25 },
      { stage: "Negotiation", opportunities: 4, value: "₹28.0L", percent: 12 },
      { stage: "Won", opportunities: 14, value: "₹24.8L", percent: 40 },
      { stage: "Lost", opportunities: 21, value: "₹0L", percent: 0 },
    ],
    funnel: [
      {
        stage: "All Leads",
        count: 1248,
        conversionPercent: 100,
        dropoffPercent: 0,
      },
      {
        stage: "Qualified",
        count: 386,
        conversionPercent: 31,
        dropoffPercent: 69,
      },
      {
        stage: "Contacted",
        count: 215,
        conversionPercent: 55,
        dropoffPercent: 45,
      },
      {
        stage: "Responded",
        count: 98,
        conversionPercent: 45,
        dropoffPercent: 55,
      },
      {
        stage: "Meeting",
        count: 42,
        conversionPercent: 42,
        dropoffPercent: 58,
      },
      {
        stage: "Opportunity",
        count: 23,
        conversionPercent: 54,
        dropoffPercent: 46,
      },
      { stage: "Won", count: 14, conversionPercent: 60, dropoffPercent: 40 },
    ],
    recentLeads: [
      {
        id: "1",
        name: "John Smith",
        company: "ABC Technologies",
        score: 92,
        stage: "Qualified",
        owner: "Alex",
        lastActivity: "2h ago",
      },
      {
        id: "2",
        name: "Sarah Lee",
        company: "Nova AI",
        score: 85,
        stage: "Contacted",
        owner: "Maria",
        lastActivity: "4h ago",
      },
      {
        id: "3",
        name: "Michael Chen",
        company: "Cloud Systems",
        score: 45,
        stage: "New",
        owner: "Alex",
        lastActivity: "1d ago",
      },
      {
        id: "4",
        name: "Emma Davis",
        company: "FinTech Solutions",
        score: 78,
        stage: "Meeting",
        owner: "Sarah",
        lastActivity: "2d ago",
      },
      {
        id: "5",
        name: "David Wilson",
        company: "Global Logistics",
        score: 62,
        stage: "Qualified",
        owner: "Maria",
        lastActivity: "3d ago",
      },
    ],
    followUps: [
      {
        id: "1",
        name: "John Smith",
        company: "ABC Technologies",
        status: "overdue",
        description: "Follow-up overdue by 2 days",
        cta: "Send Follow-up",
      },
      {
        id: "2",
        name: "Sarah Lee",
        company: "Nova AI",
        status: "today",
        description: "Follow-up due today",
        cta: "Contact",
      },
      {
        id: "3",
        name: "Emma Davis",
        company: "FinTech Solutions",
        status: "upcoming",
        description: "Follow-up due in 2 days",
        cta: "Review",
      },
    ],
    meetings: [
      {
        id: "1",
        time: "10:30 AM",
        contact: "John Smith",
        company: "ABC Technologies",
        type: "Product Demo",
        status: "Confirmed",
      },
      {
        id: "2",
        time: "02:00 PM",
        contact: "Sarah Lee",
        company: "Nova AI",
        type: "Discovery Call",
        status: "Pending",
      },
      {
        id: "3",
        time: "04:15 PM",
        contact: "Emma Davis",
        company: "FinTech Solutions",
        type: "Pricing Review",
        status: "Confirmed",
      },
    ],
    recommendedActions: [
      {
        id: "1",
        title: "Contact 3 Hot Leads",
        description: "These leads have scores above 90.",
        cta: "View Leads",
      },
      {
        id: "2",
        title: "Follow up with 5 prospects",
        description:
          "These prospects have not been contacted for more than 5 days.",
        cta: "View Follow-ups",
      },
      {
        id: "3",
        title: "Review ₹12.4L Pipeline Risk",
        description: "5 opportunities have become inactive.",
        cta: "Review Pipeline",
      },
    ],
    discoverySummary: {
      discovered: 248,
      aiQualified: 96,
      highQuality: 42,
      opportunitiesCreated: 18,
    },
    forecast: {
      currentPipeline: "₹78.5L",
      expectedRevenue: "₹31.8L",
      confidence: 82,
      expectedDeals: 14,
      explanation:
        "Based on current opportunity stages, historical conversion rates, and recent sales activity, approximately ₹31.8L is expected to close this quarter.",
    },
    leadSources: [
      { source: "Website", percentage: 35 },
      { source: "LinkedIn", percentage: 24 },
      { source: "AI Lead Discovery", percentage: 18 },
      { source: "Referral", percentage: 12 },
      { source: "Email Campaign", percentage: 8 },
      { source: "Other", percentage: 3 },
    ],
    industryPerformance: [
      { industry: "SaaS", percentage: 42 },
      { industry: "FinTech", percentage: 24 },
      { industry: "Healthcare", percentage: 15 },
      { industry: "E-commerce", percentage: 11 },
      { industry: "Other", percentage: 8 },
    ],
    recentActivity: [
      {
        id: "1",
        description: "Alex sent an email to John Smith",
        timeAgo: "5 minutes ago",
        type: "email",
      },
      {
        id: "2",
        description: "Maria moved Nova AI to Qualified",
        timeAgo: "24 minutes ago",
        type: "stage_change",
      },
      {
        id: "3",
        description: "AI generated a lead from ABC Technologies",
        timeAgo: "1 hour ago",
        type: "ai_generate",
      },
      {
        id: "4",
        description: "Alex scheduled a demo with Cloud Systems",
        timeAgo: "2 hours ago",
        type: "meeting",
      },
      {
        id: "5",
        description: "Sarah created a new opportunity",
        timeAgo: "3 hours ago",
        type: "opportunity",
      },
    ],
  };
};
