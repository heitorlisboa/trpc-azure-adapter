import type { HttpRequest, InvocationContext } from '@azure/functions';
import type { AnyTRPCRouter, inferRouterContext } from '@trpc/server';
import type { HTTPBaseHandlerOptions } from '@trpc/server/http';

type MaybePromise<T> = T | Promise<T>;

type AzureCreateContextFnOptions = {
  request: HttpRequest;
  context: InvocationContext;
};

type AzureCreateContextFn<TRouter extends AnyTRPCRouter> = (
  opts: AzureCreateContextFnOptions
) => MaybePromise<inferRouterContext<TRouter>>;

export type AzureHandlerOptions<
  TRouter extends AnyTRPCRouter,
  TRequest
> = HTTPBaseHandlerOptions<TRouter, TRequest> & {
  createContext?: AzureCreateContextFn<TRouter>;
};
