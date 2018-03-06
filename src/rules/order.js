const baseOption = {
    member: 'byUsingOrder',
    sorter: 'byName',
    seperator: false
}

const normalizeOption = ({ order, groups = {}, defaultSetting = {} }) => {
    const groupKeys = Object.keys(groups)
    return order.map(str => groupKeys.includes(str) ? groups[str] : ({
        ...baseOption,
        ...defaultSetting,
        match: str
    }))
}

const isAbsoluteImport = node => !/^\.+(\\|\/)/.test(node.source.value)

const getSortedImportNodes = (options, importNodes) => {
    const groups = options.map(option => ({ option, nodes: [] }))
    // ungrouped importNode
    groups[-1] = { option: {}, nodes: [] }
    importNodes.forEach(importNode => groups[importNode.rank].nodes.push(importNode))
    // sort by group
    groups.forEach(group => {
        let nodes = []
        if (group.option.sorter === 'byName') {
            nodes = [...group.nodes]
            nodes.sort((a, b) => a.node.source.value > b.node.source.value ? -1 : 1)
        } else if (group.option.sorter === 'byType') {
            const absoluteImport = []
            const relativeImport = []
            group.nodes.forEach(importNode => {
                if (isAbsoluteImport(importNode.node)) {
                    absoluteImport.push(importNode)
                } else {
                    relativeImport.push(importNode)
                }
            })
            nodes = [...absoluteImport, ...relativeImport]
        }
        group.nodes = nodes
    })
    return groups
}

const getErrorReport = (errorImportNodes, groupsName) => {
    const { errors, node, rank } = errorImportNodes
    const infos = []
    errors.forEach(error => {
        if (typeof error === 'object') {
            if (error.type === 'group-order') {
                infos.push(`group \`${groupsName[rank]}\` should be placed after group \`${groupsName[error.data.rank]}\``)
            } else if (error.type === 'in-group-order') {
                infos.push(`should be placed after \`${error.data.source.value}\` in the \`${groupsName[rank]}\` group`)
            }
        } else {
            if (error === 'with-line') {
                infos.push('line(s) after no-seperator group')
            } else if (error === 'without-line') {
                infos.push('no line after with-seperator group')
            }
        }
    })
    return {
        node,
        message: infos.join('; ')
    }
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
                const rank = options.findIndex(option => {
                    if (/^\/(.*)\/$/.test(option.match)) {
                        return (new RegExp(RegExp.$1)).test(node.source.value)
                    } else {
                        return option.match === node.source.value
                    }
                })
                importNodes.push({
                    node,
                    option: options[rank] || {},
                    rank,
                    errors: []
                })
            },
            'Program:exit'() {
                const { lines } = sourceCode
                const sortedGroups = getSortedImportNodes(options, importNodes)
                for (let i = 0; i < importNodes.length - 1; i++) {
                    const currentNode = importNodes[i]
                    const nextNode = importNodes[i + 1]
                    const sameGroupNodes = sortedGroups[currentNode.rank].nodes
                    if (currentNode.rank > nextNode.rank) {
                        currentNode.errors.push({
                            type: 'group-order',
                            data: nextNode
                        })
                    } else if (currentNode.rank === nextNode.rank) {
                        const currentNodeIndex = sameGroupNodes.indexOf(currentNode)
                        const nextNodeIndex = sameGroupNodes.indexOf(nextNodeIndex)
                        if (currentNodeIndex > nextNodeIndex) {
                            currentNode.errors.push({
                                type: 'in-group-order',
                                data: nextNode
                            })
                        }
                    }
                    // seperator
                    if (sameGroupNodes[sameGroupNodes.length - 1] === currentNode) {
                        const betweenLines = sourceCode.lines.slice(currentNode.node.loc.end.line, nextNode.node.loc.start.line - 1)
                        if (sortedGroups[currentNode.rank].option.seperator && (!betweenLines.length)) {
                            currentNode.errors.push('with-line')
                        } else if (!sortedGroups[currentNode.rank].option.seperator && betweenLines.length) {
                            currentNode.errors.push('without-line')
                        }
                    }
                }

                const errorImportNodes = importNodes.filter(importNode => importNode.errors.length)
                if (!errorImportNodes.length) {
                    // no problems
                    return
                }
                errorImportNodes.slice(0, -1).forEach(importNode => context.report(getErrorReport(importNode, originOptions.order)))
                context.report({
                    ...getErrorReport(errorImportNodes[errorImportNodes.length - 1], originOptions.order),
                    fix(fixer) {
                        const range = [0, importNodes[importNodes.length - 1].node.range[1]]
                        // console.log(range)
                        console.log(sortedGroups)
                        const resultSourceCode = sortedGroups.map(
                            ({ nodes, option }) => nodes.map(node => sourceCode.getText(node)).join('\n') + (option.seperator ? '\n' : '')
                        ).join('\n')
                        // console.log('--------')
                        // console.log(resultSourceCode)

                        return fixer.replaceTextRange(range, resultSourceCode)
                    }
                })
            }
        }
    }    
}