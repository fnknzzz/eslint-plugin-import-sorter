const defaultSettings = {
    order: ['a', 'b', 'c'],
    groups: {
        a: {
            member: {
                match: '',
                sorter: 'byName'
            },
            'module': '',
            separator: true,
        }
    }
}

const normalizeOption = ({ order: originOrder, groups = {} }) => {
    const order = [...originOrder]
    
    Object.keys(option.groups || {}).forEach(key => {
        const index = order.indexOf(key)
        if (~index) {
            order.splice(index, 1, groups[key])
        }
    })

    return order.map(group => {
        // defualt matches moduleName      
        if (typeof group === 'string') {
            return {

            }
        }
    })
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
    create: function(context) {
        var importNodes = []
        return {
            ImportDeclaration: function(node) {
                importNodes.push(node)
            },
            onCodePathEnd: function(codePath, node) {
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