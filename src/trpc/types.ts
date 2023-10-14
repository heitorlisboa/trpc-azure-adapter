import type { HttpRequest, InvocationContext } from '@azure/functions';
import type { AnyRouter, MaybePromise, inferRouterContext } from '@trpc/server';
import type { HTTPBaseHandlerOptions } from '@trpc/server/http';

type AzureCreateContextFnOptions = {
  request: HttpRequest;
  context: InvocationContext;
};

type AzureCreateContextFn<TRouter extends AnyRouter> = (
  opts: AzureCreateContextFnOptions
) => MaybePromise<inferRouterContext<TRouter>>;

export type AzureHandlerOptions<
  TRouter extends AnyRouter,
  TRequest
> = HTTPBaseHandlerOptions<TRouter, TRequest> & {
  createContext?: AzureCreateContextFn<TRouter>;
};
