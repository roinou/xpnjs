/**
 * Created by rwanou on 28/12/13.
 */
'use strict';

var xpnjsApp = angular.module('xpnjsApp', ["xeditable", "ui.bootstrap"]);

// app configuration
xpnjsApp.constant('config', {
    'dataUrl' : 'http://localhost:8080/data/',
    'types' : ['parking', 'restaurant', 'transport', 'autre']
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
        if (config.types) {
            for (var i = 0, len = config.types.length; i < len; i += 1) {
                appendType(types, config.types[i]);
            }
        }
        if (array) {
            for (var j = 0, leng = array.length; j < leng; j += 1) {
                appendType(types, array[j].type)
            }
        }
        return types;
    }
    function appendType(types, type) {
        if (type && !(type in types)) {
            types[type] = {'label': type, 'total': 0};
        }
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
        if (xpns && range) {
            console.log('saving:', xpns, range);
            var data = { 'range': range, 'data': xpns };
            $http.post(baseUrl + range, data);
        }
    };
}]);

xpnjsApp.controller('xpnsListCtrl', ['$scope', '$http', '$filter', 'dataService', function ($scope, $http, $filter, dataService) {
    // debug?
    $scope.debug = false;

    // property on which to order by
    $scope.orderProp = 'date';

    // loading data
    function load(range) {
        dataService.load(range).then(function(data) {
            if (data.data) {
                $scope.xpns = data.data;
                $scope.range = data.range;
            }
            else {
                $scope.xpns = [];
                $scope.range = range;
            }
            $scope.types = dataService.detectTypes($scope.xpns);
            $scope.newLine = dataService.initNewLine($scope.types);
        });
    }

    $scope.saveData = function() {
        dataService.save($scope.xpns, $scope.range);
    };

    // whatch the change of range
    $scope.$watch('_range', changeDate);
    // if date of range changed, save old values, then reload new ones.
    function changeDate(after, before) {
        if (before !== after) {
            if (before) {
                var _before = $filter('rangeDate')(before);
                dataService.save($scope.xpns, _before);
            }
            if (after) {
                $scope.range = $filter('rangeDate')(after);
                console.log('loading: ', $scope.range);
                load($scope.range);
            }
        }

    }

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
            newItem.provider = newLine.provider;
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
                return element.find("form").length > 0;
            }, function(hasInput) {
                element.toggleClass('input-cell', hasInput);
            });
        }
    };
}]);

// date filters
xpnjsApp.filter('rangeDate', function($filter) {
    return function(input) {
        if (input == null) {
            return "";
        }
        var _date = $filter('date')(new Date(input), 'yyyy-MM');
        return _date.toUpperCase();
    };
});
xpnjsApp.filter('xpnDate', function($filter) {
    return function(input) {
        if (input == null) {
            return "";
        }
        var _date = $filter('date')(new Date(input), 'dd/MM/yyyy');
        return _date.toUpperCase();
    };
});

