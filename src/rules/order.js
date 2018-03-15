const isRegExpMatcher = (() => {
    const regExp = /^\/(.*)\/$/
    return str => regExp.test(str)
})()

const isDirective = node => node.type === 'ExpressionStatement' &&
                            node.expression.type === 'Literal' &&
                            typeof node.directive === 'string'

const findLoc = (option, node) => {
    let currentPrio = Number.MIN_SAFE_INTEGER
    let temp = []
    for (let i = 0; i < option.length; i++) {
        const group = option[i]
        for (let j = 0; j < group.length; j++) {
            const { matcher, priority } = group[j]
            if (typeof matcher === 'string' && matcher === node.source.value) {
                return [i, j]
            } else if (typeof matcher === 'object' && matcher.test(node.source.value) && priority > currentPrio) {
                temp = [i, j]
                currentPrio = priority
            }
        }
    }
    return temp
}

const markImportRank = sortedGroup => {
    let rank = 0
    sortedGroup.forEach(
        group => group.forEach(
            importNode => (importNode.rank = rank++)
        )
    )
}

const markLastMember = sortedGroup => sortedGroup.forEach(
    group => group.length && (group[group.length - 1].isLastMember = true)
)

const getSortedImport = (option, importNodes) => {
    const result = option.map(
        group => group.map(() => [])
    )
    importNodes.forEach(
        importNode => {
            const { loc: [i, j] } = importNode
            result[i][j].push(importNode)
        }
    )
    return result.map(
        group => group.reduce((a, b) => [...a, ...b])
    )
}

const getErrorMessage = ({ type }) => {
    switch (type) {
        case 'order':
            return 'Wrong placement.'
        case 'seperator':
            return 'Should be followed by 1 empty line.'
        default:
            // no default current
    }
}

module.exports = {
    meta: {
        docs: {
            description: 'sort imports',
            category: 'Personal Style',
            recommended: 'false'
        },
        schema: [{
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        }],
        fixable: 'code'
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        const option = context.options[0].map(
            group => group.map(
                option => {
                    let matcher
                    let priority
                    if (typeof option === 'object') {
                        ({ matcher, priority } = option)
                    } else if (typeof option === 'string') {
                        [matcher, priority = 0] = option.split('|').map(str => str.trim())
                    }
                    priority = parseInt(priority, 10)
                    if (isRegExpMatcher(matcher)) {
                        matcher = new RegExp(RegExp.$1)
                    }
                    return {
                        matcher,
                        priority
                    }
                }
            )
        )
        option.push([{
            matcher: /./,
            priority: Number.MIN_SAFE_INTEGER + 1
        }])
        const importNodes = []
        let fixRangeEnd = 0
        let firstNotImpNode = null
        return {
            Program(program) {
                const startWithDirective = isDirective(program.body[0])
                program.body.slice(startWithDirective ? 1 : 0).forEach(
                    node => {
                        if (firstNotImpNode) return
                        if (node.type === 'ImportDeclaration') {
                            importNodes.push({
                                node,
                                loc: findLoc(option, node),
                                rank: 0,
                                errors: [],
                                isLastMember: false
                            })
                        } else {
                            firstNotImpNode = node
                            fixRangeEnd = node.range[0]
                        }
                    }
                )
                if (!importNodes.length || !firstNotImpNode) return

                const sortedGroup = getSortedImport(option, importNodes)
                markImportRank(sortedGroup)
                markLastMember(sortedGroup)

                importNodes.forEach(
                    ({ rank, errors, isLastMember, node }, index) => {
                        if (rank !== index) {
                            errors.push({
                                type: 'order',
                                data: {
                                    index
                                }
                            })
                        }
                        if (isLastMember) {
                            const firstLine = node.loc.end.line
                            const lastLine = (
                                (index < importNodes.length - 1) ? importNodes[index + 1].node : firstNotImpNode
                            ).loc.start.line
                            const linesBetween = lastLine - firstLine - 1
                            if (linesBetween !== 1) {
                                errors.push({
                                    type: 'seperator',
                                    data: {
                                        number: linesBetween
                                    }
                                })
                            }
                        }
                    }
                )
                const errorImportNodes = importNodes.filter(
                    ({ errors }) => errors.length
                )
                if (!errorImportNodes.length) return
                const lastError = errorImportNodes[errorImportNodes.length - 1].errors.pop()
                errorImportNodes.forEach(
                    ({ node, errors }) => errors.forEach(
                        error => context.report({
                            node,
                            message: getErrorMessage(error),
                            fix: fixer => fixer.insertTextBefore(firstNotImpNode, '')
                        })
                    )
                )
                context.report({
                    node: errorImportNodes[errorImportNodes.length - 1].node,
                    message: getErrorMessage(lastError),
                    fix(fixer) {
                        if (fixRangeEnd === 0) {
                            fixRangeEnd = importNodes[importNodes.length - 1].node.range[1]
                        }
                        const range = [importNodes[0].node.range[0], fixRangeEnd]
                        const resultSourceCode = sortedGroup.filter(
                            group => group.length
                        ).map(
                            group => `${group.map(
                                ({ node }) => `${sourceCode.getText(node)}\n`
                            ).join('')}\n`
                        ).join('')
                        return fixer.replaceTextRange(range, resultSourceCode)
                    }
                })
            }
        }
    }
}
