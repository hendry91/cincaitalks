define(['services/services'],
    function (services) {
        services.service('authServices', ['deploydService', '$cookies',
            function (deploydService, $cookies) {
                var currUSER = undefined;

                function getCurrentUser(callback) {
                    var sessionsid = $cookies.get('dCookie');
                    if (sessionsid != undefined) { //if got deployd session
                        var attrs = {
                            Cookie: sessionsid
                        };
                        deploydService.GetCurrentUser(attrs, function (res) {
                            if (res.id == undefined) { //if deployd not login
                                callback(-1);
                                //                                checkFacebookLogin(function (res) { //check facebook login
                                //                                    callback(res);
                                //                                });
                            } else {
                                callback(res);
                            }
                        });
                    } else { //no deployd session
                        //                      checkFacebookLogin(function (res) { //check facebook login
                        //                          callback(res);
                        //                      });
                        callback(-1);
                    }
                }

                function checkFacebookLogin(callback) {
                    FB.getLoginStatus(function (res) {
                        if (res.status === 'connected') {
                            var uid = res.authResponse.userID;
                            var accessToken = res.authResponse.accessToken;
                            callback(res);
                        } else if (res.status === 'not_authorized') {
                            callback(-1);
                            // the user is logged in to Facebook, 
                            // but has not authenticated your app
                        } else {
                            callback(-1);
                            // the user isn't logged in to Facebook.
                        }
                    });
                }

                function userDeploydLogin(attrs, callback) {
                    userFacebookLogout(angular.noop);
                    deploydService.UserLogin(attrs, function (res) {
                        if (res != undefined) {
                            if (res.id != undefined) {
                                $cookies.put('dCookie', res.id);
                                getCurrentUser(function (res) {
                                    callback(res);
                                });

                            } else {
                                callback(-1);
                            }
                        }

                    });
                }
                function userDeploydLogout(callback) {
                    var sessionsid = $cookies.get('dCookie');
                    if (sessionsid != undefined) {
                        var attrs = {
                            Cookie: sessionsid
                        };
                        deploydService.UserLogout(attrs, function (res) {
                            if (res.count == 1) {
                                callback(0);
                                currUSER = undefined;
                            } else {
                                callback(-1);
                            }

                        });
                    }
                }

                function userFacebookLogin(callback) {
                    userDeploydLogout(angular.noop);
                    FB.login(function (response) {
                        if (response.status === 'connected') {
                            callback(response);
                        } else {
                            callback(-1);
                        }

                    });
                }

                function userFacebookLogout(callback) {
                    if (FB.getAccessToken() != null || FB.getAccessToken() != undefined) {
                        FB.logout(function (response) {
                            callback(response);
                            currUSER = undefined;
                        });
                    }
                }

                return {
                    //check deployd n facebook login
                    GetCurrentUser: function (callback) {
                        if (currUSER == undefined) {
                            getCurrentUser(function (res) {
                                if (res == -1) {
                                    callback(res);
                                    currUSER = undefined;
                                } else {
                                    if (res.displayName != undefined) {
                                        callback(res);
                                        currUSER = res;
                                    } else {
                                        if (res.status == "connected") {
                                            callback(res);
                                            currUSER = FB.getUserID();
                                        } else {
                                            callback(-1);
                                            currUSER = undefined;
                                        }

                                    }
                                }
                            });
                        } else {
                            callback(currUSER );
                        }
                    },
                    //Deployd login
                    UserDeploydLogin: userDeploydLogin,
                    UserDeploydLogout: userDeploydLogout,
                    //Facebook login
                    UserFacebookLogin: userFacebookLogin,
                    UserFacebookLogout: userFacebookLogout

                }
            }
    ]);
    });