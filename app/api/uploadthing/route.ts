import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // Necesario en VPS/proxies: indica a UploadThing dónde hacer el callback.
    // En local usa http://localhost:3000; en producción usa https://alsolnpl.eu
    callbackUrl: `${process.env.APP_URL}/api/uploadthing`,
  },
});
