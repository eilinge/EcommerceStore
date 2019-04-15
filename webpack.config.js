const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app/javascripts/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([{
        from: './app/index.html',
        to: "index.html"
      },
      {
        from: './app/list-item.html',
        to: "list-item.html"
      }
    ]),
    new webpack.DefinePlugin({
      ETHEREUM_NODE_URL: JSON.stringify(process.env.ETHEREUM_NODE_URL),
      IPFS_API_HOST: JSON.stringify(process.env.IPFS_API_HOST),
      IPFS_API_PORT: JSON.stringify(process.env.IPFS_API_PORT),
      IPFS_GATEWAY_URL: JSON.stringify(process.env.IPFS_GATEWAY_URL)
    })
  ],
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }],
    loaders: [{
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  },
  devServer: { //开发服务器配置对象
    host: '0.0.0.0', //在所有ip上进行监听 
    disableHostCheck: true, //禁止主机检查
    public: '0.0.0.0' //公开访问地址
  }
}
