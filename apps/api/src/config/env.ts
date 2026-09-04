import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),
  API_URL: z.string().default('http://localhost:8000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('super-secret-waani-jwt-token-key-change-in-production-min32chars'),
  CORS_ORIGIN: z.string().default('*'),

  // LLM Providers (Gemini is primary)
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  OPENAI_API_KEY: z.string().optional().default(''),

  // Voice Providers (Sarvam AI)
  SARVAM_API_KEY: z.string().optional().default(''),

  // Telephony (Exotel)
  EXOTEL_ACCOUNT_SID: z.string().optional().default(''),
  EXOTEL_API_KEY: z.string().optional().default(''),
  EXOTEL_API_TOKEN: z.string().optional().default(''),
  EXOTEL_SUBDOMAIN: z.string().default('api.exotel.com'),
  EXOTEL_CALLER_ID: z.string().optional().default(''),
  WEBHOOK_BASE_URL: z.string().default('http://localhost:8000'),
});

export const env = envSchema.parse(process.env);
