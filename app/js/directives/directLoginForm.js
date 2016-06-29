define(['directives/directives'],
    function (directives) {
        directives.directive('directLoginForm', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function controllerFn($scope, $element) {

                $element.find('.btnLogin').on('click', function (event) {
                    event.preventDefault(); // To prevent following the link (optional)
                    event.stopPropagation();
                    $element.find('.invalidInput').hide();
                    
                    var username = $element.find('#inputName').val().trim();
                    var password = $element.find('#inputPass').val().trim();
                    var attrs = {
                        username: username,
                        password: password
                    };

                    authServices.UserDeploydLogin(attrs, function (res) {
                        if (res != undefined && res.displayname != undefined) {
                            $element.modal('hide');

                            $rootScope.deploydLoginDisplayaname = res.displayname;
                            $rootScope.deploydLoginUsername = res.username;
                            $rootScope.$broadcast('deploydLoginDetails');
                            $rootScope.$broadcast('refreshPost');
                        } else {
                            $element.find('.invalidInput').show();
                        }
                    });
                });
                
                $element.on("keyup","#inputName , #inputPass",function(e){
                    if(e.keyCode == 13)
                        $element.find('.btnLogin').click();
                });

                $element.find('.btnCancel').on('click', function (event) {
                    resetInput();
                });
                
                $element.find('.btnRecover').on('click', function (event) {
                    event.preventDefault(); // To prevent following the link (optional)
                    event.stopPropagation();

                    var username = $element.find('#recoverInputName').val().trim();
                    var email = $element.find('#recoverInputEmail').val().trim();
                    
                    var attrs = {
                        attr: "username",
                        value: username
                    };
                    
                    deploydService.GetUserByAttr(attrs,function(res){
                        var user = res[0]
                        if(user != undefined && user.displayname != undefined){
                            if(user.email.toUpperCase == email.toUpperCase){
                                console.log("this is correct email")
                            }else{
                                alert("incorrect email")
                            }
                           
                        }else{
                             alert("username does not exist");
                        }
                        
                    });
                    
                   
                });
                
                
                $("#my_login_Modal").on('hidden.bs.modal', function () {
                    $(this).data('bs.modal', null);
                    resetInput();
                });
                
                function resetInput(){
                    $element.find('#inputName').val('');
                    $element.find('#inputPass').val('');
                    $element.find('#recoverInputName').val('');
                    $element.find('#recoverInputEmail').val('');
                    $element.find('.invalidInput').hide();
                    $element.find('#collapseRecover').collapse('hide');
                }
                

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
                            '<small class="text-muted btnRecoverPw" value="Recover" data-toggle="collapse" href="#collapseRecover">Recover Password</small>' +
                            '<button type="submit" class="btn btn-default btnLogin" data-dismiss="modal" value="Login">Login</button>' +
                            '<button type="button" class="btn btn-default btnCancel" data-dismiss="modal">Close</button>' +
                            '</div>' +
                            '<div class="collapse" id="collapseRecover">' +
                                '<form role="form">' +
                                    '<div class="form-group card-block card">' +
                                        '<div class="form-group">' +
                                        '<label for="usr">User Name : </label>' +
                                        '<input type="text" class="form-control" id="recoverInputName">' +
                                        '</div>' +
                                        '<div class="form-group">' +
                                        '<label for="usr">Email : </label>' +
                                        '<input type="text" class="form-control" id="recoverInputEmail">' +
                                        '</div>' +
                                        '<div class="help-block with-errors"></div>' +
                                        '<button class="btn btn-primary btnRecover" type="submit">Recover</button>' +
                                    '</div>' +
                                '</form>' +
                            '</div>' +
                            '</div>' +
                            '</div></div>',
                controller: ['$scope', '$element', controllerFn],
                //link: showAll,
                replace: true
            };
        } ]);
    });
