import { requireAuth } from '@/lib/auth-server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  meetiUploader: f({
    image: { maxFileSize: '1MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      console.log(req);
      const { session } = await requireAuth();
      if (!session) throw new UploadThingError('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),

  taskAttachmentsUploader: f({
    blob: { maxFileSize: '8MB', maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      console.log(req);
      const { session } = await requireAuth();
      if (!session) throw new UploadThingError('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);
      return { uploadedBy: metadata.userId, name: file.name, size: file.size };
    }),

  // ─── NPL: imágenes ────────────────────────────────────────────────────────
  nplImageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const { session } = await requireAuth();
      if (!session) throw new UploadThingError('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('NPL image upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),

  // ─── NPL: documentos adjuntos (PDF, Word, Excel, etc.) ───────────────────
  nplAdjuntosUploader: f({
    blob: { maxFileSize: '16MB', maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const { session } = await requireAuth();
      if (!session) throw new UploadThingError('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('NPL adjunto upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);
      return { uploadedBy: metadata.userId, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
