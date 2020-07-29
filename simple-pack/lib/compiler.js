const {getAST, getDependencies, transform} = require('./parser');
const path = require('path');
const fs = require('fs');
module.exports = class Compiler {
    constructor(options) {
        const {entry, output} = options;
        this.entry = entry;
        this.output = output;
        this.modules = [];
    }
    // 运行
    run() {
        const entryModule = this.buildModule(this.entry, true);
        this.modules.push(entryModule);
        this.modules.map((_module) => {
            _module.dependencies.map((dependency) => {
                this.modules.push(this.buildModule(dependency));
            });
        });
        this.emitFiles();
    }
    // 打包模块
    buildModule(filename, isEntry) {
        let ast;
        // 入口模块直接生成AST
        if (isEntry) {
            ast = getAST(filename);
        }
        // 依赖文件获取绝对路径，生成AST
        else {
            // 依赖文件根据相对路径，生成绝对路径
            const absolutePath = path.join(process.cwd(), './src', filename);
            ast = getAST(absolutePath);
        }
        return {
            filename,
            dependencies: getDependencies(ast),
            source: transform(ast)
        };
    }
    // 输出文件
    emitFiles() {
        const outputPath = path.join(this.output.path, this.output.filename);
        let modules = '';
        this.modules.map((_module) => {
            modules += `'${_module.filename}': function(require, module, exports ) {${_module.source}},`;
        });
        // 包裹为自执行函数
        const bundle = `(function(modules) {
            function require(filename) {
                var fn = modules[filename];
                var module = {exports: {}};
                fn(require, module, module.exports);
                return module.exports;
            }
            require('${this.entry}');
        })({${modules}})`;
        fs.writeFileSync(outputPath, bundle, 'utf-8');
    }
};
