// Test-only stand-in for the `server-only` package.
// In production builds the real package throws when imported into a client
// bundle. In tests we want server modules to be importable as-is.
export {};
