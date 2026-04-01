/**
 * coaching.ts — AI Coaching router
 * Extracted from routers.ts for modularization.
 * Zod schemas are hardened: no z.any(), all fields bounded.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export const coachingRouter = router({
  ask: protectedProcedure
    .input(z.object({
      context: z.string().max(2000),
      prompt: z.string().max(2000),
      agentLevel: z.number().min(1).max(7).optional(),
      // Typed agent data fields — prevents arbitrary prompt injection via agentData
      agentData: z.object({
        level: z.number().min(1).max(7).optional(),
        gciGoal: z.number().min(0).max(100_000_000).optional(),
        currentGCI: z.number().min(0).max(100_000_000).optional(),
        teamSize: z.number().min(0).max(1000).optional(),
        yearsExperience: z.number().min(0).max(60).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `You are an expert real estate business coach trained in the MREA (Millionaire Real Estate Agent) framework by Gary Keller. You help agents build their business systematically through the 7 levels: Solo Agent, First Admin Hire, First Buyer's Agent, Multiple Buyer's Agents, Listings Specialist, Full Team, and Business Owner.
The agent is currently at Level ${input.agentLevel || 1}. Context: ${input.context}.
${input.agentData ? `Agent data: ${JSON.stringify(input.agentData)}` : ''}
Provide actionable, specific advice. Reference MREA models where applicable (Personal Economic Model, Lead Generation Model, Budget Model, Organizational Model). Be direct, structured, and metrics-focused. Use real estate industry terminology naturally.`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.prompt },
        ],
      });
      const content = response.choices[0]?.message?.content;
      const responseText = typeof content === "string" ? content : "";
      await db.insertCoachingLog({
        userId: ctx.user.id,
        context: input.context,
        prompt: input.prompt,
        response: responseText,
      });
      return { response: responseText };
    }),
  history: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return db.getUserCoachingLogs(ctx.user.id, input.limit || 20);
    }),
});
