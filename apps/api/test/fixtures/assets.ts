export const assets = {
  '/index.html': { body: '<!doctype html><title>PWA</title>', base64: false, type: 'text/html; charset=utf-8', etag: '"idx"' },
  '/sw.js': { body: 'self.skipWaiting()', base64: false, type: 'text/javascript; charset=utf-8', etag: '"sw"' },
  '/assets/index-abc12345.js': { body: 'console.log(1)', base64: false, type: 'text/javascript; charset=utf-8', etag: '"js"' },
  '/icons/icon.png': { body: 'iVBORw0KGgo=', base64: true, type: 'image/png', etag: '"png"' },
};
