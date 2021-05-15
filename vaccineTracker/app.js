var app = angular.module("vaxapp", []);
app.controller('vacCtrl', function ($scope, $http, $interval, $filter, $timeout) {
    $scope.appName = "Co-WIN Vaccine Tracker";
    var oneMin = 1000 * 60;
    var today = moment().format("DD-MM-YYYY");
    $scope.sevenDays = [0, 1, 2, 3, 4, 5, 6].map(o => moment().startOf('day').add(o, 'days').toDate().getTime());
    $scope.moment = moment;
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
    $scope.beepInterval;
    ///////////////////////////////////////////////////////////////
    $scope.trackByDistrict = function (selectedDistrict) {
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
        $scope.stopBeep();
        if ($scope.selectedInterval != -1 && !angular.isDefined(interval)) {
            interval = $interval(intervalTrackByDistrict, $scope.selectedInterval * oneMin);
            intervalTrackByDistrict();
        } else {
            intervalTrackByDistrict();
        }

    }

    var intervalTrackByDistrict = function () {
        console.log("Date:", new Date());
        $scope.stopBeep();
        $scope.showLoader=true;
        $timeout(function () {
            //todays view
            /**var findByDistrict = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=" + $scope.selectedDistrict + "&date=" + today
            $http.get(findByDistrict).then(function (res) {
                if (res.status == 200) {
                    $scope.slotListTodayMaster = res.data;
                    $scope.filterThisData();
                }
            });**/
            //7 Days
            var weeklyDist = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + $scope.selectedDistrict + "&date=" + today;
            $http.get(weeklyDist).then(function (res) {
                if (res.status == 200) {
                    $scope.slotList7DaysMaster = res.data;
                    $scope.filterThisData();
                    $scope.showLoader=false;
                }
            },function err(){
                $scope.showLoader=false;
            });
        }, 1000)

    }
    /////////////////////////////////////////////

    $scope.trackByPin = function (selectedPin) {
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
        $scope.stopBeep();
        if ($scope.selectedInterval != -1 && !angular.isDefined(interval)) {
            interval = $interval(intervalTrackByPin, $scope.selectedInterval * oneMin);
            intervalTrackByPin();
        } else {
            intervalTrackByPin();
        }

    }
    var intervalTrackByPin = function () {
        console.log("Date:", new Date());
        $scope.stopBeep();
        $scope.showLoader=true;
        //todays view
        $timeout(function () {
            /** var findByPin = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=" + $scope.selectedPin + "&date=" + today;
             $http.get(findByPin).then(function (res) {
                 if (res.status == 200) {
                     $scope.slotListTodayMaster = res.data;
                     $scope.filterThisData();
                 }
             }) **/
            var weeklyPin = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + $scope.selectedPin + "&date=" + today;
            $http.get(weeklyPin).then(function (res) {
                if (res.status == 200) {
                    $scope.slotList7DaysMaster = res.data;
                    $scope.filterThisData();
                    $scope.showLoader=false;
                }
            },function err(){
                $scope.showLoader=false;
            })
        }, 1000)
        //7 Days
    }
    /////////////////////////////////////////////////

    var beepEnable = false;
    $scope.filterThisData = function () {
        $scope.showLoader=true; 
        $scope.stopBeep();
        beepEnable = false;
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

        /**if (f) {
            $scope.slotListToday = {};
            $scope.slotListToday.sessions = $filter('filter')(angular.copy($scope.slotListTodayMaster.sessions), f);
        } else {
            $scope.slotListToday = angular.copy($scope.slotListTodayMaster);
        }
        if ($scope.slotListToday.sessions && $scope.slotListToday.sessions.length > 0) {
            $scope.slotListToday.sessions = $scope.slotListToday.sessions.filter(o => o.available_capacity > 0);
            if ($scope.slotListToday.sessions.length > 0) {
                $scope.beepInterval = $interval(function () {
                    $timeout(beep, 500);
                }, 500);
            }
        }**/
        let fee_type = angular.copy(f.fee_type);
        f.fee_type = undefined;
        if (f) {
            $scope.slotList7Days = {};
            $scope.slotList7Days.centers = [];
            for (let center of $scope.slotList7DaysMaster.centers) {
                let c = angular.copy(center);
                c.sessions = $filter('filter')(angular.copy(center.sessions), f);
                if (c.sessions.length > 0 && (angular.isDefined(fee_type) ? (c.fee_type == fee_type) : true)) {
                    $scope.slotList7Days.centers.push(c);
                }
            }
        } else {
            $scope.slotList7Days = angular.copy($scope.slotList7DaysMaster);
        }
        for (let center of $scope.slotList7Days.centers) {
            if (center.sessions && center.sessions.length > 0) {
                if (center.sessions.filter(o => o.available_capacity > 0).length > 0) {
                    beepEnable = true;
                    center.vaccine_available=true;
                }else center.vaccine_available=false;
            }
        }
        $scope.slotList7Days.centers.sort( (a,b) => b.vaccine_available - a.vaccine_available)
        if (beepEnable) {
            $scope.beepInterval = $interval(function () {
                $timeout(beep, 500);
            }, 500);
        }
        $scope.showLoader=false;
    }

    $scope.processSessionData = function (center) {
        for (day of $scope.sevenDays) {
            let date = moment(day).format('DD-MM-YYYY');
            if (center.sessions) {
                let dateObj = center.sessions.filter(o => {
                    return o.date == date;
                });
                if (dateObj.length == 0) {
                    center.sessions.push({ 'date': date });
                }
            } else {
                if (!angular.isDefined(center.sessions)) {
                    center.sessions = [];
                }
                center.sessions.push({ 'date': date });
            }
        }
        center.sessions.sort(function (a, b) { return moment(a.date, 'DD-MM-YYYY', true).toDate().getTime() - moment(b.date, 'DD-MM-YYYY', true).toDate().getTime() })
    }

    $scope.stopBeep = function () {
        $interval.cancel($scope.beepInterval);
        $scope.beepInterval = undefined;
    }

    $scope.$on('$destroy', function () {
        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
    });
    $scope.resetInterval = function () {
        $scope.slotListToday = null;

        if (angular.isDefined(interval)) {
            $interval.cancel(interval);
            interval = undefined;
        }
    }

    function beep() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        snd.play();
    }

})