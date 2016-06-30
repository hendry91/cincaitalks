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
                                checkFacebookLogin(function (res) { //check facebook login
                                    if (res != -1) {
                                        var userid = res.authResponse.userID;
                                        deploydService.CheckExistingUser(userid, function (res) {
                                            callback(res[0]);
                                        });
                                    } else {
                                        callback(-1);
                                    }
                                });
                            } else {
                                callback(res);
                            }
                        });
                    } else { //no deployd session
                        checkFacebookLogin(function (res) { //check facebook login
                            if (res != -1) {
                                var userid = res.authResponse.userID;
                                deploydService.CheckExistingUser(userid, function (res) {
                                    callback(res[0]);
                                });
                            } else {
                                callback(-1);
                            }
                        });
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
                                currUSER = undefined;
                                callback(0);
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
                            var token = response.authResponse.accessToken
                            FB.api('/me', 'get', { access_token: token, fields: 'id,name,gender' }, function (response) {
                                deploydService.CheckExistingUser(response.id, function (res) {
                                    if (res.length == 0) { //user no exist
                                        var attrs = {};
                                        attrs.username = response.id;
                                        attrs.displayname = response.name;
                                        attrs.email = undefined;
                                        attrs.gender = response.gender;
                                        attrs.password = "123456";
                                        attrs.status = "active";
                                        attrs.role = "FB";
                                        attrs.faculty = undefined;

                                        deploydService.CreateUser(attrs, function (res) {
                                            if (res.id != undefined) {
                                                alert('New is created, please modify your details.');
                                                callback(res);
                                            }
                                        });
                                    } else { //user exitst, no nid register
                                        deploydService.CheckExistingUser(response.id, function (res) {
                                            callback(res[0]);
                                        });
                                    }
                                });
                            });
                        } else {
                            callback(-1);
                        }

                    });
                }

                function userFacebookLogout(callback) {
                    if (FB.getAccessToken() != null || FB.getAccessToken() != undefined) {
                        FB.logout(function (response) {
                            currUSER = undefined;
                            callback(response);
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
                                    if (res.status == "active") { 
                                        callback(res);
                                        currUSER = res;
                                    } else {
                                        callback(-1);
                                        currUSER = undefined;
                                        alert('Your account unable to login, please contact admin.');
                                    }
                                }
                            });
                        } else {
                            callback(currUSER);
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