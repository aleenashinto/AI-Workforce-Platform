# Development Demo Data Seed

This script generates a realistic set of fake customers, conversations, messages, and tags for the AI Workforce Platform, allowing developers to test the Customer Support Inbox UI and API with realistic scenarios.

## Usage

To generate the seed data, run:

```bash
pnpm seed:demo
```

This will safely generate 50 fictional end users and 50 conversations.

### Resetting

To completely remove the seeded demo data and recreate it (useful for starting fresh):

```bash
pnpm seed:demo --reset
```

The reset command only deletes records marked with `{ \"is_demo\": true }` in the user metadata, meaning it is safe to run without affecting production records.

## Data Generated

- **Customers:** 50
- **Conversations:** 50
- **Messages:** Approx. 200-300+
- **Statuses:** 27 Active (Open/Pending), 8 Escalated, 15 Resolved
- **Channels:** Widget, Email, WhatsApp, API
- **Assignments:** Distributed between AI Support Agent (unassigned/active) and Human Agents (assigned/ai_paused)

## Scenarios Included

- Order Tracking
- Refund
- Payment Problem
- Product Information
- Return/Exchange
- Account/Login
- Shipping Delay
- Subscription
- Cancellation
- Technical Support
- Complaints
- General Questions

## Verifying

1. Run `pnpm seed:demo`.
2. Start the development server (`pnpm dev`).
3. Open `http://localhost:3000/customer-support/inbox`.
4. Verify that the 50 conversations appear and that filters (Open, Escalated, Resolved) work as expected.
