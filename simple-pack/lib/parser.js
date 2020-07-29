const fs = require('fs');
// 生成AST,也可以使用@babel/parser,用法与babylon一致
const babylon = require('babylon');
// 获取依赖
const traverse = require('babel-traverse').default;
// AST转换为源码，或者使用@babel/core
const {transformFromAst} = require('babel-core');

module.exports = {
    // ES6生成AST
    getAST: (path) => {
        const source = fs.readFileSync(path, 'utf-8');
        return babylon.parse(source, {
            sourceType: 'module'
        });
    },
    // 分析依赖
    getDependencies: (ast) => {
        const dependencies = [];
        traverse(ast, {
            // 用来分析import语句,获取依赖
            ImportDeclaration: ({node}) => {
                // Node {
                //     type: 'ImportDeclaration',
                //     start: 0,
                //     end: 39,
                //     loc: SourceLocation {
                //         start: [Position],
                //         end: [Position]
                //     },
                //     specifiers: [
                //         [Node]
                //     ],
                //     source: Node {
                //         type: 'StringLiteral',
                //         start: 23,
                //         end: 38,
                //         loc: [SourceLocation],
                //         extra: [Object],
                //         value: './greeting.js'
                //     }
                // },
                // 解析node节点
                dependencies.push(node.source.value);
            }
        });
        return dependencies;
    },
    // AST转换为源码
    transform: (ast) => {
        const {code} = transformFromAst(ast, null, {
            presets: ['env']
        });
        return code;
    }
};
