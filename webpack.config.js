const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.?js|x$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', ['@babel/preset-react',  {"runtime": "automatic"}]]
                    }
                },
            },
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 
                {
                    loader: require.resolve('css-loader'),
                    options: {
                        importLoaders: 1,
                        modules: {
                            auto: (/** @type string */ resourcePath) => {
                                return !resourcePath.endsWith('.nomodule.css');
                            },
                            exportLocalsConvention: 'camelCase',
                            localIdentName: '[name]__[local]___[hash:base64:5]',
                        },
                    },
                }, {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: ['autoprefixer', 'tailwindcss']
                        }
                    }
                }]
              },
        ]
    },
    resolve: {
        extensions: [".jsx", ".js"],
    },
    plugins: [
        new HtmlWebpackPlugin({
        template: path.join(__dirname, "public", "index.html"),
        }),
    ],
}