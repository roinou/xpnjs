/**
 * Created by rwanou on 28/12/13.
 */
'use strict';

var xpnjsApp = angular.module('xpnjsApp', []);

xpnjsApp.controller('xpnsListCtrl', function ($scope, $http) {
    // loading data
    $http.get('data/xpns-201312.json').success(function(data) {
        $scope.xpns = data.data;
    });
    $scope.orderProp = 'date';

    // sum all data
    /*$scope.totalResto = 0;
    $scope.totalParking = 0;
    function calcTotal($scope) {
        angular.forEach($scope.xpns, function(xpn) {
            console.log(xpn);
            $scope.totalResto += xpn.resto;
            $scope.totalParking += xpn.parking;
        });
    };*/
    $scope.$watch('xpns', function(records) {
        $scope.totalResto = 0;
        $scope.totalParking = 0;
        angular.forEach(records, function(record) {
            $scope.totalResto += record.resto;
            $scope.totalParking += record.parking;
        });
    });



    // new data form:
    $scope.newDate = '';
    $scope.newLabel = '';
    $scope.newResto = 0;
    $scope.newParking = 0;

    $scope.addLine = function() {
        var newLine = new function() {
            this.date = $scope.newDate;
            this.label = $scope.newLabel;
            this.resto = $scope.resto;
        };
        console.log('adding: ' + newLine);
        $scope.xpns.push(newLine);
    }

    // edit line

    // delete line
});
