define(['services/services'],
    function (services) {
        services.service('authServices', ['deploydService', '$cookies', '$http',
            function (deploydService, $cookies, $http) {
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
                                                //alert('New is created, please modify your details.');
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

                function requestAccessToken(callback) {
                    $http({
                        method: 'POST',
                        url: "https://api.imgur.com/oauth2/token",
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        transformRequest: function (obj) {
                            var str = [];
                            for (var p in obj)
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            return str.join("&");
                        },
                        data: { client_id: "4fdec70e41b7cd7", client_secret: "bddbc8f146243973cef3154c1b174de88e7d5163", grant_type: "refresh_token", refresh_token: "b1569581ba7f023e59a77fd5bb344529eea4426a" }
                    }).success(function (e) {
                        callback(e);
                    }).error(function (e) {
                    });
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
                    UserFacebookLogout: userFacebookLogout,
                    RequestAccessToken: requestAccessToken
                }
            }
    ]);
    });