/**
 * api/_lib/provider-env.ts
 * Server-only helper for market data provider environment variables.
 * NEVER import this file from src/ (React client).
 * All keys must use process.env - NO VITE_ prefix.
 */

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export type ProviderEnvStatus = {
  finnhubConfigured: boolean;
  twelveDataConfigured: boolean;
  fredConfigured: boolean;
};

// -------------------------------------------------------------------------
// Status (boolean only - never exposes values)
// -------------------------------------------------------------------------

export function getProviderEnvStatus(): ProviderEnvStatus {
  return {
    finnhubConfigured: Boolean(process.env.FINNHUB_API_KEY?.trim()),
    twelveDataConfigured: Boolean(process.env.TWELVE_DATA_API_KEY?.trim()),
    fredConfigured: Boolean(process.env.FRED_API_KEY?.trim()),
  };
}

// -------------------------------------------------------------------------
// Require helpers - throw safe error codes, never expose values
// -------------------------------------------------------------------------

export function requireFinnhubApiKey(): string {
  const value = process.env.FINNHUB_API_KEY?.trim();
  if (!value) throw new Error('FINNHUB_NOT_CONFIGURED');
  return value;
}

export function requireTwelveDataApiKey(): string {
  const value = process.env.TWELVE_DATA_API_KEY?.trim();
  if (!value) throw new Error('TWELVE_DATA_NOT_CONFIGURED');
  return value;
}

export function requireFredApiKey(): string {
  const value = process.env.FRED_API_KEY?.trim();
  if (!value) throw new Error('FRED_NOT_CONFIGURED');
  return value;
}
