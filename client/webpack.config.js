const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

module.exports = {
  devtool: "source-map",
  plugins: [
    sentryWebpackPlugin({
      org: "messanger",
      project: "javascript-angular",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        filesToDeleteAfterUpload: './dist/**/*.map'
      }
    }),
  ],
};
