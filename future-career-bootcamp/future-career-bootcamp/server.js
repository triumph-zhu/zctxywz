// 本地开发服务器 - 静态文件服务 + 讯飞 API 代理
// 用法: node server.js
// 替代 http-server，同时支持面试模拟器的 AI API 代理

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;

// 讯飞 API 配置
const XUNFEI_API_URL = 'https://maas-api.cn-huabei-1.xf-yun.com/v2/chat/completions';

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  // === API 代理路由（面试模拟器使用） ===
  if (req.url === '/api/chat' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const requestData = JSON.parse(body);

      // 构建转发请求 - 补上 Authorization header
      const apiKey = requestData.apiKey;
      const apiSecret = requestData.apiSecret;
      delete requestData.apiKey;
      delete requestData.apiSecret;

      const response = await fetch(XUNFEI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}:${apiSecret}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.text();

      res.writeHead(response.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    } catch (err) {
      console.error('Proxy error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // CORS preflight
  if (req.url === '/api/chat' && req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // === 静态文件服务 ===
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // 移除查询参数
  filePath = filePath.split('?')[0];
  filePath = path.join(__dirname, filePath);

  // 安全检查：防止路径穿越
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🚀 职场特训营数字知识库服务器已启动`);
  console.log(`   本地访问: ${url}`);
  console.log(`   面试模拟器: ${url}/interview.html`);
  console.log(`   API 代理: /api/chat → ${XUNFEI_API_URL}`);
  console.log(`\n   按 Ctrl+C 停止服务器\n`);

  // 自动打开浏览器
  const platform = process.platform;
  const command = platform === 'darwin' ? `open "${url}"`
    : platform === 'win32' ? `start "${url}"`
    : `xdg-open "${url}"`;
  exec(command, (err) => {
    if (err) console.log(`   (自动打开浏览器失败，请手动打开: ${url})`);
  });
});
