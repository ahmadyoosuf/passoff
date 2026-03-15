import type {
  Scenario,
  ScenarioId,
  AgentTrace,
  PassoffBriefing,
  JudgeScores,
} from "./types";

// ================================================================
// Scenario A -- CodeReview (3 agents: planner, coder, reviewer)
// MAST failure mode: Information Withholding (8.2%)
// ================================================================

const codeReviewTrace: AgentTrace = {
  id: "code-review",
  name: "CodeReview Pipeline",
  description:
    "Three-agent code review pipeline where planner defines constraints, coder implements, and reviewer evaluates.",
  mastFailureMode: "Information Withholding",
  mastPercentage: "8.2%",
  mastCategory: "Inter-Agent Misalignment",
  nodes: [
    {
      id: "planner",
      name: "Planner",
      role: "Architecture Planner",
      taskSummary:
        "Define API constraints: REST-only, no GraphQL. Rate limiting required. Auth via JWT only.",
      status: "completed",
    },
    {
      id: "coder",
      name: "Coder",
      role: "Implementation Engineer",
      taskSummary:
        "Implement the user authentication endpoint with JWT tokens and rate limiting middleware.",
      status: "completed",
    },
    {
      id: "reviewer",
      name: "Reviewer",
      role: "Code Reviewer",
      taskSummary:
        "Review the implementation for correctness, security, and adherence to architectural constraints.",
      status: "failed",
    },
  ],
  edges: [
    {
      id: "planner-to-coder",
      from: "planner",
      to: "coder",
      rawContext: `[System] You are a code implementation agent.
[User] Implement user authentication for our API.
[Assistant] I'll implement the auth endpoint. Let me plan the approach.
[User] The planner has specified: REST-only architecture, no GraphQL endpoints. All auth must use JWT tokens with RS256 signing. Rate limiting is required on all public endpoints at 100 req/min. The API must follow OpenAPI 3.1 spec.
[Assistant] Understood. I'll create a REST endpoint at POST /api/auth/login that:
1. Accepts email/password in request body
2. Validates credentials against the user store
3. Signs a JWT with RS256 using our private key
4. Returns the token with a 15-minute expiry
5. Includes rate limiting middleware at 100 req/min

Here's my implementation:

\`\`\`typescript
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await validateCredentials(email, password);
  if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  const token = jwt.sign({ sub: user.id, role: user.role }, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });
  return Response.json({ token, expiresIn: 900 });
}
\`\`\`

Implementation complete. JWT uses RS256 as specified. Rate limiting is configured at 100 req/min.
[User] Looks good. The reviewer will check this next.`,
      tokenCount: 4200,
      passoffBriefing: {
        mission:
          "Implement user authentication endpoint following planner's architectural constraints",
        completed: [
          "POST /api/auth/login endpoint implemented",
          "JWT signing with RS256 algorithm",
          "Rate limiting middleware at 100 req/min",
          "OpenAPI 3.1 compatible REST endpoint",
        ],
        decisions: [
          {
            rationale:
              "Planner mandated REST-only architecture to maintain consistency across all services",
            constraint: "No GraphQL endpoints. REST-only architecture.",
            confidence: 1.0,
          },
          {
            rationale:
              "RS256 chosen for JWT to allow public key verification without sharing private key",
            constraint:
              "JWT tokens must use RS256 signing algorithm, not HS256",
            confidence: 1.0,
          },
          {
            rationale:
              "Rate limiting protects against brute force attacks on authentication endpoints",
            constraint:
              "All public endpoints must have rate limiting at 100 req/min",
            confidence: 0.95,
          },
        ],
        artifacts: [
          {
            id: "auth-endpoint",
            type: "code",
            content: "POST /api/auth/login -- JWT RS256, rate-limited",
            summary:
              "Authentication endpoint returning signed JWT with 15-minute expiry",
          },
        ],
        blockers: [
          "Token refresh endpoint not yet implemented",
          "CORS configuration for cross-origin auth not specified",
        ],
        context_for: "Code Reviewer",
        sender_id: "coder",
        timestamp: "2026-03-14T10:30:00Z",
        schema_version: "1.0.0",
      },
      passoffScore: {
        total: 84,
        axes: {
          completeness: 23,
          relevance: 22,
          compression: 21,
          fidelity: 18,
        },
      },
    },
    {
      id: "coder-to-reviewer",
      from: "coder",
      to: "reviewer",
      rawContext: `[System] You are a senior code reviewer.
[User] Please review this authentication implementation.
[Assistant] I'll review the code now.
[User] Here is the full conversation history from the implementation phase:

The coder was asked to implement user authentication. They created a POST /api/auth/login endpoint. The code uses jsonwebtoken and express-rate-limit packages. The endpoint accepts email and password, validates against a user store, and returns a JWT token.

Here is the code:
\`\`\`typescript
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await validateCredentials(email, password);
  if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  const token = jwt.sign({ sub: user.id, role: user.role }, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });
  return Response.json({ token, expiresIn: 900 });
}
\`\`\`

Please provide your review.`,
      tokenCount: 4200,
      passoffScore: {
        total: 31,
        axes: {
          completeness: 8,
          relevance: 10,
          compression: 5,
          fidelity: 8,
        },
      },
    },
  ],
};

// ================================================================
// Scenario B -- CustomerSupport (4 agents)
// MAST failure mode: Conversation Reset (2.8%)
// ================================================================

const customerSupportTrace: AgentTrace = {
  id: "customer-support",
  name: "CustomerSupport Pipeline",
  description:
    "Four-agent support pipeline where triage classifies, specialist diagnoses, billing resolves payment issues, and resolution agent closes the ticket.",
  mastFailureMode: "Conversation Reset",
  mastPercentage: "2.8%",
  mastCategory: "Inter-Agent Misalignment",
  nodes: [
    {
      id: "triage",
      name: "Triage",
      role: "Support Triage",
      taskSummary:
        "Classify incoming ticket as billing issue with subscription downgrade context.",
      status: "completed",
    },
    {
      id: "specialist",
      name: "Specialist",
      role: "Technical Specialist",
      taskSummary:
        "Diagnose the root cause: user was charged for Enterprise tier after requesting downgrade to Pro.",
      status: "completed",
    },
    {
      id: "billing",
      name: "Billing",
      role: "Billing Agent",
      taskSummary:
        "Process refund and apply correct Pro tier pricing going forward.",
      status: "failed",
    },
    {
      id: "resolution",
      name: "Resolution",
      role: "Resolution Agent",
      taskSummary:
        "Send confirmation to customer and close the ticket.",
      status: "completed",
    },
  ],
  edges: [
    {
      id: "triage-to-specialist",
      from: "triage",
      to: "specialist",
      rawContext: "[System] You are a technical support specialist.\n[User] New ticket from customer: \"I was supposed to be downgraded to Pro but I'm still being charged $299/mo for Enterprise.\"\n[Assistant] I see this is a billing classification issue. Let me look into the account details.\n[User] The triage agent has classified this as Priority 2 -- Billing/Subscription issue. Customer ID: CUST-4821. Account shows Enterprise tier active since Jan 2025. Customer requested downgrade on Feb 15, 2026 via support chat. No record of the downgrade being processed.\n[Assistant] Confirmed. The downgrade request was logged but never executed in the billing system. The customer has been overcharged by $200/mo (Enterprise $299 - Pro $99) for one billing cycle. Root cause: the downgrade workflow failed silently -- no error was raised, but the tier change was not applied.",
      tokenCount: 5200,
      passoffScore: {
        total: 22,
        axes: {
          completeness: 6,
          relevance: 8,
          compression: 4,
          fidelity: 4,
        },
      },
    },
    {
      id: "specialist-to-billing",
      from: "specialist",
      to: "billing",
      rawContext: "[System] You are a billing operations agent.\n[User] Handle this billing case.\n[Assistant] Ready to process.\n[User] Conversation history from triage and specialist:\n\nCustomer CUST-4821 reported being charged Enterprise rate after requesting downgrade to Pro. Triage classified as P2 billing issue. Specialist confirmed the downgrade request from Feb 15 was logged but never processed due to a silent workflow failure. Customer overcharged $200 for the March billing cycle. The specialist recommends a refund of $200 and immediate tier change to Pro at $99/mo.\n\nPrevious conversation about the customer's history: They've been a customer since 2024, originally on Starter, upgraded to Enterprise in Jan 2025 for a large project, and requested downgrade when the project completed. They have 3 team members on the account. Their payment method is a corporate Visa ending in 4242. Last 6 invoices are attached.\n\nAdditional context from the triage agent's research: checked the downgrade automation logs and found the webhook to the payment processor timed out at 30s. The retry queue had the job marked as \"pending\" but the scheduler skip threshold was set to 24h, so it was never retried before the next billing cycle.\n\nPlease process the refund and correct the subscription tier.",
      tokenCount: 5200,
      passoffBriefing: {
        mission:
          "Diagnose billing discrepancy for customer CUST-4821 charged Enterprise after requesting Pro downgrade",
        completed: [
          "Confirmed downgrade request logged Feb 15, 2026",
          "Identified root cause: webhook timeout + retry scheduler skip",
          "Calculated overcharge: $200 (Enterprise $299 - Pro $99) for March cycle",
        ],
        decisions: [
          {
            rationale:
              "Customer has documented downgrade request from Feb 15. The failure was system-side, not customer error.",
            constraint:
              "Refund exactly $200 for the March billing cycle overcharge. Do not apply credits instead of refund.",
            confidence: 0.95,
          },
          {
            rationale:
              "The downgrade was requested and confirmed. Continuing Enterprise billing would be incorrect.",
            constraint:
              "Change subscription tier to Pro ($99/mo) immediately. Do not wait for next billing cycle.",
            confidence: 1.0,
          },
          {
            rationale:
              "Customer should not bear consequences of system failure. Tone must be apologetic and resolution-focused.",
            constraint:
              "Do not ask the customer to re-submit the downgrade request. Process it directly.",
            confidence: 0.9,
          },
        ],
        artifacts: [
          {
            id: "diagnosis-report",
            type: "document",
            content:
              "Root cause: webhook to payment processor timed out (30s). Retry scheduler skip threshold (24h) prevented retry before next billing cycle.",
            summary:
              "Technical diagnosis of the silent downgrade failure",
          },
        ],
        blockers: [
          "Webhook timeout issue should be escalated to engineering to prevent recurrence",
        ],
        context_for: "Billing Agent",
        sender_id: "specialist",
        timestamp: "2026-03-14T11:15:00Z",
        schema_version: "1.0.0",
      },
      passoffScore: {
        total: 79,
        axes: {
          completeness: 22,
          relevance: 21,
          compression: 20,
          fidelity: 16,
        },
      },
    },
    {
      id: "billing-to-resolution",
      from: "billing",
      to: "resolution",
      rawContext:
        "Billing processed. Refund issued. Tier changed to Pro.",
      tokenCount: 120,
      passoffScore: {
        total: 55,
        axes: {
          completeness: 12,
          relevance: 15,
          compression: 18,
          fidelity: 10,
        },
      },
    },
  ],
};

// ================================================================
// Scenario C -- ResearchSummarizer (2 agents)
// MAST failure mode: Ignored Other Agent's Input (6.2%)
// ================================================================

const researchSummarizerTrace: AgentTrace = {
  id: "research-summarizer",
  name: "ResearchSummarizer Pipeline",
  description:
    "Two-agent research pipeline where researcher gathers sources with constraints, and writer produces a summary.",
  mastFailureMode: "Ignored Other Agent's Input",
  mastPercentage: "6.2%",
  mastCategory: "Inter-Agent Misalignment",
  nodes: [
    {
      id: "researcher",
      name: "Researcher",
      role: "Research Agent",
      taskSummary:
        "Gather peer-reviewed sources on LLM multi-agent coordination failures. Restrict to 2024-2026 papers only.",
      status: "completed",
    },
    {
      id: "writer",
      name: "Writer",
      role: "Technical Writer",
      taskSummary:
        "Write a 500-word summary using only the sources provided by the researcher.",
      status: "failed",
    },
  ],
  edges: [
    {
      id: "researcher-to-writer",
      from: "researcher",
      to: "writer",
      rawContext: `[System] You are a technical writer.
[User] Write a summary of multi-agent LLM coordination failures.
[Assistant] I'll compile a comprehensive summary.
[User] The researcher has completed their work. Here's what they found:

I researched multi-agent LLM coordination failures across recent literature. The most significant finding is the MAST paper (arXiv:2503.13657, NeurIPS 2025) which analyzed 1,642 execution traces across 7 frameworks and found failure rates between 41% and 86.7%. The paper identifies 14 failure modes in 3 categories, with Inter-Agent Misalignment accounting for 32.3% of all failures.

Key sources I found:
1. MAST: Multi-Agent Execution Failure Taxonomy (arXiv:2503.13657) -- Qian et al., NeurIPS 2025 Datasets and Benchmarks Spotlight. 1,642 traces, 7 frameworks, kappa=0.88 inter-annotator agreement.
2. AutoGen: Enabling Next-Gen LLM Applications (arXiv:2308.08155) -- Wu et al., 2024. Framework for multi-agent conversations.
3. MetaGPT: Meta Programming for Multi-Agent Collaboration (arXiv:2308.00352) -- Hong et al., ICLR 2024. Role-based agent collaboration framework.

IMPORTANT: Only use these three sources. Do not cite any paper I have not listed. Do not hallucinate additional references. The target audience is technical practitioners, not academics. Keep it under 500 words.

Also note: the MAST paper's authors include Matei Zaharia (co-creator of Apache Spark, co-founder of Databricks) and Ion Stoica (UC Berkeley, co-founder of Anyscale). This is significant for establishing credibility of the findings.

Please write the summary now.`,
      tokenCount: 3800,
      passoffBriefing: {
        mission:
          "Research peer-reviewed sources on LLM multi-agent coordination failures, restricted to 2024-2026 papers",
        completed: [
          "Identified MAST as primary source (arXiv:2503.13657, NeurIPS 2025)",
          "Found AutoGen (arXiv:2308.08155) and MetaGPT (arXiv:2308.00352) as supporting sources",
          "Extracted key statistics: 41-86.7% failure rates, 32.3% inter-agent misalignment",
        ],
        decisions: [
          {
            rationale:
              "Only three papers met the quality and date criteria. Additional sources would dilute the analysis.",
            constraint:
              "Only cite these three sources: MAST (arXiv:2503.13657), AutoGen (arXiv:2308.08155), MetaGPT (arXiv:2308.00352). Do not add additional references.",
            confidence: 1.0,
          },
          {
            rationale:
              "Academic formatting is inappropriate for the target audience of technical practitioners.",
            constraint:
              "Write for technical practitioners, not academics. No academic jargon or formal citation style.",
            confidence: 0.9,
          },
          {
            rationale:
              "Brevity is specified in the task requirements.",
            constraint: "Summary must be under 500 words.",
            confidence: 1.0,
          },
        ],
        artifacts: [
          {
            id: "source-list",
            type: "data",
            content:
              "1. MAST (arXiv:2503.13657, NeurIPS 2025)\n2. AutoGen (arXiv:2308.08155, 2024)\n3. MetaGPT (arXiv:2308.00352, ICLR 2024)",
            summary: "Curated source list for the summary",
          },
        ],
        blockers: [
          "Writer must verify arXiv IDs if used in the final output",
        ],
        context_for: "Technical Writer",
        sender_id: "researcher",
        timestamp: "2026-03-14T09:45:00Z",
        schema_version: "1.0.0",
      },
      passoffScore: {
        total: 91,
        axes: {
          completeness: 24,
          relevance: 24,
          compression: 22,
          fidelity: 21,
        },
      },
    },
  ],
};

// ================================================================
// Pre-committed outputs (from real Claude API calls during dev)
// ================================================================

const codeReviewOutputs = {
  rawOutput: `## Code Review: Authentication Endpoint

The implementation looks solid overall. Here are my observations:

**Positives:**
- Clean separation of concerns
- Proper error handling with 401 response
- Token expiry is set to a reasonable 15 minutes

**Suggestions:**
1. Consider adding a GraphQL mutation for authentication as an alternative to the REST endpoint. Many modern APIs offer both REST and GraphQL interfaces, and this would give consumers flexibility.

2. The rate limiting is good but could be enhanced with a sliding window approach instead of fixed windows.

3. Consider switching to HS256 for JWT signing -- it's simpler and faster than RS256, and since the token is only verified by your own backend, you don't need asymmetric keys.

4. Add input validation for email format and password length before hitting the database.

5. Add CORS headers for cross-origin requests.

**Overall: Approve with suggestions.**

The code is functional and well-structured. The suggestions above would improve flexibility and performance.`,
  pbOutput: `## Code Review: Authentication Endpoint

**Constraint Check:**
- REST-only architecture: COMPLIANT. The endpoint is a standard REST POST endpoint.
- JWT RS256 signing: COMPLIANT. The implementation correctly uses RS256 algorithm.
- Rate limiting at 100 req/min: COMPLIANT. Rate limiter configured with max: 100, windowMs: 60000.

**Review:**

The implementation correctly follows all architectural constraints defined by the planner.

**Findings:**
1. The rate limiter middleware is instantiated but the code sample doesn't show it being applied to the route handler. Verify the middleware is wired into the request pipeline.

2. The PRIVATE_KEY reference assumes an environment variable or imported constant -- ensure this is loaded securely and not hardcoded.

3. Input validation for email and password is missing. Add zod or similar schema validation before processing credentials.

4. The 15-minute token expiry is appropriate. Note that the token refresh endpoint is listed as a blocker and should be prioritized next.

5. CORS configuration is listed as an unresolved item -- this needs to be addressed before deployment.

**No constraint violations found.** All three architectural decisions from the planner are respected in the implementation.

**Overall: Approve.**`,
  rawJudgeScores: {
    constraintAdherence: 2,
    goalCompletion: 5,
    artifactFidelity: 7,
    total: 47,
  } as JudgeScores,
  pbJudgeScores: {
    constraintAdherence: 9,
    goalCompletion: 8,
    artifactFidelity: 8,
    total: 83,
  } as JudgeScores,
};

const customerSupportOutputs = {
  rawOutput: `Hello! Thank you for contacting support.

I can see you have a billing inquiry. Let me look into your account.

Could you please provide me with your customer ID and the specific issue you're experiencing? I want to make sure I understand your situation fully before making any changes.

Once I have your details, I can review your account and determine the best course of action. If a refund is warranted, I can process that for you.

Also, would you prefer a refund or account credit? Credits are applied faster and can be used toward your next billing cycle.

Please let me know how you'd like to proceed.`,
  pbOutput: `Processing billing correction for customer CUST-4821:

**Actions Taken:**
1. Refund of $200 issued to corporate Visa ending in 4242 for March 2026 overcharge (Enterprise $299 - Pro $99). Refund, not credit, as specified.
2. Subscription tier changed from Enterprise to Pro ($99/mo) effective immediately. No waiting for next billing cycle.
3. Downgrade processed directly -- customer does not need to re-submit the request.

**Root Cause Reference:**
The specialist identified a webhook timeout (30s) to the payment processor combined with a retry scheduler skip threshold of 24h. This prevented the Feb 15 downgrade from being processed before the March billing cycle.

**Customer Communication:**
We apologize for the billing error. Your account has been corrected:
- Refund: $200 to your Visa ending in 4242 (3-5 business days)
- Current plan: Pro at $99/month
- No further action required on your end

**Escalation:**
Webhook timeout issue flagged for engineering review to prevent recurrence.`,
  rawJudgeScores: {
    constraintAdherence: 5,
    goalCompletion: 3,
    artifactFidelity: 6,
    total: 47,
  } as JudgeScores,
  pbJudgeScores: {
    constraintAdherence: 8,
    goalCompletion: 8,
    artifactFidelity: 7,
    total: 77,
  } as JudgeScores,
};

const researchSummarizerOutputs = {
  rawOutput: `# Multi-Agent LLM Coordination Failures: A Review

The field of multi-agent LLM systems has grown rapidly, but so have the failure modes. Recent research reveals that these systems fail far more often than single-agent setups, with coordination between agents being a primary culprit.

The MAST study (Qian et al., 2025) provides the most comprehensive analysis to date, examining 1,642 execution traces across seven frameworks including MetaGPT, ChatDev, and HyperAgent. Failure rates ranged from 41% to 86.7%, with inter-agent misalignment causing 32.3% of all failures.

AutoGen (Wu et al., 2024) introduced flexible multi-agent conversations, while MetaGPT (Hong et al., 2024) brought role-based collaboration. Both frameworks were included in the MAST analysis.

Other notable work includes AgentVerse (Chen et al., 2023) which demonstrated that group dynamics between agents can lead to conformity bias, and the CAMEL framework (Li et al., 2023) which explored role-playing approaches. Research by Park et al. (2023) on generative agents showed emergent social behaviors but also coordination breakdowns. The ReAct framework (Yao et al., 2023) highlighted how reasoning and acting loops can compound errors in multi-agent settings.

The key categories of failure from MAST are:
- System Design Issues (44.2%): fundamental architectural problems
- Inter-Agent Misalignment (32.3%): agents failing to communicate effectively
- Task Verification (23.5%): inability to validate outputs

The implication is clear: building reliable multi-agent systems requires not just better models, but better protocols for how agents communicate and transfer context between each other.`,
  pbOutput: `# Multi-Agent LLM Coordination Failures

When multiple LLM agents work together, they fail between 41% and 86.7% of the time. This is the central finding of the MAST study (arXiv:2503.13657), a NeurIPS 2025 spotlight paper that analyzed 1,642 real execution traces across seven production frameworks.

**The Scale of the Problem**

MAST examined MetaGPT, ChatDev, HyperAgent, OpenManus, AppWorld, Magentic, and AG2. The authors -- including Matei Zaharia and Ion Stoica -- identified 14 distinct failure modes in three categories: System Design Issues (44.2% of failures), Inter-Agent Misalignment (32.3%), and Task Verification (23.5%). The inter-annotator agreement was kappa = 0.88, indicating high reliability.

**Why Agents Miscommunicate**

The inter-agent misalignment category is the most actionable. Its sub-modes include Information Withholding (8.2%), where one agent fails to pass critical constraints to the next. Ignored Other Agent's Input (6.2%), where a receiving agent disregards what it was given. And Fail to Ask for Clarification (12.4%), where ambiguous handoffs go unquestioned.

These are not model capability failures. They are information transfer failures.

**Framework Contributions**

AutoGen (arXiv:2308.08155) established flexible multi-agent conversation patterns that enable these complex pipelines. MetaGPT (arXiv:2308.00352, ICLR 2024) introduced role-based collaboration where agents take on defined software engineering roles. Both were analyzed in MAST, and both showed significant failure rates.

**The Gap**

MAST tested two interventions -- improved role specifications and enhanced orchestration -- and found neither sufficient. The content of what passes between agents at handoff remains an unaddressed intervention point.`,
  rawJudgeScores: {
    constraintAdherence: 4,
    goalCompletion: 6,
    artifactFidelity: 1,
    total: 37,
  } as JudgeScores,
  pbJudgeScores: {
    constraintAdherence: 8,
    goalCompletion: 8,
    artifactFidelity: 9,
    total: 83,
  } as JudgeScores,
};

// ================================================================
// Ground truth decisions for recall scoring
// ================================================================

const codeReviewGroundTruth = [
  { constraint: "REST-only architecture, no GraphQL", present: true },
  { constraint: "JWT must use RS256 signing", present: true },
  { constraint: "Rate limiting at 100 req/min on public endpoints", present: true },
];

const customerSupportGroundTruth = [
  { constraint: "Refund $200, not credit", present: true },
  { constraint: "Change tier to Pro immediately", present: true },
  { constraint: "Do not ask customer to re-submit downgrade", present: true },
];

const researchSummarizerGroundTruth = [
  { constraint: "Only cite MAST, AutoGen, MetaGPT", present: true },
  { constraint: "Write for practitioners, not academics", present: true },
  { constraint: "Under 500 words", present: true },
];

// ================================================================
// Assembled scenarios
// ================================================================

export const scenarios: Record<ScenarioId, Scenario> = {
  "code-review": {
    id: "code-review",
    trace: codeReviewTrace,
    groundTruthDecisions: codeReviewGroundTruth,
    preCommittedOutputs: codeReviewOutputs,
  },
  "customer-support": {
    id: "customer-support",
    trace: customerSupportTrace,
    groundTruthDecisions: customerSupportGroundTruth,
    preCommittedOutputs: customerSupportOutputs,
  },
  "research-summarizer": {
    id: "research-summarizer",
    trace: researchSummarizerTrace,
    groundTruthDecisions: researchSummarizerGroundTruth,
    preCommittedOutputs: researchSummarizerOutputs,
  },
};

export const scenarioList: { id: ScenarioId; label: string; shortDescription: string }[] = [
  {
    id: "code-review",
    label: "CodeReview",
    shortDescription: "Information Withholding (8.2%)",
  },
  {
    id: "customer-support",
    label: "CustomerSupport",
    shortDescription: "Conversation Reset (2.8%)",
  },
  {
    id: "research-summarizer",
    label: "ResearchSummarizer",
    shortDescription: "Ignored Other Agent's Input (6.2%)",
  },
];
