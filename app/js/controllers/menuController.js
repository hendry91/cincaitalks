﻿define(['controllers/controllers'],
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
                        if (res.status == "active") {
                            $element.find('.logined').show();
                            $element.find('.logouted').hide();
                            $element.find('.logined').removeClass('ng-hide');
                            $scope.displayname = res.displayname;
                            $scope.knowUser = true;
                            $scope.unknowUser = false;
                            $scope.loginType = (res.role == "FB") ? "facebook" : "deployd";
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

                $scope.userSetting = function (type) {
                    if (type == "password")
                        $element.parent().find('#my_settingPW_Modal').modal('show');
                    else {
                        $element.parent().find('#my_setting_Modal').modal('show');
                        $rootScope.$broadcast('userSetting');
                    }
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
                                $rootScope.deploydLoginDisplayaname = undefined;
                                $rootScope.deploydLoginUsername = undefined;
                                $rootScope.$broadcast('refreshPost');
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
                                $rootScope.deploydLoginDisplayaname = undefined;
                                $rootScope.deploydLoginUsername = undefined;
                                $rootScope.$broadcast('refreshPost');
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
                        if (res.status =="active") {
                            $element.find('.logined').show();
                            $element.find('.logouted').hide();
                            $element.find('.logined').removeClass('ng-hide');
//                          if (!$scope.$$phase) {
//                              $scope.$apply(function () {
                                $scope.displayname = res.displayname;
                                $scope.knowUser = true;
                                $scope.unknowUser = false;
                                $scope.loginType = "facebook";
//                              });
//                          }
                            $rootScope.$broadcast('refreshPost');    
                            
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

                $element.find(".dropdown").removeClass('open');
                $element.find(".dropdown").find("#dropdownMenu1").css('visibility', "visible");
                $element.find(".dropdown").find(".dropdown-menu").css('visibility', "visible");

                $rootScope.$on("deploydLoginDetails", function (e) {
                    $scope.loginType = "deployd";
                    $scope.displayname = $rootScope.deploydLoginDisplayaname;
                    $scope.knowUser = true;
                    $scope.unknowUser = false;
                    $element.parent().find('.logined').show();
                    $element.parent().find('.logined').removeClass('ng-hide');
                    $element.parent().find('.logouted').hide();
                });

                $rootScope.$on("deploydLoginDetailsChanged", function (e, result) {
                    $scope.displayname = result.value;
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
