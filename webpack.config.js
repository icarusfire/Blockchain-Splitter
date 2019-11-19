module.exports = {
    entry: "./app/js/app.js",
    output: {
        path: __dirname + "/build/app/js",
        filename: "app.js"
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ]
          },
          {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  outputPath: '../assets/fonts/'
                }
              }
            ]
          }     
        ]
    }
};