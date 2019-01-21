"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PLUGIN_NAME = 'Bundle Restrict Plugin';
const INDENT_SIZE = 2;
const MAX_STACK_WIDTH = 3;
const MAX_STACK_DEPTH = 3;
class Logger {
    constructor(level) {
        this.start = Date.now();
        this.level = level || 'info';
    }
    _log(msg, lvl) {
        console.log(`[${PLUGIN_NAME}]${lvl ? `${lvl}: ` : ''}${msg}`); // tslint:disable-line:no-console
    }
    debug(msg) {
        if (this.level !== 'debug') {
            return;
        }
        this._log(msg, 'Debug');
    }
    info(msg) {
        if (this.level !== 'debug' && this.level !== 'info') {
            return;
        }
        this._log(msg);
    }
    error(msg) {
        this._log(msg, 'Error');
    }
}
class ImportTreePrinter {
    constructor(root, indent) {
        this.root = {
            children: [],
            parent: null,
            content: root,
            width: 0,
            depth: -1
        };
        this.curPointer = this.root;
        this.indent = indent;
        this._lastNodeAtDepth = {};
    }
    /**
     * Add a node to the tree at the provided depth.
     * The nodes are added incrementally - depth indicates whether to add a
     * child or a sibling to the last added node.
     * If depth is lower than the depth of the last added node, a sibling of the
     * proper ancestor will be added instead
     * If depth is the same as the last added node, a sibling will be added
     * If depth is larger than the last added node, a child will be added.
     *      Note that in this case, a child of the last added node is created
     *      no matter how larger the passed depth is to the last added node
     * @param text  node content
     * @param depth depth of the node to add
     */
    addNodeIncrementally(text, depth) {
        let newNode;
        if (depth === this.curPointer.depth) {
            if (this.curPointer.parent) {
                newNode = {
                    children: [],
                    content: text,
                    parent: this.curPointer.parent,
                    depth: depth,
                    width: this.curPointer.parent.children.length
                };
                this.curPointer.parent.children.push(newNode);
            }
            else {
                throw new Error("Trying to add a sibling to the root!");
            }
        }
        else if (depth > this.curPointer.depth) {
            newNode = {
                children: [],
                content: text,
                parent: this.curPointer,
                depth: this.curPointer.depth + 1,
                width: this.curPointer.children.length
            };
            this.curPointer.children.push(newNode);
        }
        else {
            while (depth < this.curPointer.depth) {
                if (this.curPointer.parent) {
                    this.curPointer = this.curPointer.parent;
                }
                else {
                    throw new Error('Trying to add a sibling to the root!');
                }
            }
            this.addNodeIncrementally(text, depth);
            return;
        }
        this.curPointer = newNode;
    }
    /**
     * Check whether the given node is a leaf (has no children)
     * @param node node to check
     */
    _isLeaf(node) {
        return node.children.length === 0;
    }
    /**
     * Check whether the given node is the last of the brotherhood (doesn't have any more sibling)
     * @param node node to check
     */
    _isLastChild(node) {
        return !node.parent || node.width === node.parent.children.length - 1;
    }
    _pp(logger, node) {
        this._lastNodeAtDepth[node.depth] = node;
        let prefix = '';
        // note: root node has a depth or -1
        for (let i = -1; i < node.depth; i++) {
            prefix += (this._isLastChild(this._lastNodeAtDepth[i]) ? ' ' : '│') + ' '.repeat(this.indent);
        }
        if (!node.parent) {
            prefix += '─' + '─'.repeat(this.indent);
        }
        else {
            prefix += (this._isLastChild(node) ? '╰' : '├') + '─'.repeat(this.indent);
        }
        logger.info(`${prefix}` +
            `${this._isLeaf(node) ? '─' : '┬'}${this.indent > -1 ? '─' : ''} ` +
            `${node.content}`);
        for (const child of node.children) {
            this._pp(logger, child);
        }
    }
    /**
     * Pretty Print the tree built so far
     * @param indent Indentation size
     */
    prettyPrint(logger) {
        this._pp(logger, this.root);
    }
}
class ReasonsTraversal {
    constructor(mod, maxStackDepth, maxStackWidth, logger) {
        this.mod = mod;
        this.maxStackDepth = maxStackDepth;
        this.maxStackWidth = maxStackWidth;
        this.breadthFirstEncounters = {};
        this.depthFirstEncounters = new Set();
        this.logger = logger;
    }
    _breadthFirst(mod, cb) {
        const q = mod.reasons.map((reason, idx) => ({
            reason,
            width: idx,
            depth: 0,
        }));
        let entry = q.shift();
        while (entry) {
            const { reason, depth } = entry;
            if (depth < this.maxStackDepth) {
                const reasons = (reason.module && reason.module.reasons) || [];
                for (let i = 0; i < reasons.length; i++) {
                    if (i >= this.maxStackWidth) {
                        break;
                    }
                    q.push({
                        reason: reasons[i],
                        depth: depth + 1,
                        width: i,
                    });
                }
                if (reason.module && reason.module.userRequest) {
                    cb(entry);
                }
            }
            entry = q.shift();
        }
    }
    _depthFirst(mod, cb, depth) {
        if (depth >= this.maxStackDepth) {
            this.logger.debug(// tslint:disable-line
            `[DFT] ${' '.repeat(depth)}Recurse stopped: too deep` +
                `(depth:${depth} >= maxStackDepth: ${this.maxStackDepth}`);
            return;
        }
        if (mod.reasons.length === 0) {
            this.logger.debug(`[DFT] ${' '.repeat(depth)}Recurse stopped: no child`); // tslint:disable-line
        }
        let width = 0;
        for (const reason of mod.reasons) {
            if (reason.module && reason.module.userRequest) {
                // don't recurse if we've already seen this file at a
                // lower level during breadth-first traversal
                const bftSeen = this.breadthFirstEncounters[reason.module.userRequest];
                if (bftSeen && bftSeen.depth < depth) {
                    this.logger.debug(`[DFT] ${' '.repeat(depth)}Ignore from BFT: ` + reason.module.userRequest); // tslint:disable-line
                    continue;
                }
                // don't recurse if we've already seen this file during depth-first traversal either.
                const dftSeen = this.depthFirstEncounters.has(reason.module.userRequest);
                if (dftSeen) {
                    this.logger.debug(`[DFT] ${' '.repeat(depth)}Ignore from DFT: ` + reason.module.userRequest); // tslint:disable-line
                    continue;
                }
                cb({ reason, depth, width });
                this.depthFirstEncounters.add(reason.module.userRequest);
                this.logger.debug(`[DFT] ${' '.repeat(depth)}Recurse for: ` + reason.module.userRequest); // tslint:disable-line
                this._depthFirst(reason.module, cb, depth + 1);
            }
            width += 1;
            if (width >= this.maxStackWidth) {
                this.logger.debug(// tslint:disable-line
                `[DFT] ${' '.repeat(depth)} Traversal stopped: ` +
                    `too wide (width:${width} >= maxStackWidth:${this.maxStackWidth}`);
                break;
            }
        }
    }
    traverse(cb) {
        // FIXME: can't get this function to complete? :(
        this.breadthFirstEncounters = {};
        this.depthFirstEncounters = new Set();
        // To properly print the import traces, we have to go through the import graph depth-first
        // this means if a a file depends on one of the restricted modules directly,
        // AND depends on the restricted modules indirectly, we're going to show both of them.
        // If we save the files we've seen for later user in depth-first traversal, we might end up showing
        // the longest dependency chain rather than the direct one if we get to this one first
        // Instead, first go through a breadth-first traversal within the specified limit to see which files are
        // gonna be seen first and at which depth, then during the depth ignore the files whenever we're
        // deeper than the depth we were the first time we encountered it in breadth first traversal.
        this._breadthFirst(this.mod, ({ reason, depth, width }) => {
            if (!this.breadthFirstEncounters[reason.module.userRequest]) {
                this.breadthFirstEncounters[reason.module.userRequest] = {
                    depth,
                    width,
                };
            }
        });
        this._depthFirst(this.mod, cb, 0);
    }
}
const _default = (def, val) => {
    return val === undefined ? def : val;
};
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
class BundleRestrictPlugin {
    constructor(opts) {
        this.opts = {
            chunk: opts.chunk,
            modules: opts.modules || [],
            maxStackDepth: _default(MAX_STACK_DEPTH, opts.maxStackDepth),
            maxStackWidth: _default(MAX_STACK_WIDTH, opts.maxStackWidth),
            indent: _default(INDENT_SIZE, opts.indent),
        };
        this._prefix = process.cwd();
    }
    _printReasons(mod, text, logger) {
        const traversal = new ReasonsTraversal(mod, this.opts.maxStackDepth, this.opts.maxStackWidth, logger);
        const importTrace = new ImportTreePrinter(text, this.opts.indent);
        traversal.traverse(({ reason, depth }) => {
            const file = reason.module.userRequest.replace(this._prefix, '.');
            importTrace.addNodeIncrementally(`from: ${file}`, depth);
        });
        importTrace.prettyPrint(logger);
    }
    _printOffenseDetails(offenders, logger) {
        for (const key in offenders) {
            if (offenders.hasOwnProperty(key)) {
                const mod = offenders[key];
                this._printReasons(mod, `[${PLUGIN_NAME}] Error: Restricted module \`${key}' ` +
                    `found in bundle \`${this.opts.chunk}'`, logger);
            }
        }
    }
    apply(compiler) {
        const done = (stats) => {
            const logger = new Logger();
            logger.info(`Asserting absence of modules \`${this.opts.modules.join(', ')}' ` +
                `in chunk: \`${this.opts.chunk}' (maxStackDepth=${this.opts.maxStackDepth}, ` +
                `maxStackWidth=${this.opts.maxStackWidth})`);
            const chunks = stats.compilation.chunks;
            const chunk = chunks.find((chunk) => chunk.name === this.opts.chunk ||
                chunk.files.indexOf(this.opts.chunk) >= 0);
            const offenders = {};
            let modCount = 0;
            if (chunk) {
                for (const mod of chunk._modules.values()) {
                    modCount += 1;
                    if (this.opts.modules.indexOf(mod.rawRequest) >= 0) {
                        offenders[mod.rawRequest] = mod;
                    }
                }
            }
            if (Object.keys(offenders).length > 0) {
                this._printOffenseDetails(offenders, logger);
                // throws to halt the compilation with a non-0 exit code
                const msg = (`Restricted module(s) \`${Object.keys(offenders).join("', `")} '` +
                    `present in main bundle chunk \`${this.opts.chunk}'.`);
                logger.error(msg);
                throw new Error(msg);
            }
            else {
                logger.info(`Restricted module(s) \`${this.opts.modules.join("', `")}' ` +
                    `absent from bundle chunk \`${this.opts.chunk}' (${modCount} module processed).`);
            }
        };
        compiler.hooks.done.tap(PLUGIN_NAME, done);
    }
}
exports.default = BundleRestrictPlugin;
