const path = require('path');

module.exports = {
  experiments: {
    asyncWebAssembly: true, // Enable async WebAssembly loading
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};