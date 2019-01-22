# bundle-restrict-webpack-plugin
Webpack Plugin to ensure specific packages are not included in specific webpack bundles

## Overview

Webpack has the awesome capability of doing [Code Splitting](https://webpack.js.org/guides/code-splitting/), allowing
client code to use heavy packages without further slowing down initial load time by delaying the load of such packages
to a later time.

This require dynamically importing these packages, and all modules statically importing these packages.
In largest code base, it may not be always obvious which modules are indirectly statically importing the packages
that should be kept separated from the main react bundle. A pesky misplaced static `import` might inflate the main
react bundle significantly without much warning other than the increase of compiled bundle size.

This plugin enables to define a set of restricted packages, and to fail compilation when any such package ends up in
the main webpack bundle.

## Usage

Basic usage consists in providing this plugin to webpack, configured with the name of the modules one wish to restrict
from the main bundle, and the name of such bundle:

> `webpack.config.js`
```js
const BundleRestrictPlugin = require('bundle-restrict-webpack-plugin').default;

const bundleRestrictor = new BundleRestrictPlugin({
    chunk: 'myproject.js',
    modules: ['lodash'],
});

module.exports = {
    mode: 'development',
    context: __dirname,
    entry: {
        myproject: path.resolve(__dirname, `src/index.js`)
    },
    output: {
        path: path.resolve(__dirname, '/dist'),
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
    },
    resolveLoader: {
        modules: [
            'node_modules',
        ],
    },
    plugins: [plugin]
};
```

Then run `webpack` command to produce the following output (on top of webpack regular output):

### No Error

```
[Bundle Restrict Plugin] Asserting absence of modules `lodash' in chunk: `myproject.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) `lodash' absent from bundle chunk `myproject.js' (1 module processed).
```

The compilation terminates successfully (0 error code), indicating the restricted packages are not present in the
tested bundle.

### With Error

```
[Bundle Restrict Plugin] Asserting absence of modules `lodash' in chunk: `myproject.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] ┬─ Error: Restricted module `lodash' found in bundle `myproject.js'
[Bundle Restrict Plugin] ├──┬─ from: ./src/import1.js
[Bundle Restrict Plugin] │  ╰──── from: ./src/index.js
[Bundle Restrict Plugin] ╰──┬─ from: ./src/import2.1.js
[Bundle Restrict Plugin]    ╰──── from: ./src/import2.js
[Bundle Restrict Plugin] Error: Restricted module(s) `lodash' present in main bundle chunk `test.js'.
```

The compilation is aborted by an error raised by the plugin, no compiled output will be produced.
The plugin renders a trace of the import stack that may help explaining how the restricted package got imported
in the tested bundle.

**Important Note**: Since the package is part of the main bundle, this will print the trace for all import of the
package. It is not limited to these that are causing the package to be included in the main bundle - webpack cannot
provide this information. It is thus left up to the user to figure out which of these import traces should
be broken (imported asynchronously).

## Configuration

The plugin is configured as such:

```
const options = {chunk: 'mybundle.js'};
const bundleRestrictor = new BundleRestrictPlugin(options);
```

Where `options` is an object supporting the following fields:

* `chunk` {string}: webpack chunk to analyse (name of the main chunk)
* `modules` {Array<string>} [optional]: list of restricted module names (default to empty list - no restriction)
* `maxStackDepth` {number} [optional]: maximum import stack depth (default to 3)
* `maxStackWidth` {number} [optional]: maximum import stack width (default to 3). That is, the maximum number of modules rendered that import each rendered module
* `indent` {number} [optional]: indentation size of the stack trace (default to 2)
* `capture` {boolean} [optional]: capture log output (available using `bundleRestrictor.getOutput()` rather than printing it.;
* `log` {string: 'info' | 'debug' | 'error'} [optional]: log level, default to `'info'`.;
