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
    });
    // property on which to order by
    $scope.orderProp = 'date';

    // watching changes to recalculate total amounts
    $scope.$watch('xpns', sumLines, true);
    function sumLines(records) {
        var resto = 0;
        var parking = 0;
        angular.forEach(records, function(record) {
            if (record.resto) resto += record.resto;
            if (record.parking) parking += record.parking;
        });
        $scope.totalParking = parking;
        $scope.totalResto = resto;
        $scope.total = parking + resto;
    }

    // adding OR editing a line
    $scope.addLine = function(newLine, valid) {
        if (valid ) {
            if (newLine && !newLine.id) {
                console.log('adding: ' + newLine);
                newLine.id = $scope.nextId;
                $scope.nextId++;
            } else {
                console.log('replacing: ' + newLine);
                removeById($scope.xpns, newLine.id);
            }
            $scope.xpns.push(newLine);
            $scope.newLine = null;
        }
    };

    // edit line
    $scope.editLine = function(line) {
        $scope.newLine = angular.copy(line);
    };
    // returns false if the new date is null
    $scope.checkDate = function(data, oldValue) {
        if (!data) {
            return false;
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
});

// module init
xpnjsApp.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});
