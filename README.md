# tRPC adapter for Azure Functions

This is a simple adapter for Azure Functions that allows you to use tRPC with Azure Functions.

> [!WARNING]
>
> This package only supports the v4 programming model of Azure Functions, and there's no plan for supporting older versions.

## Installation

Install the package using your preferred package manager:

```bash
npm install trpc-azure-adapter       # npm
yarn add trpc-azure-adapter          # yarn
pnpm add trpc-azure-adapter          # pnpm
```

## Usage

```typescript
import { app } from '@azure/functions';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
// 1. Import the `createAzureApiHandler` function from the package:
import { createAzureApiHandler } from 'trpc-azure-adapter';

const t = initTRPC.create();

// 2. Create a new tRPC router:
const appRouter = t.router({
  greeting: t.procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      return { msg: `Hello ${input.name}` };
    }),
});

export type AppRouter = typeof appRouter;

// 3. Use the `createAzureApiHandler` function to create a new Azure Functions handler passing in the tRPC router:
app.http('trpc', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: '{trpc}',
  handler: createAzureApiHandler({
    router: appRouter,
  }),
});
```

## TODOs

- [ ] Create example app

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
