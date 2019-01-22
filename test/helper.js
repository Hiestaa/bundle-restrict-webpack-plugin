var BundleRestrictPlugin = require('../lib').default;
var webpack = require("webpack");
var path = require("path");

exports.createCompiler = function (
    options = {},
    project = 'green',
    done
) {
    var plugin = new BundleRestrictPlugin({ chunk: 'test.js', ...options, capture: true });

    var webpackInstance = webpack({
        mode: 'development',
        context: path.resolve(__dirname, `targets/${project}`),
        entry: {
            test: path.resolve(__dirname, `targets/${project}/index.js`)
        },
        output: {
            path: path.resolve(__dirname, '../tmp'),
            filename: '[name].js',
            chunkFilename: '[name].bundle.js',
        },
        resolveLoader: {
            modules: [
                '../node_modules',
            ],
        },
        plugins: [plugin]
    });

    return {webpack: webpackInstance, plugin };
}

exports.compile = function(options, project, done) {
    var { webpack, plugin } = exports.createCompiler(options, project);
    const cb = (err, stats) => {
        if (!stats) {
            return done(err, null, plugin);
        }
        const info = stats.toJson();
        if (err) {
            err = new Error(err);
        } else if (stats.hasErrors()) {
            err = new Error(info.errors);
        } else if (stats.hasWarnings()) {
            err = new Error(info.warnings);
        }
        done(err, stats.toString(), plugin);
    };
    try {
        webpack.run(cb);
    } catch (err) {
        done(err, null, plugin);
    }
}
