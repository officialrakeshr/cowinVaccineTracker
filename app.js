var app = angular.module("vaxapp", []);
app.controller('vacCtrl', function ($scope, $http, $interval, $filter) {
    $scope.appName = "Co-WIN Vaccine Tracker";
    var oneMin = 1000 * 60;
    var today = moment().format("DD-MM-YYYY");
    $scope.filter = {};
    $scope.selectedInterval = -1
    $scope.IntervalList = [{ name: "One Time", value: -1 }, { name: "30 Seconds", value: 0.5 }, { name: "1 Minutes", value: 1 }, { name: "2 Mins", value: 2 }, { name: "5 Mins", value: 5 }, { name: "10 Mins", value: 10 }, { name: "30 Mins", value: 30 }, { name: "1 Hour", value: 60 }]
    //basic fetches
    var statesURL = "https://cdn-api.co-vin.in/api/v2/admin/location/states";//GET
    $http.get(statesURL).then(function (res) {
        if (res.status == 200) {
            $scope.stateList = res.data.states;
        }
    })

    $scope.getDistrictByState = function (stateCode) {
        var districtURL = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + stateCode;
        $http.get(districtURL).then(function (res) {
            if (res.status == 200) {
                $scope.districtList = res.data.districts;
            }
        })
    }
    var interval;
    ///////////////////////////////////////////////////////////////
    $scope.trackByDistrict = function (selectedDistrict) {
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
        if ($scope.selectedInterval != -1) {
            interval = $interval(intervalTrackByDistrict, $scope.selectedInterval * oneMin);
        } else {
            intervalTrackByDistrict();
        }

    }

    var intervalTrackByDistrict = function () {
        console.log("Date:", new Date())

        //todays view
        var findByDistrict = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=" + $scope.selectedDistrict + "&date=" + today
        $http.get(findByDistrict).then(function (res) {
            if (res.status == 200) {
                $scope.slotListTodayMaster = res.data;
                $scope.slotListToday = angular.copy($scope.slotListTodayMaster);
            }
        })
        //7 Days
    }
    /////////////////////////////////////////////

    $scope.trackByPin = function (selectedPin) {
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
        if ($scope.selectedInterval != -1) {
            interval = $interval(intervalTrackByPin, $scope.selectedInterval * oneMin);
        } else {
            intervalTrackByPin();
        }

    }
    var intervalTrackByPin = function () {
        console.log("Date:", new Date())

        //todays view
        var findByDistrict = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode="+$scope.selectedPin+"&date=" + today
        $http.get(findByDistrict).then(function (res) {
            if (res.status == 200) {
                $scope.slotListTodayMaster = res.data;
                $scope.slotListToday = angular.copy($scope.slotListTodayMaster);
            }
        })
        //7 Days
    }
    /////////////////////////////////////////////////


    $scope.filterThisData = function (filter) {
        var f;
        //vaccine
        if ($scope.filter.isCovaxin && !$scope.filter.isCovishield) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.vaccine = 'COVAXIN'
        }
        if (!$scope.filter.isCovaxin && $scope.filter.isCovishield) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.vaccine = 'COVISHIELD'
        }
        if (!$scope.filter.isCovaxin && !$scope.filter.isCovishield) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.vaccine = undefined;
        }
        if ($scope.filter.isCovaxin && $scope.filter.isCovishield) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.vaccine = undefined;
        }
        //paid
        if ($scope.filter.isFree && !$scope.filter.isPaid) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.fee_type = 'Free'
        }
        if (!$scope.filter.isFree && $scope.filter.isPaid) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.fee_type = 'Paid'
        }
        if (!$scope.filter.isFree && !$scope.filter.isPaid) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.fee_type = undefined;
        }
        if ($scope.filter.isFree && $scope.filter.isPaid) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.fee_type = undefined;
        }
        //age group
        if ($scope.filter.is45 && !$scope.filter.is18) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.min_age_limit = 45
        }
        if (!$scope.filter.is45 && $scope.filter.is18) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.min_age_limit = 18
        }
        if (!$scope.filter.is45 && !$scope.filter.is18) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.min_age_limit = undefined;
        }
        if ($scope.filter.is45 && $scope.filter.is18) {
            if (!angular.isDefined(f)) {
                f = {};
            }
            f.min_age_limit = undefined;
        }

        if (f) {
            $scope.slotListToday = {};
            $scope.slotListToday.sessions = $filter('filter')(angular.copy($scope.slotListTodayMaster.sessions), f);
        } else {
            $scope.slotListToday = angular.copy($scope.slotListTodayMaster);
        }

    }

    $scope.$on('$destroy', function () {
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
    });
    $scope.resetInterval = function () {
        $scope.slotListToday=null;

        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
    }
})