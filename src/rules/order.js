const isRegExpMatcher = (() => {
    const regExp = /^\/(.*)\/$/
    return str => regExp.test(str)
})()

const findLoc = (option, node) => {
    let currentPrio = 0
    let temp = []
    for (let i = 0; i < option.length; i++) {
        const group = option[i]
        for (let j = 0; i < group.length; j++) {
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

const getSortedImport = (option, importNodes) => {
    const result = option.map(
        group => group.map(() => [])
    )
    importNodes.forEach(importNode => {
        const { loc: [i, j] } = importNode
        result[i][j].push(importNode)
    })
    return result.map(
        group => group.reduce((a, b) => [...a, ...b])
    )
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

const getErrorReport = ({ node, errors, rank }) => {
    const infos = errors.map(
        ({ type, data }) => {
            switch (type) {
                case 'order':
                    return `Wrong placement, should be at line ${rank + 1} instead of line ${data.index + 1}`
                case 'seperator':
                    return `Wrong seperator, should be after 1 instead of ${data.number} empty lines`
                default:
                    return ''
            }
        }
    )
    return {
        node,
        message: infos.join(';\n')
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
            optionGroup => optionGroup.map(
                option => {
                    // for future APIs
                    let matcher
                    let priority
                    if (typeof option === 'object') {
                        ({ matcher, priority } = option)
                    } else if (typeof option === 'string') {
                        [matcher, priority = 0] = option.split('|').map(str => str.trim())
                    }
                    priority = parseInt(priority)
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
        // default unmatched node placed at the end
        option.push([{
            matcher: /\./,
            priority: Number.MIN_SAFE_INTEGER
        }])
        const importNodes = []
        let firstNotImpNode = null
        return {
            ImportDeclaration(node) {
                importNodes.push({
                    node,
                    loc: findLoc(option, node),
                    rank: 0,
                    errors: [],
                    isLastMember: false,
                    isAtBeginning: !firstNotImpNode
                })
            },
            'Program > ImportDeclaration + :not(ImportDeclaration)'(node) {
                if (!firstNotImpNode) {
                    firstNotImpNode = node
                }
            },
            'Program:exit'() {
                if (!importNodes.length) return

                if (!firstNotImpNode) {
                    return context.report({
                        message: 'It seems you aren\'t doing anything',
                        loc: {
                            start: importNodes[0].node.loc.start,
                            end: importNodes[importNodes.length - 1].node.loc.end
                        }
                    })
                }
                const sortedGroup = getSortedImport(option, importNodes)
                // rank available
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
                            const linesBetween = sourceCode.lines.slice(firstLine, lastLine - 1).length
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
                    importNode => importNode.errors.length
                )
                // no problems
                if (!errorImportNodes.length) return

                errorImportNodes.slice(0, -1).forEach(
                    importNode => context.report(getErrorReport(importNode))
                )
                // applying fixer at the end of report
                context.report({
                    ...getErrorReport(errorImportNodes[errorImportNodes.length - 1]),
                    fix(fixer) {
                        const range = [0, firstNotImpNode.range[0]]
                        const result = importNodes.filter(
                            importNode => !importNode.isAtBeginning
                        ).map(
                            ({ node }) => fixer.remove(node)
                        )
                        const resultSourceCode = sortedGroup.filter(
                            group => group.length
                        ).map(
                            group => `${group.map(
                                ({ node }) => `${sourceCode.getText(node)}\n`
                            ).join('')}\n`
                        ).join('')
                        result.push(fixer.replaceTextRange(range, resultSourceCode))
                        return result
                    }
                })
            }
        }
    }
}
