const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/board', {
      target:  process.env.BACKEND_IP || 'http://backend:4242'|| '10.18.232.220:8080',
      changeOrigin: true,
    }),
  );
};