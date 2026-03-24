import { router, protectedProcedure } from './trpc';
import { getExecutionActions, getExecutionSummary } from '../domains/execution/service';

export const executionRouter = router({
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    return getExecutionSummary(ctx.user.id);
  }),

  getActions: protectedProcedure.query(async ({ ctx }) => {
    return getExecutionActions(ctx.user.id);
  }),

  completeAction: protectedProcedure
    .input((val: { actionId: string }) => val)
    .mutation(async ({ input }) => {
      // Future: persist completion, update consistency score
      return { success: true, actionId: input.actionId };
    }),
});
