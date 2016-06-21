define(['controllers/controllers'],
    function (controllers) {
        'use strict';
        controllers.controller('breakLineController', ['$scope', '$element', '$rootScope',
            function ($scope, $element, $rootScope) {

                $rootScope.$on("setBreakLineTitle", function (e) {
                    $scope.breakLine_title = $rootScope.breakLineTitle;
                });

            } ]);

    });
