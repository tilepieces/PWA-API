const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'minimatch.js',
    path: path.resolve(__dirname, '')
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify')
    }
  }
};