declare type Level = 'debug' | 'info' | 'error';
declare class Logger {
    start: number;
    level: Level;
    constructor(level?: Level);
    _log(msg: string, lvl?: string): void;
    debug(msg: string): void;
    info(msg: string): void;
    error(msg: string): void;
}
interface Module {
    reasons: Reason[];
    userRequest: string;
    rawRequest: string;
}
interface Reason {
    module: Module;
}
interface Compiler {
    hooks: {
        done: {
            tap: (name: string, done: (stats: Stats) => void) => void;
        };
    };
}
interface Chunk {
    name: string;
    files: string[];
    _modules: Map<Module, Module>;
}
interface Stats {
    compilation: {
        chunks: Chunk[];
    };
}
export interface BundleRestrictPluginOptions {
    chunk: string;
    modules?: string[];
    maxStackDepth?: number;
    maxStackWidth?: number;
    indent?: number;
}
/**
 * Plugin to ensure specific modules are not part of the main webpack bundle after compilation.
 * @param {Object} opts - options, as a `{chunk: string, modules: string}` object, where:
 *      * `chunk`: Name of the chunk that should be examined.
 *                 This can contain either the chunk name (e.g.: my-package)
 *                 or a chunk file name (e.g.: x.bundle.js)
 *      * `modules`: List of restricted modules. If any of the module specified there are found
 *                 in the specified bundle, the plugin will raise an error.
 *      * `maxStackDepth`: Maximum depth of the printed import stack trace (default: 3)
 *      * `maxStackWidth`: Maximum width of the printed import stack trace (default: 3)
 *      * `indent`: size of each level of indent (default: 2)
 */
export default class BundleRestrictPlugin {
    opts: {
        chunk: string;
        modules: string[];
        maxStackDepth: number;
        maxStackWidth: number;
        indent: number;
    };
    _prefix: string;
    constructor(opts: BundleRestrictPluginOptions);
    _printReasons(mod: Module, text: string, logger: Logger): void;
    _printOffenseDetails(offenders: {
        [key: string]: Module;
    }, logger: Logger): void;
    apply(compiler: Compiler): void;
}
export {};
