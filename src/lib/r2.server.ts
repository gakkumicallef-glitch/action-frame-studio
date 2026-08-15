// Server-only Cloudflare R2 (S3-compatible) helpers: SigV4 presigning with Web Crypto.
const enc = new TextEncoder();

function cfg() {
  const accountId = process.env['R2_ACCOUNT_ID'];
  const bucket = process.env['R2_BUCKET_NAME'];
  const accessKeyId = process.env['R2_ACCESS_KEY_ID'];
  const secretAccessKey = process.env['R2_SECRET_ACCESS_KEY'];
  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 is not configured (missing R2_* environment variables).');
  }
  return {
    accountId,
    bucket,
    accessKeyId,
    secretAccessKey,
    host: `${accountId}.r2.cloudflarestorage.com`,
    region: 'auto',
  };
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(data: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(data)));
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
}

function uriEncode(value: string, encodeSlash = true): string {
  return value
    .split('')
    .map((c) => {
      if (/[A-Za-z0-9\-_.~]/.test(c)) return c;
      if (c === '/') return encodeSlash ? '%2F' : '/';
      return Array.from(enc.encode(c))
        .map((b) => '%' + b.toString(16).toUpperCase().padStart(2, '0'))
        .join('');
    })
    .join('');
}

async function signingKey(secret: string, date: string, region: string): Promise<ArrayBuffer> {
  let key: ArrayBuffer | Uint8Array = enc.encode(`AWS4${secret}`);
  key = await hmac(key, date);
  key = await hmac(key, region);
  key = await hmac(key, 's3');
  return hmac(key, 'aws4_request');
}

/** Presign an S3 request against the R2 bucket and return an absolute URL. */
export async function presignR2(
  method: 'PUT' | 'GET',
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const { host, region, accessKeyId, secretAccessKey, bucket } = cfg();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const credentialScope = `${date}/${region}/s3/aws4_request`;
  const canonicalUri = `/${uriEncode(bucket, false)}/${uriEncode(key, false)}`;

  const params: Array<[string, string]> = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${accessKeyId}/${credentialScope}`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(expiresIn)],
    ['X-Amz-SignedHeaders', 'host'],
  ];
  const canonicalQuery = params
    .map(([k, v]) => [uriEncode(k), uriEncode(v)] as const)
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const signature = hex(await hmac(await signingKey(secretAccessKey, date, region), stringToSign));
  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/** Signed (header-auth) request used for bucket-level admin calls such as CORS. */
async function signedFetch(method: string, path: string, body: string, query = ''): Promise<Response> {
  const { host, region, accessKeyId, secretAccessKey } = cfg();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body);
  const credentialScope = `${date}/${region}/s3/aws4_request`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    method,
    path,
    query,
    `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');
  const signature = hex(await hmac(await signingKey(secretAccessKey, date, region), stringToSign));
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(`https://${host}${path}${query ? `?${query}` : ''}`, {
    method,
    headers: {
      authorization,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'content-type': 'application/xml',
    },
    body: body || undefined,
  });
}

let corsReady = false;

/** Allow browser PUT uploads straight to the bucket. Runs at most once per worker instance. */
export async function ensureR2Cors(): Promise<void> {
  if (corsReady) return;
  const { bucket } = cfg();
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<CORSConfiguration><CORSRule>' +
    '<AllowedOrigin>*</AllowedOrigin>' +
    '<AllowedMethod>PUT</AllowedMethod><AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod>' +
    '<AllowedHeader>*</AllowedHeader><ExposeHeader>ETag</ExposeHeader><MaxAgeSeconds>3600</MaxAgeSeconds>' +
    '</CORSRule></CORSConfiguration>';
  const res = await signedFetch('PUT', `/${uriEncode(bucket, false)}`, body, 'cors=');
  if (!res.ok) {
    console.error('[R2] Failed to set CORS', res.status, await res.text());
    return;
  }
  corsReady = true;
}
