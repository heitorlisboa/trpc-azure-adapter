import type {
  HttpRequest as AzureRequest,
  HttpResponseInit as AzureResponseInit,
  InvocationContext,
} from '@azure/functions';
import type {
  HTTPRequest as TrpcRequest,
  HTTPResponse as TrpcResponse,
} from '@trpc/server/http';

export function getTrpcPath(request: AzureRequest) {
  if (typeof request.params.trpc === 'string') {
    return request.params.trpc;
  }
  return null;
}

const methodsThatDontHaveBody = ['GET', 'HEAD', 'OPTIONS'];

export async function azureRequestToTrpcRequest(
  request: AzureRequest,
  context: InvocationContext
): Promise<TrpcRequest | null> {
  const body = await (async () => {
    if (methodsThatDontHaveBody.includes(request.method)) {
      return undefined;
    }

    const contentType = request.headers.get('content-type');

    if (contentType === 'application/json') {
      try {
        return await request.json();
      } catch (error) {
        context.error('Could not parse request body as JSON.');
        return null;
      }
    }

    if (contentType?.startsWith('multipart/form-data')) {
      try {
        return await request.formData();
      } catch (error) {
        context.error('Could not parse request body as FormData.');
        return null;
      }
    }

    // Fallback to using the request body as text
    try {
      return await request.text();
    } catch (error) {
      context.error('Could not parse request body as text.');
      return null;
    }
  })();

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
