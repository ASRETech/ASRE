/**
 * File storage helpers.
 * Uses AWS S3 when AWS_* env vars are set; otherwise stubs with a warning.
 * To enable: set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET.
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client(): S3Client | null {
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_REGION ||
    !process.env.AWS_S3_BUCKET
  ) {
    return null;
  }
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET;

  if (!client || !bucket) {
    console.warn("[Storage] S3 not configured — storagePut is a no-op");
    return { key, url: "" };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
}

export async function storageGet(
  key: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET;

  if (!client || !bucket) {
    console.warn("[Storage] S3 not configured — storageGet is a no-op");
    return { key, url: "" };
  }

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );

  return { key, url };
}
