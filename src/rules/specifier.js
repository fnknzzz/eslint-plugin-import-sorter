const formatOption = options => {
    const settings = {
        order: 'byName',
        firstType: 'namespace'
    }
    switch (options.length) {
        case 1:
            if (typeof options[0] === 'string') {
                settings.order = options[0]
            } else {
                return options[0]
            }
            break
        case 2:
            settings.order = options[0]
            settings.firstType = options[1]
            break
        default:
            // no default
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
                let isWrong = false
                for (let i = 0; i < sorted.length; i++) {
                    if (sorted[i] !== specifiers[i]) {
                        isWrong = true
                        break
                    }
                }
                if (isWrong) {
                    context.report({
                        message: 'Wrong specifiers order.',
                        node,
                        fix(fixer) {
                            const specifiersText = sorted.map(
                                specifier => sourceCode.getText(specifier)
                            )
                            return specifiers.map(
                                ({ range }) => fixer.replaceTextRange(range, specifiersText)
                            )
                        }
                    })
                }
            }
        }
    }
}
