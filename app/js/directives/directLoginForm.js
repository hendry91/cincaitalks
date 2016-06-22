define(['directives/directives'],
    function (directives) {
        directives.directive('directLoginForm', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function controllerFn($scope, $element) {

                $element.find('.btnLogin').on('click', function (event) {
                    event.preventDefault(); // To prevent following the link (optional)
                    event.stopPropagation();

                    var username = $element.find('#inputName').val().trim();
                    var password = $element.find('#inputPass').val().trim();
                    var attrs = {
                        username: username,
                        password: password
                    };

                    authServices.UserDeploydLogin(attrs, function (res) {
                        if (res != undefined && res.displayname != undefined) {
                            $element.modal('hide');
                            $element.find('#inputName').val('');
                            $element.find('#inputPass').val('');
                            $element.find('.invalidInput').hide();

                            $rootScope.deploydLoginUsername = res.displayname;
                            $rootScope.$broadcast('deploydLoginDetails');

                        } else {
                            $element.find('.invalidInput').show();
                            console.debug("invalid username or password");
                        }
                    });
                });

                $element.find('.btnCancel').on('click', function (event) {
                    $element.find('#inputName').val('');
                    $element.find('#inputPass').val('');
                    $element.find('.invalidInput').hide();

                });

            }
            // removed from first div = 'ng-click="showAllIndice()"'
            return {
                restrict: 'E',
                template: '<div class="modal fade" id="my_login_Modal" role="dialog">' +
                            '<div class="modal-dialog">' +
                            '<!-- Modal content-->' +
                            '<div class="modal-content">' +
                            '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                            '<h4 class="modal-title">Login</h4>' +
                            '</div>' +
                            '<form role="form">' +
                            '<div class="form-group">' +
                            '<label for="usr">User Name : </label>' +
                            '<input type="text" class="form-control" id="inputName">' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label for="usr">Password : </label>' +
                            '<input type="password" class="form-control" id="inputPass">' +
                            '</div>' +
                            '</form>' +
                            '<div class="modal-footer">' +
                            '<label for="invalid" class="invalidInput" style="color:red; display:none;float: left;">Invalid username or password.</label>' +
                            '<button type="submit" class="btn btn-default btnLogin" data-dismiss="modal" value="Login">Login</button>' +
                            '<button type="button" class="btn btn-default btnCancel" data-dismiss="modal">Close</button>' +
                            '</div>' +
                            '</div>' +
                            '</div></div>',
                controller: ['$scope', '$element', controllerFn],
                //link: showAll,
                replace: true
            };
        } ]);
    });
