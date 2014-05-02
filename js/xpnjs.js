/**
 * Created by rwanou on 28/12/13.
 */
'use strict';

var xpnjsApp = angular.module('xpnjsApp', ["xeditable", "ui.bootstrap"]);

// app configuration
xpnjsApp.constant('config', {
    'dataUrl' : 'data/'
});

xpnjsApp.service('dataService', ['$http', 'config', function($http, config) {

    var baseUrl = config.dataUrl;

    function initNewLine(types) {
        var newLine = {'val': {}};
        if (types) {
            angular.forEach(types, function(type) {
                newLine.val[type.label] = null;
            });
        }
        return newLine;
    }
    this.initNewLine = initNewLine;

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
    this.detectTypes = detectTypes;

    this.load = function(name) {
        var url = baseUrl + name;
        // working with promise
        return $http.get(url).then(function(response) {
            return response.data;
        });
    };
    
    this.save = function(xpns, range) {
        var data = { 'range': range, 'data': xpns };
        $http.post(baseUrl + range, data);
    };
}]);

xpnjsApp.controller('xpnsListCtrl', ['$scope', '$http', 'dataService', function ($scope, $http, dataService) {
    // debug?
    $scope.debug = false;

    // property on which to order by
    $scope.orderProp = 'date';

    // loading data
    dataService.load('xpns-201312.json').then(function(data) {
        $scope.xpns = data.data;
        $scope.range = data.range;
        $scope.types = dataService.detectTypes($scope.xpns);
        $scope.newLine = dataService.initNewLine($scope.types);
    });

    $scope.saveData = function() {
        dataService.save($scope.xpns, '201312');
    };

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

    // adding a line
    $scope.addLine = function(newLine, valid) {
        if (valid && newLine) {
            var newItem = {};
            console.log('adding: ' + newLine);
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
            $scope.newLine = dataService.initNewLine($scope.types);
        }
    };

    // delete line
    $scope.removeLine = function(line) {
        var index = $scope.xpns.indexOf(line);
        if (index > -1) {
            $scope.xpns.splice(index, 1);
        }
    };
}]);

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
