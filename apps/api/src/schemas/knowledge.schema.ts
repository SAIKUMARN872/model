import { z } from "zod";
import { idSchema, paginationSchema } from "./common.schema.js";

export const knowledgeSearchSchema = z.object({
  query: z.string().trim().min(1).max(20000),
  collectionIds: z.array(idSchema).max(100).optional(),
  topK: z.number().int().min(1).max(100).default(5),
  includeCitations: z.boolean().default(true),
}).strict();

export const createKnowledgeCollectionSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().max(4000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const knowledgeCollectionQuerySchema = paginationSchema;
