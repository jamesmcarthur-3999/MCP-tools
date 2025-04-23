import { ErrorCode as SdkErrorCode, McpError as SdkMcpError } from '@modelcontextprotocol/sdk/types.js';

/**
 * Error codes for MCP server
 * Extends the standard JSON-RPC error codes from the SDK
 */
export const ErrorCode = {
  ...SdkErrorCode,
  
  // Custom error codes
  AuthenticationError: -32000,
  AuthorizationError: -32001,
  RateLimitExceeded: -32002,
  InvalidInputError: -32602, // Same as InvalidParams in standard JSON-RPC
  ApiError: -32004,
  CacheError: -32005
};

/**
 * Custom error class for MCP server errors
 */
export class McpError extends SdkMcpError {
  readonly data?: any;

  constructor(code: number, message: string, data?: any) {
    super(code, message);
    this.data = data;
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
  const code = ErrorCode.InternalError;
  
  // If it's an Axios error with response data, include it
  const data = (error as any)?.response?.data;
  
  return new McpError(code, message, data);
}
