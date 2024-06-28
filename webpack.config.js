const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isPersonal = process.env.PERSONAL === 'true';


module.exports = {
    mode: "development",
    entry: {
        main: isPersonal ? './src/personal.js' : './src/index.js',
        wind: './src/wind.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg|bin)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            outputPath: 'assets/models/textures/',
                            publicPath: 'assets/models/textures/',
                        },

                    },
                ],
            },
            {
                test: /\.(txt|frag|vert)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.(glb|gltf|fbx)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                            outputPath: 'assets/models/',
                            publicPath: 'assets/models/',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body',
        }),
    ],
    devServer: {
        open:true,
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        client:{
            overlay:true
        },
        compress: true,
        port: 9000,
    },
};