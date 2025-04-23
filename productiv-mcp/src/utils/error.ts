/**
 * Error codes for MCP server
 */
export enum ErrorCode {
  // Standard JSON-RPC error codes
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  
  // Custom error codes
  AuthenticationError = -32000,
  AuthorizationError = -32001,
  RateLimitExceeded = -32002,
  InvalidInputError = -32003,
  ApiError = -32004,
  CacheError = -32005
}

/**
 * Custom error class for MCP server errors
 */
export class McpError extends Error {
  readonly code: ErrorCode;
  readonly data?: any;

  constructor(code: ErrorCode, message: string, data?: any) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    this.data = data;
  }

  /**
   * Create a JSON-RPC error object from this error
   */
  toJsonRpcError() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

/**
 * Helper function to handle API errors consistently
 * 
 * @param error The error to handle
 * @param defaultMessage Default message to use if error is not an Error object
 * @returns A McpError with appropriate code and message
 */
export function handleApiError(error: unknown, defaultMessage: string = 'API error'): McpError {
  if (error instanceof McpError) {
    return error;
  }

  const message = error instanceof Error ? error.message : defaultMessage;
  const code = ErrorCode.ApiError;
  
  // If it's an Axios error with response data, include it
  const data = (error as any)?.response?.data;
  
  return new McpError(code, message, data);
}
