// This file is the entrypoint for this Cloudflare worker, which contains our API service.
// It uses the TRPC framework to handle requests and responses in a Type safe manner.
// It also has access to our Cloudflare D1 database, R2 bucket, and Clerk for authentication
// for securely storing and retrieving data.

// We use the getDB function from the db package to create the DrizzleDB dynamically, and pass
//it to the tRPC context.

// We set up the Clerk client in our tRPC context, so we need to pass the publishable key and 
// secret key set in our wrangler.toml. Production apps should use wrangler secrets to keep 
//your secrets out of your codebase.

// Additionally, in our package.json dev script, we set the ip flag to 0.0.0.0 to allow the API
//service to be accessed from Expo Go for local development

import { appRouter, createContext } from '@acme/trpc';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from "@acme/db";
import type { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = getDB(env);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Your existing TRPC handler
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: (opts: FetchCreateContextFnOptions) => createContext({
        ...opts,
        clerkPublicKey: env.CLERK_PUBLISHABLE_KEY,
        clerkSecretKey: env.CLERK_SECRET_KEY,
        db,
        imagesBucket: env.IMAGES_BUCKET
      }),
    });
  },
};
