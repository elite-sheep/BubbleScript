var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: "cheap-eval-source-map",
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/dev-server',
    './src/js/main.js'
  ],
  output : {
    path: path.join(__dirname, 'dist'),
    filename: "bundle.js"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ],
  module: {
    rules: [{
      test: /\.css$/,
      loaders: ['style', 'css']
    }]
  },
  devServer: {
    contentBase: './dist',
    hot: true
  }
}
