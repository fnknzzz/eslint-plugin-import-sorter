const formatOption = options => {
    const settings = {
        order: 'byName',
        firstType: 'namespace'
    }
    if (options.includes('byUsingOrder')) {
        settings.order = 'byUsingOrder'
    }
    if (options.includes('default')) {
        settings.firstType = 'default'
    }
    return settings
}

const getSortedSpecifiers = (specifiers, option, { scopeManager }) => {
    const sortFunc = option.order === 'byName' ? (
        (a, b) => (a.local.name < b.local.name ? -1 : 1)
    ) : (
        (a, b) => {
            const aReferences = scopeManager.getDeclaredVariables(a)[0].references
            const bReferences = scopeManager.getDeclaredVariables(b)[0].references
            if (!aReferences.length) return -1
            if (!bReferences.length) return 1
            return aReferences[0].identifier.start - bReferences[0].identifier.start
        }
    )
    const defaults = []
    const namespaces = []
    specifiers.forEach(
        specifier => {
            if (specifier.imported.name === specifier.local.name) {
                defaults.push(specifier)
            } else {
                namespaces.push(specifier)
            }
        }
    )
    defaults.sort(sortFunc)
    namespaces.sort(sortFunc)
    return option.firstType === 'namespace' ? [...namespaces, ...defaults] : [...defaults, ...namespaces]
}

module.exports = {
    meta: {
        docs: {
            discription: 'sort members in a import declaration',
            category: 'Personal Style',
            recommended: true
        },
        schema: [{
            type: 'string'
        }, {
            type: 'string'
        }],
        fixable: 'code'
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        const option = formatOption(context.options)
        return {
            ImportDeclaration(node) {
                let { specifiers } = node
                if (specifiers.length <= 1) return
                if (specifiers[0].type === 'ImportDefaultSpecifier') {
                    specifiers = specifiers.slice(1)
                }
                const sorted = getSortedSpecifiers(specifiers, option, sourceCode)
                if (sorted.find((specifier, i) => specifier !== specifiers[i])) {
                    context.report({
                        message: 'Wrong specifiers order.',
                        node,
                        fix(fixer) {
                            return specifiers.map(
                                ({ range }, i) => fixer.replaceTextRange(range, sourceCode.getText(sorted[i]))
                            )
                        }
                    })
                }
            }
        }
    }
}
