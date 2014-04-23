/**
 * Created by rwanou on 28/12/13.
 */
'use strict';

var xpnjsApp = angular.module('xpnjsApp', []);

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
    $scope.$watchCollection('xpns', function(records) {
        var resto = 0;
        var parking = 0;
        angular.forEach(records, function(record) {
            if (record.resto) resto += record.resto;
            if (record.parking) parking += record.parking;
        });
        $scope.totalParking = parking;
        $scope.totalResto = resto;
        $scope.total = parking + resto;
    });


    $scope.addLine = function(newLine, valid) {
        if (valid) {
            console.log('adding: ' + newLine);
            newLine.id = $scope.nextId;
            $scope.nextId++;
            $scope.xpns.push(newLine);
            $scope.newLine = null;
        }
    };

    // edit line

    // delete line
});
