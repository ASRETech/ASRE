/**
 * financials.ts — Financial entries router
 * Extracted from routers.ts for modularization.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export const financialsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserFinancials(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({
      type: z.enum(["income", "expense"]),
      category: z.string(),
      description: z.string().optional(),
      amount: z.number(),
      date: z.string(),
      receiptUrl: z.string().optional(),
      receiptText: z.string().optional(),
      autoCategory: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.insertFinancialEntry({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
  categorizeReceipt: protectedProcedure
    .input(z.object({ receiptText: z.string() }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a real estate business expense categorizer. Given receipt text, extract the vendor, amount, date, and assign an IRS Schedule C category for a real estate agent. Categories: Advertising, Car/Truck Expenses, Commission/Fees, Insurance, Legal/Professional, Office Expense, Supplies, Travel, Meals, Education, MLS Dues, Lockbox Fees, Photography, Staging, Signs, Technology, Other.
Return JSON: { "vendor": string, "amount": number, "date": string, "category": string, "description": string }`,
          },
          { role: "user", content: input.receiptText },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "receipt_categorization",
            strict: true,
            schema: {
              type: "object",
              properties: {
                vendor: { type: "string" },
                amount: { type: "number" },
                date: { type: "string" },
                category: { type: "string" },
                description: { type: "string" },
              },
              required: ["vendor", "amount", "date", "category", "description"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      try {
        return JSON.parse(typeof content === "string" ? content : "{}");
      } catch {
        return { vendor: "", amount: 0, date: "", category: "Other", description: content || "" };
      }
    }),
  taxExport: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getFinancialEntriesByYear(ctx.user.id, input.year);
    }),
});
