var path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DefinePlugin = require("webpack").DefinePlugin;


module.exports = {
    entry: './src/main/js/app.js',
    devtool: 'sourcemaps',
    cache: true,
    mode: 'production',
    output: {
        path: __dirname,
        filename: './src/main/resources/static/js/bundle.js'
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],
    module: {
        rules: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }]
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    optimization: {
        minimizer: [new TerserPlugin({ /* additional options here */})],
    },
};