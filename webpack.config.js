const path = require('path');

module.exports = {
  entry: './src/index.browser.ts',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.browser.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "os": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": false,
      "process": false
    }
  },
  output: {
    filename: 'game-engine.js',
    path: path.resolve(__dirname, 'frontend-web/dist'),
    library: 'GameEngineBackend',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  optimization: {
    minimize: false // 保持代码可读性，便于调试
  }
}; 