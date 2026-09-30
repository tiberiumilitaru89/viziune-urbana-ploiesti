import { Readable } from 'stream';

import express, { Router, type IRouter, type Request, type Response } from 'express';

import { ObjectPermission } from '../lib/objectAcl';
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from '../lib/objectStorage';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

function hasAuthenticatedSession(
  req: Request,
): req is Request & { isAuthenticated: () => boolean } {
  if (
    !('isAuthenticated' in req) ||
    typeof req.isAuthenticated !== 'function'
  ) {
    return false;
  }

  return req.isAuthenticated();
}

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 * Requires auth middleware so public callers cannot mint write-capable URLs.
 */
router.post(
  '/storage/uploads/request-url',
  async (req: Request, res: Response) => {
    if (!req.session?.isAdmin) {
      res.status(401).json({ error: 'Unauthorized' });

      return;
    }

    const { name, size, contentType } = req.body as { name?: string; size?: number; contentType?: string };
    if (!name || !size || !contentType) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
       if (objectStorageService.isLocalStorage()) {
         const target = objectStorageService.getLocalUploadTarget();
         res.json({
           uploadURL: target.uploadURL,
           objectPath: target.objectPath,
           metadata: { name, size, contentType },
         });
         return;
       }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        });
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * PUT /storage/local-uploads/:id
 *
 * Local development replacement for Replit's presigned upload URL.
 * Enabled only when STORAGE_PROVIDER=local.
 */
router.put(
  '/storage/local-uploads/:id',
  express.raw({ type: '*/*', limit: '10mb' }),
  async (req: Request, res: Response) => {
    if (!objectStorageService.isLocalStorage()) {
      res.status(404).json({ error: 'Local storage is not enabled' });
      return;
    }

    if (!req.session?.isAdmin) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
      if (body.length === 0) {
        res.status(400).json({ error: 'Empty upload' });
        return;
      }
      await objectStorageService.saveLocalUpload(
        Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
        req.headers['content-type'] || 'application/octet-stream',
        body,
      );
      res.status(201).json({ ok: true });
    } catch (error) {
      req.log.error({ err: error }, 'Error saving local object');
      res.status(500).json({ error: 'Failed to save object' });
    }
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get(
  '/storage/public-objects/*filePath',
  async (req: Request, res: Response) => {
    try {
      const raw = req.params.filePath;
      const filePath = Array.isArray(raw) ? raw.join('/') : raw;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const response = await objectStorageService.downloadObject(file);

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(
          response.body as ReadableStream<Uint8Array>,
        );
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      req.log.error({ err: error }, 'Error serving public object');
      res.status(500).json({ error: 'Failed to serve public object' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * These are served from a separate path from /public-objects and can optionally
 * be protected with authentication or ACL checks based on the use case.
 */
router.get('/storage/objects/*path', async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
    const objectPath = `/objects/${wildcardPath}`;

    if (objectStorageService.isLocalStorage()) {
      const localObject = await objectStorageService.getLocalObject(objectPath);
      res.setHeader('Content-Type', localObject.contentType);
      res.setHeader('Content-Length', String(localObject.size));
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(localObject.filePath);
      return;
    }

    const objectFile =
      await objectStorageService.getObjectEntityFile(objectPath);

    // --- Protected route example (uncomment when using replit-auth) ---
    // if (!req.isAuthenticated()) {
    //   res.status(401).json({ error: "Unauthorized" });
    //   return;
    // }
    // const canAccess = await objectStorageService.canAccessObjectEntity({
    //   userId: req.user.id,
    //   objectFile,
    //   requestedPermission: ObjectPermission.READ,
    // });
    // if (!canAccess) {
    //   res.status(403).json({ error: "Forbidden" });
    //   return;
    // }

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, 'Object not found');
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    req.log.error({ err: error }, 'Error serving object');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
