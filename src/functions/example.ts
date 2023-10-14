import { initTRPC } from '@trpc/server';
import { app } from '@azure/functions';
import superjson from 'superjson';
import { z } from 'zod';

import { createAzureApiHandler } from '../trpc';

const t = initTRPC.create({ transformer: superjson });
const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input, ctx }) => {
      return `Greetings, ${input.name}.`;
    }),
  post: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input, ctx }) => {
      return {
        text: `Greetings from POST, ${input.name}`,
        date: new Date(),
      };
    }),
});

export type AppRouter = typeof appRouter;

app.http('trpc', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: '{trpc}',
  handler: createAzureApiHandler({
    router: appRouter,
  }),
});
