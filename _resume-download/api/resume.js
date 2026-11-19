import { get } from '@vercel/blob';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.end('Method not allowed.');
    return;
  }

  if (new URL(request.url, 'https://download.invalid').search) {
    response.statusCode = 400;
    response.end('Invalid download URL.');
    return;
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error('Storage is not configured.');

    const result = await get('resume.pdf', {
      access: 'private',
      useCache: false,
      token,
      abortSignal: AbortSignal.timeout(10_000),
    });
    if (!result || result.statusCode !== 200 || result.blob.contentType !== 'application/pdf') {
      throw new Error('The current PDF is unavailable.');
    }

    const pdf = Buffer.from(await new Response(result.stream).arrayBuffer());
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="Alex-Rao-Resume.pdf"');
    response.setHeader('Content-Length', pdf.length);
    response.statusCode = 200;
    response.end(request.method === 'HEAD' ? undefined : pdf);
  } catch {
    response.setHeader('Retry-After', '60');
    response.statusCode = 503;
    response.end('Résumé download is temporarily unavailable. Please try again.');
  }
}
