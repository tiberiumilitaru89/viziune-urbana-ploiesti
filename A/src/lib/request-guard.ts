export class PayloadTooLargeError extends Error {
  readonly maxBytes: number;

  constructor(maxBytes: number) {
    super(`Payload exceeds limit of ${maxBytes} bytes`);
    this.name = "PayloadTooLargeError";
    this.maxBytes = maxBytes;
  }
}

export class InvalidJsonBodyError extends Error {
  constructor(message = "Invalid JSON payload") {
    super(message);
    this.name = "InvalidJsonBodyError";
  }
}

/**
 * Reads a JSON request body on stream enforcing a strict pre-parse byte cap.
 */
export async function readJsonWithLimit(req: Request, maxBytes: number): Promise<unknown> {
  const rawLength = req.headers.get("content-length");
  if (rawLength !== null) {
    const parsedLength = Number(rawLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      throw new PayloadTooLargeError(maxBytes);
    }
  }

  if (!req.body) {
    throw new InvalidJsonBodyError("Request body is empty");
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new PayloadTooLargeError(maxBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (totalBytes === 0) {
    throw new InvalidJsonBodyError("Request body is empty");
  }

  const rawText = Buffer.concat(chunks, totalBytes).toString("utf8");
  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    throw new InvalidJsonBodyError();
  }
}
