// API Configuration
// 讯飞 chatxunfei - 通过本地代理转发（解决 CORS 跨域）
export const API_CONFIG = {
  xunfei: {
    apiKey: '1952c6e2441118ac52e69d587ffa1a0b',
    apiSecret: 'ZTg2MmFjOGJkYzNkNDljN2M4MWMwNmIx',
    // 本地代理地址（server.js 会转发到讯飞 API）
    baseUrl: '/api/chat',
    model: 'xopqwen35v35b',
  },
};
