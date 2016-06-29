define(['directives/directives'],
    function (directives) {
        directives.directive('directUserSetting', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function init($scope, $element, $attrs) {
                $($element).ready(function () {
                   
                    
                    $rootScope.$on("userSetting", function (e) {
                        $('#overlay').show();
                        $element.find("#loading-indicator").show();
                        
                        $scope.thisUser = undefined;
                        deploydService.GetCurrentUser({ Cookie : $cookies.get('dCookie') },function (res) {
                            if(res != undefined && res.username){
                                $scope.thisUser = angular.copy(res);
                                //Init css to selected Button
                                $element.find("#my_setting_Modal").find("#radGender input[value="+$scope.thisUser.gender+"]").parent().addClass("active");
                                $element.find("#my_setting_Modal").find("#radFaculty input[value="+$scope.thisUser.faculty+"]").parent().addClass("active");
                            }
                            $('#overlay').hide();
                            $element.find("#loading-indicator").hide();
                        });
                        
                    });
                    
                    $element.find('#my_settingPW_Modal .submit').on('click', function (event) {
                        var changePwBtn = $(this);
                        changePwBtn.addClass("disabled");
                        var oldPassword = $element.find("#inputOldPassword").val();
                        var newPassword = $element.find("#inputNewPassword").val();
                        var cfmNewPassword = $element.find("#inputPasswordConfirm").val();
                        
                        if(oldPassword == "" || newPassword == "" || cfmNewPassword == ""){
                            $element.find(".help-block").html('Password cannot be blank').css('color', 'red');
                            changePwBtn.removeClass("disabled");
                        }
                        else if(newPassword.length < 6 || cfmNewPassword.length < 6){
                            $element.find(".help-block").html('Password must be at least 6 character').css('color', 'red');
                            changePwBtn.removeClass("disabled");
                        }
                        else{
                             authServices.GetCurrentUser(function (res) {
                                var currUser = "";
                                if(res != undefined && res.username != undefined){
                                    currUser = angular.copy(res);
                                    
                                    deploydService.UserLogin({username: currUser.username,password: oldPassword},function(res){
                                changePwBtn.removeClass("disabled");
                                if(res.id == undefined){
                                    $element.find(".help-block").html('Incorrect Old Password').css('color', 'red');
                                }else{
                                    if(newPassword != cfmNewPassword)
                                    $element.find(".help-block").html('New Password unmatch Confirm Password').css('color', 'red');
                                    else{
                                        $element.find(".help-block").html('');
                                        var attr = {
                                                    id : currUser.id,
                                            password : cfmNewPassword
                                        }
                                        deploydService.UpdateUser(attr,function(res){
                                            alert("Password Changed Sucessful");
                                            changePwBtn.removeClass("disabled");
                                            $element.find("#my_settingPW_Modal").find(".cancel").click();
                                        });
                                    }
                                }
                            })
                        }
                    });
                    
                            
                        }
                    });
                    
                    $element.find('#my_setting_Modal .update').on('click', function (event) {
                       
                        $scope.thisUser.gender = $element.find('#radGender input:radio:checked').val();
                        $scope.thisUser.faculty = $element.find('#radFaculty input:radio:checked').val();
                        
                        var displayname = $element.find("#inputDisplayName").val(),
                            email = $element.find("#inputEmail").val(),
                            invalid = false,errorMsg = "",updateBtn = $(this);
                        
                        updateBtn.addClass("disabled");
                        
                        if(displayname == "" || email == "" || $scope.thisUser.gender == undefined || $scope.thisUser.faculty == undefined){
                            errorMsg = "Field Cannot be blank";
                            invalid = true;
                        }
                        else if(displayname.length > 15 || displayname.length < 5) {
                            errorMsg = "Invalid Displayname";
                            invalid = true;
                        }
                        else if(!validateEmail(email)){
                            errorMsg = "Invalid Email";
                            invalid = true;
                        }
                        
                        if(invalid){
                            updateBtn.removeClass("disabled");
                            $element.find(".setting-help-block").html(errorMsg).css('color', 'red');
                        }
                        else{
                            $element.find(".setting-help-block").html('');
                            var attr = {
                                id : $scope.thisUser.id,
                                displayname : displayname,
                                email : email,
                                gender : $scope.thisUser.gender,
                                faculty : $scope.thisUser.faculty,
                            }
                        
                            deploydService.UpdateUser(attr,function(res){
                                alert("Update Sucessful");
                                updateBtn.removeClass("disabled");
                                $element.find("#my_setting_Modal").find(".cancel").click();
                                $rootScope.$broadcast('deploydLoginDetailsChanged',{value : res.displayname});
                            });
                        }
                    });
                    
                    $("#my_settingPW_Modal").on('hidden.bs.modal', function () {
                        $(this).data('bs.modal', null);
                        resetPwForm();
                    });
                    
                    $("#my_setting_Modal").on('hidden.bs.modal', function () {
                        $(this).data('bs.modal', null);
                        resetSettingForm();
                    });
                    
                    
                    function resetPwForm(){
                        $element.find("#inputOldPassword").val("");
                        $element.find("#inputNewPassword").val("");
                        $element.find("#inputPasswordConfirm").val("");
                        $element.find(".help-block").html("");
                    }
                    
                    function resetSettingForm(){
                        $element.find("#radGender label").removeClass("active");
                        $element.find("#radFaculty label").removeClass("active");
                        $element.find(".setting-help-block").html("");
                    }
                    
                    function validateEmail(email) {
                        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return re.test(email);
                    }
                });
            }


            return {
                restrict: 'E',
                template: '<div><div class="modal fade" id="my_settingPW_Modal" role="dialog">' +
                        '<div class="modal-dialog">' +
                        '<!-- Modal content-->' +
                        '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                        '<h4 class="modal-title">Change Password</h4>' +
                        '</div>' +
                        '<form role="form">' +
                        '<div class="form-group">' +
                        '<label for="inputOldPassword" class="control-label">Old Password : </label>' +
                        '<input type="password" data-minlength="6" maxlength="15" class="form-control" id="inputOldPassword">' +
                        '</div>' +
                        '<div class="form-group">' +
                        '<label for="inputNewPassword" class="control-label">New Password : </label>' +
                        '<input type="password" class="form-control" id="inputNewPassword" placeholder="Minimum of 6 characters">' +
                        '</div>' +
                        '<div class="form-group">' +
                        '<label for="inputPasswordConfirm" class="control-label">Confirm Password : </label>' +
                        '<input type="password" class="form-control" id="inputPasswordConfirm" placeholder="Minimum of 6 characters" >' +
                        '</div>' +
                        '<div class="help-block with-errors"></div>' +
                        '<div class="modal-footer  form-group">' +
                        '<button type="submit" class="btn btn-default submit">Change</button>' +
                        '<button type="button" class="btn btn-default cancel" data-dismiss="modal">Close</button>' +
                        '</form>' +
                        '</div>' +
                        '</div>' +
                        '</div></div>'+
                        '<div class="modal fade" id="my_setting_Modal" role="dialog">' +
                        '<div class="modal-dialog">' +
                        '<!-- Modal content-->' +
                        '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                        '<h4 class="modal-title">User Setting</h4>' +
                        '</div>' +
                        '<form role="form">' +
                        '<div class="form-group">' +
                        '<label for="inputName" class="control-label">User Name : {{ thisUser.username }}</label>' +
                        '</div>' +

                        '<div class="form-group">' +
                        '<label for="inputName" class="control-label">Display Name</label>' +
                        '<input type="text" class="form-control" ng-model="thisUser.displayname" ng-bind="thisUser.displayname" id="inputDisplayName" data-minlength="5" maxlength="15" placeholder="Display Name (Min 5, Max 15 words)." required>' +
                        '<div class="help-block with-errors"></div>' +
                        '</div>' +

                        '<div class="form-group">' +
                        '<label for="inputEmail" class="control-label">Email</label>' +
                        '<input type="email" class="form-control" ng-model="thisUser.email" id="inputEmail" placeholder="Email" data-error="Bruh, that email address is invalid" required>' +
                        '<div class="help-block with-errors"></div>' +
                        '</div>' +
                        '<img src="img/loading.gif" id="loading-indicator" style="display:none" />' +
                        '<div class="form-group">' +
                        '<label for="gender" class="control-label">Gender : </label>' +
                        '<div class="btn-group" id="radGender" data-toggle="buttons">' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" class="radgender" name="radgender" ng-model="thisUser.gender" ng-bind="thisUser.gender"  value="male"/>Male' +
                        '</label>' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" class="radgender" name="radgender" ng-model="thisUser.gender" ng-bind="thisUser.gender" value="female"/> Female' +
                        '</label>' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" class="radgender" name="radgender" ng-model="thisUser.gender" ng-bind="thisUser.gender" value="unknown"/> Unknown' +
                        '</label>' +
                        '</div>' +
                        '<div class="help-block with-errors"></div>' +
                        '</div>' +
                        
                        '<div class="form-group">' +
                        '<label for="faculty" class="control-label">Faculty : </label>' +
                        '<div class="btn-group" id="radFaculty" data-toggle="buttons">' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" name="faculty" ng-model="thisUser.faculty" ng-bind="thisUser.faculty" class="radfaculty" value="FASC"/>FASC' +
                        '</label>' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" name="faculty" ng-model="thisUser.faculty" ng-bind="thisUser.faculty" class="radfaculty" value="FAFB"/> FAFB' +
                        '</label>' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" name="faculty" ng-model="thisUser.faculty" ng-bind="thisUser.faculty" class="radfaculty" value="FEBE"/> FEBE' +
                        '</label>' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" name="faculty" ng-model="thisUser.faculty" ng-bind="thisUser.faculty" class="radfaculty" value="FSAH"/> FSAH' +
                        '</label>' +
                        '<label class="btn btn-default blue">' +
                        '<input type="radio" name="faculty" ng-model="thisUser.faculty" ng-bind="thisUser.faculty" class="radfaculty" value="CPUS"/> CPUS' +
                        '</label>' +
                        '</div>' +
                        '<div class="setting-help-block with-errors"></div>' +
                        '</div>' +
                        '<div class="modal-footer  form-group">' +
                        '<button type="submit" class="btn btn-default update">Update</button>' +
                        '<button type="button" class="btn btn-default cancel" data-dismiss="modal">Close</button>' +
                        '</form>' +
                        '</div>' +
                        '</div>' +
                        '</div></div>'+
                        '</div>',
                link: init,
                //link: showAll,
                replace: true
            };
        } ]);
    });
