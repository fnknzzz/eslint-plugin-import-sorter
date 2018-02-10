'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaultSettings = {
    order: ['a', 'b', 'c'],
    groups: {
        a: {
            member: {
                match: '',
                sorter: 'byName'
            },
            'module': '',
            separator: true
        }
    }
};

var normalizeOption = function normalizeOption(_ref) {
    var originOrder = _ref.order,
        _ref$groups = _ref.groups,
        groups = _ref$groups === undefined ? {} : _ref$groups;

    var order = [].concat(_toConsumableArray(originOrder));

    Object.keys(option.groups || {}).forEach(function (key) {
        var index = order.indexOf(key);
        if (~index) {
            order.splice(index, 1, groups[key]);
        }
    });

    return order.map(function (group) {
        // defualt matches moduleName      
        if (typeof group === 'string') {
            return {};
        }
    });
};

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
    create: function create(context) {
        var importNodes = [];
        return {
            ImportDeclaration: function ImportDeclaration(node) {
                importNodes.push(node);
            },
            onCodePathEnd: function onCodePathEnd(codePath, node) {
                var moduleNames = importNodes.map(function (node) {
                    return node.source.value;
                });
                for (var i = 0; i < moduleNames.length - 1; i++) {
                    if (moduleNames[i] > moduleNames[i + 1]) {
                        context.report({
                            message: 'wrong order',
                            node: importNodes[i],
                            fixable: null
                        });
                    }
                }
            }
        };
    }
};