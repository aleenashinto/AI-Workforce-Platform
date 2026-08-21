AI Workforce Platform: Comprehensive Project Analysis
1. What is the Project?
The AI Workforce Platform is a full-stack, enterprise-grade application designed to automate and augment traditional business roles using Artificial Intelligence. Currently, it focuses on two primary AI "employees":

AI Customer Support Agent: An automated chatbot and support assistant that answers customer queries based on a company's internal knowledge base.
AI Sales Assistant: An automated outbound sales representative that researches leads, scores them against an Ideal Customer Profile (ICP), and drafts hyper-personalized outreach emails.
It is built as a Monorepo (using Turborepo) to share database schemas, LLM logic, and UI components across multiple applications.

2. How it Works (System Architecture)
The system is distributed across several interconnected applications and packages:

Frontend Web App (apps/web): Built with Next.js, React, and Tailwind CSS. It uses a cyber-themed, dark-mode UI with custom "lucide-react" icons. It communicates with the backend via REST APIs.
Backend API (apps/api): A high-performance Fastify Node.js server. It handles authentication, database operations, routing, and exposes endpoints for the frontend and the embeddable chat widget.
Background Workers (apps/worker): A Node.js background processor powered by BullMQ and Redis. It handles heavy, long-running tasks asynchronously (e.g., researching leads via the web, generating emails via LLMs, running data retention policies) without freezing the UI.
Embeddable Widget (apps/widget): A lightweight, compiled JavaScript chat interface that organizations can embed on their own external websites to let their customers talk to the AI Support Agent.
Database (packages/db): Hosted on Supabase (PostgreSQL), managed via Drizzle ORM. It uses pgvector for storing embeddings (vector representations of text) to enable Semantic Search for the AI (Retrieval-Augmented Generation).
LLM Gateway (packages/llm): A centralized package to handle communication with Large Language Models (like OpenAI's GPT models or Anthropic) for generating responses and evaluating data.
3. Functionality by Module & Page
A. Core Platform & User Management
These pages manage the administrative and foundational settings of an organization.

Login / Signup / Onboarding (/login, /signup, /onboarding): Users can create accounts, verify emails, and set up their organization.
Dashboard (/dashboard): The main landing page after login, providing a bird's-eye view of both the Sales and Support modules.
Platform Settings (/platform/settings): Organization-wide configurations, API keys for integrations, and billing management.
Team Management (/platform/team): Invite colleagues to the platform and assign them roles (e.g., Admin, Sales Rep, Support Agent).
User Profile (/platform/profile): Manage personal details (Full Name, Job Title) and upload a profile picture. (Password changes are handled via a reset email flow).
B. AI Customer Support Module
Designed to ingest company data and automatically resolve customer tickets.

Overview (/customer-support/overview): High-level metrics on AI resolution rates, total conversations, and customer satisfaction.
Knowledge Base (/customer-support/knowledge): The "brain" of the AI. Users can upload documents, link URLs, or paste text. The system vectorizes this data so the AI can retrieve facts when answering customer questions.
Knowledge Gaps (/customer-support/knowledge-gaps): Highlights questions that customers asked which the AI couldn't answer due to missing information, allowing human admins to fill in the blanks.
Inbox / Conversations (/customer-support/inbox, /customer-support/conversations): A view of live and historical chats between customers and the AI. Human agents can monitor these, step in if the AI struggles, or review them for quality assurance.
Widget Configuration (/customer-support/widget): Customize the look and feel of the embeddable chat widget (colors, welcome message, bot avatar) and get the HTML snippet to install it on external websites.
Support Analytics (/customer-support/analytics): Deep dive into support trends, busiest times, and common customer issues.
C. AI Sales Assistant Module
Designed to automate outbound lead generation and personalized outreach.

Sales Overview (/sales-assistant/overview): Metrics on emails sent, open rates, reply rates, and meetings booked.
Ideal Customer Profile (ICP) (/sales-assistant/icp): Users define exactly who they are trying to sell to (e.g., "VP of Engineering at mid-sized SaaS companies"). The AI uses this to score leads.
Leads Database (/sales-assistant/leads): A CRM-like table of all imported or discovered prospects.
Lead Discovery & Research (/sales-assistant/lead-discovery, /sales-assistant/research): The background worker scours the internet or provided URLs to gather deep context about a specific lead or company. The AI summarizes this research to understand the prospect's pain points.
Sequences & Campaigns (/sales-assistant/sequences, /sales-assistant/campaigns): Users build multi-step email workflows (e.g., Day 1: Initial Email, Day 3: Follow-up).
Outreach Drafts (/sales-assistant/drafts): The most powerful feature. Based on the ICP and the Lead Research, the AI drafts highly personalized emails. A human sales rep can review, tweak, and approve the draft before it sends.
Mailboxes (/sales-assistant/mailboxes): Connect external email accounts (via SMTP/IMAP or OAuth) so the AI can send emails directly from the user's real email address.
4. Key Workflows
The Support Flow: Admin adds website URLs to the Knowledge Base -> Background worker scrapes and embeds the text -> Admin embeds Widget on their site -> Customer asks a question -> Backend searches vector DB for context -> LLM generates an accurate, contextual answer.
The Sales Flow: Admin defines an ICP -> Admin imports a CSV of Lead names/URLs -> Background worker triggers Lead Research -> Worker scores the lead against the ICP -> If qualified, Worker generates a personalized email draft -> Human clicks "Approve & Send".
