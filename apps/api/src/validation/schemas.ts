import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'OWNER', 'MEMBER']).default('MEMBER')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  summary: z.string().max(500).optional(),
  ownerMinPct: z.number().min(35).max(100).default(35),
  aliceCapPct: z.number().min(0).max(25).default(25),
  reservePct: z.number().min(0).max(100).default(40)
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  summary: z.string().max(500).optional(),
  ownerMinPct: z.number().min(35).max(100).optional(),
  aliceCapPct: z.number().min(0).max(25).optional(),
  reservePct: z.number().min(0).max(100).optional()
});

// Contribution schemas
export const proposeContributionSchema = z.object({
  taskId: z.string().cuid(),
  effort: z.number().min(1).max(100),
  impact: z.number().min(1).max(5),
  proposedPct: z.number().min(0.5).max(5)
});

export const acceptContributionSchema = z.object({
  finalPct: z.number().min(0.5).max(5)
});

export const counterContributionSchema = z.object({
  finalPct: z.number().min(0.5).max(5),
  message: z.string().max(500).optional()
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['CODE', 'DESIGN', 'GROWTH', 'OPS']),
  projectId: z.string().cuid(),
  sprintId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(['CODE', 'DESIGN', 'GROWTH', 'OPS']).optional(),
  status: z.enum(['TODO', 'DOING', 'REVIEW', 'DONE']).optional(),
  assigneeId: z.string().cuid().optional()
});

// Idea schemas
export const createIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  projectId: z.string().cuid().optional()
});

export const updateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
  status: z.enum(['BACKLOG', 'REVIEW', 'GREENLIT', 'IN_SPRINT', 'SHIPPED', 'ARCHIVED']).optional()
});

// Poll schemas
export const createPollSchema = z.object({
  question: z.string().min(1).max(500),
  type: z.enum(['YESNO', 'MC', 'RANK', 'SCORE']),
  closesAt: z.string().datetime(),
  projectId: z.string().cuid().optional(),
  options: z.array(z.string().min(1).max(100)).optional() // for MC polls
});

export const voteSchema = z.object({
  value: z.string().min(1).max(100)
});

// Kudos schema
export const createKudosSchema = z.object({
  toUserEmail: z.string().email(),
  message: z.string().min(1).max(500)
});

// Message schema
export const createMessageSchema = z.object({
  body: z.string().min(1).max(2000),
  projectId: z.string().cuid().optional()
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

// Project visibility schema
export const updateProjectVisibilitySchema = z.object({
  capTableHubMasked: z.boolean().optional(),
  tasksHubVisible: z.boolean().optional(),
  ideasHubVisible: z.boolean().optional(),
  pollsHubVisible: z.boolean().optional()
});

// Admin settings schema
export const updateAdminSettingsSchema = z.object({
  defaultOwnerMinPct: z.number().min(35).max(100).optional(),
  defaultAliceCapPct: z.number().min(0).max(25).optional(),
  defaultContributionMinPct: z.number().min(0.1).max(5).optional(),
  defaultContributionMaxPct: z.number().min(0.1).max(5).optional()
});
