const path = require('path')

module.exports = {
  resolve: {
    extensions: ['.js', '.ts']
  },
  target: 'node',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: 'dist/',
  }
}
