import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import cfetch from 'cross-fetch';
import superjson from 'superjson';

import type { AppRouter } from './functions/example';

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:7071/api',
      fetch(url, options) {
        return cfetch(url, {
          ...options,
        });
      },
    }),
  ],
});

(async () => {
  try {
    const queryResult = await client.greet.query({ name: 'Heitor' });
    const mutationResult = await client.post.mutate({ name: 'Heitor' });
    console.log([queryResult, mutationResult]);
  } catch (error) {
    console.error(error);
  }
})();
