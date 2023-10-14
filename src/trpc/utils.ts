import type {
  HttpRequest as AzureRequest,
  HttpResponseInit as AzureResponseInit,
  InvocationContext,
} from '@azure/functions';
import type { HTTPRequest as TrpcRequest } from '@trpc/server/http';
import type { HTTPResponse as TrpcResponse } from '@trpc/server/dist/http/internals/types';

export function getTrpcPath(request: AzureRequest) {
  if (typeof request.params.trpc === 'string') {
    return request.params.trpc;
  }
  return null;
}

export async function azureRequestToTrpcRequest(
  request: AzureRequest,
  context: InvocationContext
): Promise<TrpcRequest> {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    context.log('Could not parse request body as JSON.');
  }

  return {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    query: request.query,
  };
}

export function trpcResponseToAzureResponse(
  response: TrpcResponse
): AzureResponseInit {
  const headers = response.headers;

  for (const headerKey in headers) {
    const headerValue = headers[headerKey];
    if (headerValue === undefined) {
      delete headers[headerKey];
    }
  }

  return {
    status: response.status,
    body: response.body,
    headers: headers as Record<string, string | string[]> | undefined,
  };
}
