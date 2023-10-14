import type { HttpHandler, HttpRequest } from '@azure/functions';
import {
  type AnyRouter,
  type inferRouterContext,
  TRPCError,
} from '@trpc/server';
import { getErrorShape } from '@trpc/server/shared';
import { resolveHTTPResponse } from '@trpc/server/http';

import {
  azureRequestToTrpcRequest,
  getTrpcPath,
  trpcResponseToAzureResponse,
} from './utils';
import type { AzureHandlerOptions } from './types';

export function createAzureApiHandler<TRouter extends AnyRouter>(
  opts: AzureHandlerOptions<TRouter, HttpRequest>
): HttpHandler {
  return async (request, context) => {
    const path = getTrpcPath(request);

    if (path === null) {
      const error = getErrorShape({
        config: opts.router._def._config,
        error: new TRPCError({
          message:
            'Route param "trpc" not found - does the route contain a parameter called "trpc"?',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        type: 'unknown',
        ctx: undefined,
        path: undefined,
        input: undefined,
      });
      return {
        status: 500,
        jsonBody: {
          id: -1,
          error,
        },
      };
    }

    async function createContext(): Promise<inferRouterContext<TRouter>> {
      return await opts.createContext?.({ request, context });
    }

    const req = await azureRequestToTrpcRequest(request, context);

    const response = await resolveHTTPResponse({
      router: opts.router,
      batching: opts.batching,
      responseMeta: opts.responseMeta,
      createContext,
      req,
      path,
      error: null,
      onError(o) {
        opts?.onError?.({
          ...o,
          req: request,
        });
      },
    });

    return trpcResponseToAzureResponse(response);
  };
}
