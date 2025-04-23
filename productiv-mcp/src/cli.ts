#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import type { Signals } from 'node:process';

/**
 * CLI entry point for the Productiv MCP server
 */
async function main() {
  const serverPath = path.join(__dirname, 'server.js');
  
  // Check if the file exists
  if (!fs.existsSync(serverPath)) {
    console.error(`Error: Server file not found at ${serverPath}`);
    process.exit(1);
  }

  console.log('Starting Productiv MCP server...');
  
  // Start the server as a child process
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Handle server process events
  serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err);
    process.exit(1);
  });

  serverProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`Server process exited with code ${code} and signal ${signal}`);
      process.exit(code || 1);
    }
    process.exit(0);
  });

  // Handle termination signals
  const signals: Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`);
      serverProcess.kill(signal);
    });
  });
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
