const defaultOption = [[], 8, 3]

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
            if (
                typeof matcher === 'string' &&
                matcher === node.source.value
            ) {
                return [i, j]
            } else if (
                typeof matcher === 'object' &&
                matcher.test(node.source.value) && priority > currentPrio
            ) {
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
        group => group.reduce((a, b) => [...a, ...b], [])
    )
}

const getErrorMessage = ({ type }) => {
    switch (type) {
        case 'order':
            return 'Wrong placement.'
        case 'with-seperator':
            return 'Should be followed by 1 empty line.'
        case 'without-seperator':
            return 'Shouldn\'t be followed by empty line(s)'
        default:
            // no default current
    }
}

const normalizeOption = options => {
    const order = options[0].map(
        group => group.map(
            option => {
                let matcher
                let priority
                if (typeof option === 'object') {
                    ({ matcher, priority } = option)
                } else if (typeof option === 'string') {
                    [matcher, priority = 0] = option.split('|')
                                                    .map(str => str.trim())
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
    switch (options.length) {
        case 1:
            return [order, defaultOption[1], defaultOption[2]]
        case 2:
            if (typeof options[1] === 'number') {
                return [order, options[1], defaultOption[2]]
            }
            return [
                order,
                options[1].limit || defaultOption[1],
                options[1].groupLength || defaultOption[2]
            ]
        case 3:
            return [order, options[1], options[2]]
        default:
            // no defualt
    }
}

module.exports = {
    meta: {
        docs: {
            description: 'sort imports',
            category: 'Personal Style',
            recommended: 'false'
        },
        fixable: 'code'
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        const originSourceCode = sourceCode.getText()
        const [option, limit, groupLength] = normalizeOption(context.options)
        option.push([{
            matcher: /./,
            priority: Number.MIN_SAFE_INTEGER + 1
        }])
        const importNodes = []
        let insertRangeEnd = 0
        let firstNotImpNode = null
        return {
            Program(program) {
                const startWithDirective = isDirective(program.body[0])
                program.body.forEach(
                    (node, index) => {
                        if (index === 0 && startWithDirective) return
                        if (node.type === 'ImportDeclaration') {
                            importNodes.push({
                                node,
                                loc: findLoc(option, node),
                                range: [
                                    index === 0 ? 0 : program.body[index - 1].range[1],
                                    node.range[1]
                                ],
                                rank: 0,
                                errors: [],
                                shouldRemove: !!firstNotImpNode,
                                seperator: false
                            })
                        } else if (!firstNotImpNode) {
                            firstNotImpNode = node
                            insertRangeEnd = node.range[0]
                        }
                    }
                )
                if (!importNodes.length || !firstNotImpNode) return

                const sortedGroup = getSortedImport(option, importNodes)
                                        .filter(group => group.length)
                const lastGroup = sortedGroup[sortedGroup.length - 1]
                lastGroup[lastGroup.length - 1].seperator = true
                markImportRank(sortedGroup)
                if (importNodes.length >= limit) {
                    sortedGroup.forEach(
                        group => (group[group.length - 1].seperator = true)
                    )
                } else {
                    sortedGroup.forEach(
                        (group, i) => {
                            if (group.length >= groupLength) {
                                group[group.length - 1].seperator = true
                                const nextGroup = sortedGroup[i - 1]
                                nextGroup && (nextGroup[nextGroup.length - 1].seperator = true)
                            }
                        }
                    )
                }

                importNodes.forEach(
                    ({ rank, errors, seperator, node }, index) => {
                        if (rank !== index) {
                            errors.push({
                                type: 'order'
                            })
                        }
                        const firstLine = node.loc.end.line
                        const lastLine = (
                            (index < importNodes.length - 1) ?
                                importNodes[index + 1].node :
                                firstNotImpNode
                        ).loc.start.line
                        const linesBetween = lastLine - firstLine - 1
                        if (seperator && linesBetween !== 1) {
                            errors.push({
                                type: 'with-seperator'
                            })
                        } else if (!seperator && linesBetween > 0) {
                            errors.push({
                                type: 'without-seperator'
                            })
                        }
                    }
                )
                const errorImportNodes = importNodes.filter(
                    ({ errors }) => errors.length
                )
                if (!errorImportNodes.length) return
                const lastError =
                    errorImportNodes[errorImportNodes.length - 1].errors.pop()
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
                        const range = [importNodes[0].node.range[0], insertRangeEnd]
                        const resultSourceCode = `${sortedGroup.map(
                            group => `${group.map(
                                ({ range }) => originSourceCode.slice(...range).replace(
                                    /^\s*/, '\n'
                                )
                            ).join('')}${group[group.length - 1].seperator ? '\n' : ''}`
                        ).join('').trim()}\n\n`
                        return [fixer.replaceTextRange(range, resultSourceCode)].concat(
                            errorImportNodes.filter(({ shouldRemove }) => shouldRemove)
                                .map(({ range }) => fixer.removeRange(range))
                        )
                    }
                })
            }
        }
    }
}
