import type {
  HttpRequest as AzureRequest,
  HttpResponseInit as AzureResponseInit,
  InvocationContext,
} from '@azure/functions';

type TrpcRequest = Request;
type TrpcResponse = Response;

export function getTrpcPath(request: AzureRequest) {
  if (typeof request.params.trpc === 'string') {
    return request.params.trpc;
  }
  return null;
}

const methodsThatDontHaveBody = ['GET', 'HEAD', 'OPTIONS'];

export async function azureRequestToTrpcRequest(
  request: AzureRequest,
  _context: InvocationContext
): Promise<TrpcRequest | null> {
  let body;
  if (!methodsThatDontHaveBody.includes(request.method)) {
    body = await request.arrayBuffer();
  }

  return new Request(request.url, {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
  });
}

export async function trpcResponseToAzureResponse(
  response: TrpcResponse
): Promise<AzureResponseInit> {
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.arrayBuffer(),
  };
}
