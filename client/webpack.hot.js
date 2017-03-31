const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const webpackConfigBuilder = require('./config/webpack.config');
const clientApps = require('./libs/build/apps');

const app = express();

const localIp = '0.0.0.0';
const appName = argv._[0];

function launch(webpackOptions, servePath) {

  const webpackConfig = webpackConfigBuilder(webpackOptions);

  const compiler = webpack(webpackConfig);
  const webpackMiddlewareInstance = webpackMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    watch: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });

  app.use(express.static(servePath));

  app.use(webpackMiddlewareInstance);

  app.use(webpackHotMiddleware(compiler));

  app.get('*', (req, res) => {
    res.sendFile(path.join(servePath, req.url));
  });

  app.listen(webpackOptions.port, localIp, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Listening on: http://${localIp}:${webpackOptions.port}`);
    console.log(`Serving content from: ${servePath}`);
  });
}

const options = { stage: 'hot', onlyPack: false };
if (appName) {
  clientApps.buildApp(appName, options, launch);
} else {
  clientApps.buildApps(options, launch);
}
//const webpackConfigs = clientApps.buildApps(options, launch);
