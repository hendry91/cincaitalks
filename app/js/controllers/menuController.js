define(['controllers/controllers'],
    function (controllers) {
        'use strict';
        controllers.controller('menuController', ['$scope', '$element', '$cookies', 'deploydService', 'authServices', '$rootScope',
            function ($scope, $element, $cookies, deploydService, authServices, $rootScope) {
                //                var avatarImg = "images/avatar.jpg";
                //                var timestamp = new Date().getTime();
                //                $element.find('.avatar > .imgAvatar').attr('src', avatarImg + "?" + timestamp);
                //                var element = document.documentElement;

                $scope.loginType = undefined;

                authServices.GetCurrentUser(function (res) {
                    if (res != -1) {
                        if (res.displayname != undefined) { //deployd login
                            $element.find('.logined').show();
                            $element.find('.logouted').hide();
                            $element.find('.logined').removeClass('ng-hide');
                            $scope.userName = res.displayname;
                            $scope.knowUser = true;
                            $scope.unknowUser = false;
                            $scope.loginType = "deployd";
                        } else if (res.status == "connected") { //facebook login
                            $element.find('.logined').show();
                            $element.find('.logouted').hide();
                            $element.find('.logined').removeClass('ng-hide');
                            $scope.userName = res.authResponse.userID;
                            $scope.knowUser = true;
                            $scope.loginType = "facebook";
                        }
                    } else {
                        $element.find('.logouted').show();
                        $element.find('.logined').hide();
                        $element.find('.logouted').removeClass('ng-hide');
                        $scope.knowUser = false;
                        $scope.unknowUser = true;
                    }
                });

                $scope.createNewPost = function () {
                    $element.parent().find('#my_create_post_Modal').modal('show');
                    $rootScope.$broadcast('createPost');
                }

                $scope.toLogin = function () {
                    $element.parent().find('#my_login_Modal').modal('show');
                }

                $scope.toSignUp = function () {
                    $element.parent().find('#my_signup_Modal').modal('show');
                }

                $scope.toLogout = function () {
                    if ($scope.loginType == "facebook") {
                        authServices.UserFacebookLogout(function (res) {
                            if (res.status == "unknown") {
                                $element.find('.logined').hide();
                                $element.find('.logouted').show();
                                $element.find('.logouted').removeClass('ng-hide');
                                $scope.knowUser = false;
                                $scope.unknowUser = true;
                            } else {
                                console.debug('logout error');
                            }
                        });
                    } else if ($scope.loginType == "deployd") {
                        authServices.UserDeploydLogout(function (res) {
                            if (res == 0) {
                                $element.find('.logined').hide();
                                $element.find('.logouted').show();
                                $element.find('.logouted').removeClass('ng-hide');
                                $scope.knowUser = false;
                                $scope.unknowUser = true;
                            } else {
                                console.debug('logout error');
                            }
                        });
                    } else {
                        console.debug("logout error");
                    }


                }

                $scope.fbAuth = function () {
                    authServices.UserFacebookLogin(function (res) {
                        if (res.status === 'connected') {
                            console.debug("logged in");
                            $element.find('.logined').show();
                            $element.find('.logouted').hide();
                            $element.find('.logined').removeClass('ng-hide');
                            $scope.userName = FB.getUserID();
                            $scope.knowUser = true;
                            $scope.unknowUser = false;
                            $scope.loginType = "facebook";
                        } else {
                            console.debug("no login");
                            $element.find('.logouted').show();
                            $element.find('.logined').hide();
                            $element.find('.logouted').removeClass('ng-hide');
                            $scope.knowUser = false;
                            $scope.unknowUser = true;
                        }
                    });
                }

                $rootScope.$on("deploydLoginDetails", function (e) {
                    $scope.loginType = "deployd";
                    $scope.userName = $rootScope.deploydLoginUsername;
                    $scope.knowUser = true;
                    $scope.unknowUser = false;
                    $element.parent().find('.logined').show();
                    $element.parent().find('.logined').removeClass('ng-hide');
                    $element.parent().find('.logouted').hide();
                });

                //to display like share button
                //            <div
                //            class="fb-like"
                //            data-share="true"
                //            data-width="450"
                //            data-show-faces="true">
                //            </div>

            } ]);

    });
