const baseOption = {
    memberSort: 'byUsingOrder',
    sorter: 'byUsingOrder',
    seperator: ''
}

const normalizeOption = ({ order, groups = {}, defaultSetting = {} }) => {
    const groupKeys = Object.keys(groups)
    return order.map(str => groupKeys.includes(str) ? groups[str] : ({
        ...baseOption,
        ...defaultSetting,
        match: str
    }))
}

module.exports = {
    meta: {
        docs: {
            description: 'test',
            category: 'Possible Errors',
            recommended: false
        },
        schema: [{
            type: 'object',
            properties: {
                order: {
                    type: 'array'
                },
                groups: {
                    type: 'object',
                    additionalProperties: true
                },
                defaultSetting: {
                    type: 'object',
                    additionalProperties: true
                }
            },
            additionalProperties: false,
            required: ['order']
        }],
        fixable: 'code'
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        const originOptions = context.options[0]
        const options = normalizeOption(originOptions)
        const importNodes = []
        return {
            ImportDeclaration(node) {
                const index = options.findIndex(option => {
                    if (/^\/(.*)\/$/.test(option.match)) {
                        return (new RegExp(RegExp.$1)).test(node.source.value)
                    } else {
                        return option.match === node.source.value
                    }
                })
                importNodes.push({
                    ...node,
                    option: options[index] || null,
                    index: index == -1 ? Number.MAX_SAFE_INTEGER : index
                })
            },
            'Program:exit'() {
                for (let i = 0; i < importNodes.length - 1; i++) {
                    const indexes = importNodes.map(node => node.index)
                    if (indexes[i] > indexes[i + 1]) {
                        context.report({
                            message: `group \`${originOptions.order[indexes[i]]}\` should be placed after group \`${originOptions.order[indexes[i + 1]]}\``,
                            node: importNodes[i],
                            fix(fixer) {
                                const range = [0, importNodes[importNodes.length - 1].range[1]]
                                const operation = []
                                const nodes = [...importNodes]
                                nodes.sort((a, b) => a.index - b.index)
                                const sortedSourceCode = nodes.map(node => sourceCode.getText(node))
                                operation.push(fixer.replaceTextRange(range, sortedSourceCode.join('\n')))
                                return operation
                            }
                        })
                    }
                }
                importNodes.forEach((node, index) => {
                    
                })
            }
        }
    }    
}