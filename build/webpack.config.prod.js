var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: {
    script: ['./src/js/main.js'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          esModule: false,
          outputPath: 'css/'
        }
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              esModule: false,
              outputPath: './resources/'
            }
          },
          'image-webpack-loader'
        ]
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: ['img:src', 'link:href']
          }
        }
      },
      {
        test: /\.(glsl)$/,
        use: {
          loader: 'raw-loader',
          options: {
            esModule: false
          }
        }
      }
    ]
  }
}
