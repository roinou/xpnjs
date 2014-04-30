/**
 * Created by rwanou on 28/12/13.
 */
'use strict';

var xpnjsApp = angular.module('xpnjsApp', ["xeditable", "ui.bootstrap"]);

xpnjsApp.controller('xpnsListCtrl', function ($scope, $http) {
    // debug?
    $scope.debug = true;

    // loading data
    $http.get('data/xpns-201312.json').success(function(data) {
        $scope.xpns = data.data;

        // next line ID
        $scope.nextId = $scope.xpns.length + 1;

        // all types from the model:
        $scope.types = detectTypes($scope.xpns);
        
        // init form object
        $scope.newLine = initNewLine($scope.types);
    });
    // property on which to order by
    $scope.orderProp = 'date';

    // watching changes to recalculate total amounts
    $scope.$watch('xpns', sumLines, true);
    function sumLines(records) {
        $scope.total = 0;
        // reset totals
        angular.forEach($scope.types, function(type) {
            type.total = 0;
        });
        angular.forEach(records, function(record) {
            if (record.value) {
                $scope.types[record.type].total += record.value;
                $scope.total += record.value;
            }
        });
    }

    // adding OR editing a line
    $scope.addLine = function(newLine, valid) {
        if (valid) {
            var newItem = {};
            if (newLine && !newLine.id) {
                console.log('adding: ' + newLine);
                newItem.id = $scope.nextId;
                $scope.nextId++;
            } else {
                console.log('replacing: ' + newLine);
                newItem.id = newLine.id;
                removeById($scope.xpns, newLine.id);
            }
            newItem.date = newLine.date;
            newItem.label = newLine.label;
            newItem.comment = newLine.comment;
            $.each(newLine.val, function(key, val) {
                if (val) {
                    newItem.type = key;
                    newItem.value = val;
                    return;
                }
            });

            $scope.xpns.push(newItem);
            $scope.newLine = initNewLine($scope.types);
        }
    };

    // delete line
    $scope.removeLine = function (line) {
        removeById($scope.xpns, line.id);
    };

    // utility methods
    /**
     * removes an element from the array by its ID
     * @param array the array to look in
     * @param id the id to find
     * @returns {*} the element found
     */
    function removeById(array, id) {
        for (var d = 0, len = array.length; d < len; d += 1) {
            if(array[d].id === id)
                return array.splice(d, 1);
        }
    }

    // load data method.
    function detectTypes(array) {
        var types = {};
        if (array) {
            for (var i = 0, len = array.length; i < len; i += 1) {
                var type = array[i].type;
                if (type && !(type in types)) {
                    types[type] = {'label': type, 'total': 0};
                }
            }
        }
        return types;
    }
    function initNewLine(types) {
        var newLine = {'val': {}};
        if (types) {
            angular.forEach(types, function(type) {
                newLine.val[type.label] = null;
            });
        }
        return newLine;
    }
});

// module init
xpnjsApp.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});

// bootstrap 'has error' directive. Will add 'has-error' css class if input is invalid
// needs JQuery to work
xpnjsApp.directive('bsHasError', [function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs, ctrl) {
            var input = element.find("input[ng-model]");
            $.each(input, function(index, current) {
                if (current) {
                    scope.$watch(function () {
                        var valid = $(current).hasClass('ng-valid'),
                            pristine = $(current).hasClass('ng-pristine'),
                            dirty = $(current).hasClass('ng-dirty'),
                            error = $(current).hasClass('ng-invalid'),
                            required = $(current).hasClass('ng-invalid-required');
                        var ret = "";
                        if (dirty && error) {
                            ret = 'has-error';
                        }
                        if (valid && dirty) {
                            ret = 'has-success';
                        }
                        return ret;
                    }, function (oldVal, newVal) {
                        if (newVal)
                            $(current).parent().toggleClass(newVal);
                        if (oldVal)
                            $(current).parent().toggleClass(oldVal);
                    });
                }
            });
        }
    };
}]);

xpnjsApp.directive('cell', [function() {
    return {
        restrict: "C",
        link: function(scope, element, attrs, ctrl) {
            scope.$watch(function () {
                var ret = element.find("form").length > 0;
                return ret;
            }, function(hasInput) {
                element.toggleClass('input-cell', hasInput);
            });
        }
    };
}]);
