const path = require('path'),
  fs = require('fs'),
  HTMLplugin = require('html-webpack-plugin'),
  CopyPlugin = require('copy-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
const PAGES_DIR = path.join(__dirname, 'src', 'pages');
const PAGES = fs
  .readdirSync(PAGES_DIR)
  .filter(fileName => fileName.endsWith('.pug'));

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src', 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
  },
  devServer: {
    port: 9000,
    static: {
      directory: path.join(__dirname, 'dist'),
      watch: true,
    },
    watchFiles: [`src/**/*`],
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        pathRewrite: {'^/api': ''},
        changeOrigin: true,
        secure: false,
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /\.module.(sa|sc|c)ss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('dart-sass'),
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.pug$/,
        use: 'pug-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      img: path.resolve(__dirname, 'src', 'images'),
      svg: path.resolve(__dirname, 'src', 'images', 'svg'),
      sass: path.resolve(__dirname, 'src', 'sass'),
      fonts: path.resolve(__dirname, 'src', 'fonts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  plugins: [
    ...PAGES.map(
      page =>
        new HTMLplugin({
          template: path.resolve(__dirname, 'src', 'pages', page),
          filename: `${page.replace(/\.pug/, '.html')}`,
        }),
    ),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'images'),
          to: path.join(__dirname, 'dist', 'img'),
        },
      ],
    }),
  ],
};
