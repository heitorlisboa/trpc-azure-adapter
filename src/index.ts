import type { HttpHandler, HttpRequest } from '@azure/functions';
import {
  type AnyTRPCRouter,
  type inferRouterContext,
  TRPCError,
  getErrorShape as getTRPCErrorShape,
} from '@trpc/server';
import { resolveResponse } from '@trpc/server/http';

import {
  azureRequestToTrpcRequest,
  getTrpcPath,
  trpcResponseToAzureResponse,
} from './utils';
import type { AzureHandlerOptions } from './types';

export function createAzureApiHandler<TRouter extends AnyTRPCRouter>(
  opts: AzureHandlerOptions<TRouter, HttpRequest>
): HttpHandler {
  return async (request, context) => {
    const path = getTrpcPath(request);

    if (path === null) {
      const error = getTRPCErrorShape({
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

    let trpcRequest;
    try {
      trpcRequest = await azureRequestToTrpcRequest(request, context);
    } catch {
      const error = getTRPCErrorShape({
        config: opts.router._def._config,
        error: new TRPCError({
          message:
            'Error converting Azure request to tRPC request - make sure the request is valid.',
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

    const response = await resolveResponse({
      router: opts.router,
      allowBatching: opts.allowBatching,
      responseMeta: opts.responseMeta,
      createContext,
      req: trpcRequest,
      path,
      error: null,
      onError(o) {
        opts?.onError?.({
          ...o,
          req: request,
        });
      },
    });

    return await trpcResponseToAzureResponse(response);
  };
}
