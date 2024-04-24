# tRPC adapter for Azure Functions

This is a simple adapter for Azure Functions that allows you to use tRPC with Azure Functions.

> [!WARNING]
>
> This package only supports the v4 programming model of Azure Functions, and there's no plan for supporting older versions.

> [!NOTE]
>
> This package only supports tRPC v11, which is still a work in progress, but its functionality is [**stable and can be used in production**](https://github.com/trpc/trpc/blob/1b49f89c30bae4553ed73d267c774d7da42e154c/README.md?plain=1#L45). To install tRPC v11, you can use the following command:
>
> ```bash
> npm install @trpc/server@next
>
> # remember to also install @trpc/client@next on your client side
> npm install @trpc/client@next
> ```

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
