import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

let blob;
const readBlob = mock.fn(async () => blob);
mock.module('@vercel/blob', { namedExports: { get: readBlob } });
const { default: handler } = await import('../api/resume.js');

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-only-storage-token';
  readBlob.mock.resetCalls();
  blob = {
    statusCode: 200,
    stream: new Response('%PDF-current').body,
    blob: { contentType: 'application/pdf' },
  };
});

async function download(method = 'GET', url = '/api/resume') {
  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = body; },
  };
  await handler({ method, url }, response);
  return response;
}

test('downloads only the fixed private file with fresh reads and no client caching', async () => {
  const response = await download();
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.toString(), '%PDF-current');
  assert.equal(response.headers['Content-Type'], 'application/pdf');
  assert.match(response.headers['Content-Disposition'], /^attachment;/);
  assert.match(response.headers['Cache-Control'], /no-store/);
  assert.equal(response.headers['CDN-Cache-Control'], 'no-store');
  assert.equal(response.headers['Vercel-CDN-Cache-Control'], 'no-store');
  const [path, options] = readBlob.mock.calls[0].arguments;
  assert.equal(path, 'resume.pdf');
  assert.equal(options.access, 'private');
  assert.equal(options.useCache, false);
});

test('a subsequent request downloads the replacement file', async () => {
  await download();
  blob.stream = new Response('%PDF-replacement').body;
  const response = await download();
  assert.equal(response.body.toString(), '%PDF-replacement');
  assert.equal(readBlob.mock.callCount(), 2);
});

test('HEAD returns download headers without a body', async () => {
  const response = await download('HEAD');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, undefined);
  assert.equal(response.headers['Content-Length'], 12);
});

test('version and filename parameters cannot select another file', async () => {
  for (const query of ['?version=old', '?ref=previous', '?path=other.pdf', '?download=1']) {
    const response = await download('GET', '/api/resume' + query);
    assert.equal(response.statusCode, 400);
  }
  assert.equal(readBlob.mock.callCount(), 0);
});

test('public requests cannot write or delete the file', async () => {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await download(method);
    assert.equal(response.statusCode, 405);
  }
  assert.equal(readBlob.mock.callCount(), 0);
});

test('missing files and unavailable storage fail without exposing upstream details', async () => {
  blob = null;
  const missing = await download();
  assert.equal(missing.statusCode, 503);
  assert.equal(missing.headers['Retry-After'], '60');
  delete process.env.BLOB_READ_WRITE_TOKEN;
  const unconfigured = await download();
  assert.equal(unconfigured.statusCode, 503);
  assert.doesNotMatch(unconfigured.body, /token|Storage|private/i);
});
