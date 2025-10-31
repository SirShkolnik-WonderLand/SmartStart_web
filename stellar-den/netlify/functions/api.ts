import serverless from "serverless-http";

import { createServer } from "../../server";

let appPromise: Promise<any> | null = null;

export const handler = serverless(async (...args: any[]) => {
  if (!appPromise) {
    appPromise = createServer();
  }
  const app = await appPromise;
  return app(...args);
});
