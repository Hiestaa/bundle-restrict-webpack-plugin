exports.greenNoModule = `[Bundle Restrict Plugin] Asserting absence of modules \`' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`' absent from bundle chunk \`test.js' (1 module processed).
`;
exports.greenHttpModule = `[Bundle Restrict Plugin] Asserting absence of modules \`http' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`http' absent from bundle chunk \`test.js' (1 module processed).
`;
exports.greenHttpFsCryptoModule = `[Bundle Restrict Plugin] Asserting absence of modules \`http', \`fs', \`crypto' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`http', \`fs', \`crypto' absent from bundle chunk \`test.js' (1 module processed).
`;
exports.redNoModule = `[Bundle Restrict Plugin] Asserting absence of modules \`' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`' absent from bundle chunk \`test.js' (4 module processed).
`;
exports.redHttpModule = `[Bundle Restrict Plugin] Asserting absence of modules \`http' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`http' absent from bundle chunk \`test.js' (4 module processed).
`;
exports.redLodashModuleErr = `Error: Restricted module(s) \`lodash' present in main bundle chunk \`test.js'.`;
exports.redLodashModuleOutput = `[Bundle Restrict Plugin] Asserting absence of modules \`lodash' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] ┬─ Error: Restricted module \`lodash' found in bundle \`test.js'
[Bundle Restrict Plugin] ╰──── from: ./test/targets/red/index.js
[Bundle Restrict Plugin] Error: Restricted module(s) \`lodash' present in main bundle chunk \`test.js'.
`;
exports.red2LodashModuleOutput = `[Bundle Restrict Plugin] Asserting absence of modules \`lodash' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] ┬─ Error: Restricted module \`lodash' found in bundle \`test.js'
[Bundle Restrict Plugin] ├──┬─ from: ./test/targets/red2/import1.js
[Bundle Restrict Plugin] │  ╰──── from: ./test/targets/red2/index.js
[Bundle Restrict Plugin] ╰──┬─ from: ./test/targets/red2/import2.1.js
[Bundle Restrict Plugin]    ╰──── from: ./test/targets/red2/import2.js
[Bundle Restrict Plugin] Error: Restricted module(s) \`lodash' present in main bundle chunk \`test.js'.
`;
exports.yellowNoModule = `[Bundle Restrict Plugin] Asserting absence of modules \`' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`' absent from bundle chunk \`test.js' (1 module processed).
`;
exports.yellowLodashModule = `[Bundle Restrict Plugin] Asserting absence of modules \`lodash' in chunk: \`test.js' (maxStackDepth=3, maxStackWidth=3)
[Bundle Restrict Plugin] Restricted module(s) \`lodash' absent from bundle chunk \`test.js' (1 module processed).
`;
