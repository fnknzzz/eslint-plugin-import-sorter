const defaultSettings = {
    order: ['a', 'b', 'c'],
    groups: {
        a: {
            member: {
                match: '',
                sorter: 'byName'
            },
            moduleName: '',
            separator: true,
        }
    }
}

const normalizeOption = ({ order, groups = {} }) => {
    const groupKeys = Object.keys(groups)
    return order.map(str => groupKeys.includes(str) ? groups[str] : ({
        moduleName: str
    }))
}

module.exports = {
    meta: {
        docs: {
            description: 'test',
            category: 'Possible Errors',
            recommended: false
        },
        schema: [],
        fixable: null
    },
    create(context) {
        var importNodes = []
        return {
            ImportDeclaration(node) {
                importNodes.push(node)
            },
            'Program:exit'() {
                var moduleNames = importNodes.map(node => node.source.value)
                for (var i = 0; i < moduleNames.length - 1; i++) {
                    if (moduleNames[i] > moduleNames[i + 1]) {
                        context.report({
                            message: 'wrong order',
                            node: importNodes[i],
                            fixable: null
                        })
                    }
                }
            }
        }
    }
}