/**
 * MCP Error codes based on JSON-RPC error codes
 */
export enum ErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ServerError = -32000,
  Unauthorized = 401,
  NotFound = 404,
  RateLimitExceeded = 429,
}

/**
 * Custom error class for MCP server errors
 */
export class McpError extends Error {
  code: ErrorCode;
  data?: any;

  constructor(code: ErrorCode, message: string, data?: any) {
    super(message);
    this.name = 'McpError';
    this.code = code;
    this.data = data;

    // Logging for better debugging
    console.error(`[Error] ${this.name} (${this.code}): ${this.message}`);
    if (this.data) {
      console.error(`[Error] Additional data:`, this.data);
    }
  }
}

/**
 * Helper functions for common error cases
 */
export const Errors = {
  /**
   * Create a not found error
   */
  notFound: (resource: string, id: string): McpError => {
    return new McpError(
      ErrorCode.NotFound,
      `${resource} not found with ID: ${id}`
    );
  },

  /**
   * Create an invalid parameter error
   */
  invalidParam: (param: string, reason: string): McpError => {
    return new McpError(
      ErrorCode.InvalidParams,
      `Invalid parameter '${param}': ${reason}`
    );
  },

  /**
   * Create an unauthorized error
   */
  unauthorized: (reason: string): McpError => {
    return new McpError(ErrorCode.Unauthorized, `Unauthorized: ${reason}`);
  },

  /**
   * Create a rate limit exceeded error
   */
  rateLimitExceeded: (limit: number, reset?: number): McpError => {
    const message = `Rate limit exceeded. Maximum ${limit} requests`;
    const data = reset ? { resetAt: new Date(reset * 1000).toISOString() } : undefined;
    return new McpError(ErrorCode.RateLimitExceeded, message, data);
  },

  /**
   * Create a server error
   */
  serverError: (error: Error): McpError => {
    return new McpError(
      ErrorCode.ServerError,
      `Server error: ${error.message}`,
      { stack: error.stack }
    );
  },
};
