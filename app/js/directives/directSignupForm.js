define(['directives/directives'],
    function (directives) {
        directives.directive('directSignupForm', ['$compile', 'deploydService', '$cookies', function ($compile, deploydService, $cookies) {

            function controllerFn($scope, $element) {

                function validateEmail(email) {
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }

                $element.find('.btnSubmit').on('click', function (event) {
                    $scope.errorFree = true;
                    var username = $element.find('#inputName').val();
                    if (username == "") {
                        return;
                    } else if (username.length < 5 || username.length > 15) {
                        $element.find('#inputName').parent().find('.help-block').html('Length must between 5 - 15.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#inputName').parent().find('.help-block').html('');
                    }

                    var displayname = $element.find('#inputDisplayName').val();
                    if (displayname == "") {
                        return;
                    } else if (displayname.length < 5 || displayname.length > 15) {
                        $element.find('#inputDisplayName').parent().find('.help-block').html('Length must between 5 - 15.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#inputDisplayName').parent().find('.help-block').html('');
                    }

                    var email = $element.find('#inputEmail').val();
                    if (email == "") {
                        return;
                    } else if (validateEmail(email) != true) {
                        $element.find('#inputEmail').parent().find('.help-block').html('Invalid email.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#inputEmail').parent().find('.help-block').html('');
                    }

                    var gender = $element.find('#radGender input:radio:checked').val();
                    if (gender == undefined) {
                        $element.find('#radGender').parent().find('.help-block').html('Please choose your gender.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#radGender').parent().find('.help-block').html('');
                    }

                    var pass = $element.find('#inputPassword').val();
                    var confirmPass = $element.find('#inputPasswordConfirm').val();
                    if (pass == "") {
                        return;
                    } else if (pass.length < 6 || pass.length > 15) {
                        $element.find('#inputPassword').parent().find('.help-block').html('Password range 6 - 15 only.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#inputPassword').parent().find('.help-block').html('');
                    }

                    if (confirmPass == "") {
                        return;
                    } else if (confirmPass != pass) {
                        $element.find('#inputPasswordConfirm').parent().find('.help-block').html('password not match.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#inputPasswordConfirm').parent().find('.help-block').html('');
                    }


                    var faculty = $('#radFaculty input:radio:checked').val();
                    if (faculty == undefined) {
                        $element.find('#radFaculty').parent().find('.help-block').html('Please choose your faculty.').css('color', 'red');
                        $scope.errorFree = false;
                        return;
                    } else {
                        $element.find('#radFaculty').parent().find('.help-block').html('');
                    }

                    if ($scope.errorFree) {
                        var attrs = {};
                        attrs.username = username;
                        attrs.displayname = displayname;
                        attrs.email = email;
                        attrs.gender = gender;
                        attrs.password = pass;
                        attrs.status = "active";
                        attrs.role = "student";
                        attrs.faculty = faculty;

                        deploydService.CreateUser(attrs, function (res) {
                            if (res.id != undefined) {
                                $element.modal('hide');
                                alert('Successful registered, now you may proceed to login.');
                                $element.parent().find('#my_login_Modal').modal('show');
                            } else if (res.status == 400) {
                                alert('username registered, try to use other name.');
                            }
                        });
                    }


                });

                $element.find('.btnCancel').on('click', function (event) {
                    $element.find('#inputName').val('');
                    $element.find('#inputPass').val('');
                    $element.find('.invalidInput').hide();

                });

                $element.find('.faculty a').on('click', function (event) {
                    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
                    $(this).parents(".dropdown").find('.btn').val($(this).text());

                });

            }
            // removed from first div = 'ng-click="showAllIndice()"'
            return {
                restrict: 'E',
                template: '<div class="modal fade" id="my_signup_Modal" role="dialog">' +
                            '<div class="modal-dialog">' +
                            '<div class="modal-content">' +

                            '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                            '<h4 class="modal-title">Registration</h4>' +
                            '</div>' +

'<form role="form" class="registrationForm">' +
'<div class="form-group">' +
'<label for="inputName" class="control-label">Name</label>' +
'<input type="text" class="form-control" id="inputName" data-minlength="5" maxlength="15" placeholder="Use for login (Min 5, Max 15 words)." required>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

'<div class="form-group">' +
'<label for="inputName" class="control-label">Display Name</label>' +
'<input type="text" class="form-control" id="inputDisplayName" data-minlength="5" maxlength="15" placeholder="Display Name (Min 5, Max 15 words)." required>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

'<div class="form-group">' +
'<label for="inputEmail" class="control-label">Email</label>' +
'<input type="email" class="form-control" id="inputEmail" placeholder="Email" data-error="Bruh, that email address is invalid" required>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

'<div class="form-group">' +
'<label for="gender" class="control-label">Gender : </label>' +
'<div class="btn-group" id="radGender" data-toggle="buttons">' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radgender" value="male"/>Male' +
'</label>' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radgender" value="female"/> Female' +
'</label>' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radgender" value="unknown"/> Unknown' +
'</label>' +
'</div>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

'<div class="form-group">' +
'<label for="inputPassword" class="control-label">Password</label>' +
'<div class="form-group">' +
'<input type="password" data-minlength="6" maxlength="15" class="form-control" id="inputPassword" placeholder="Minimum of 6 characters" required>' +
'<div class="help-block with-errors"></div>' +
'</div>' +
'<div class="form-group">' +
'<input type="password" class="form-control" id="inputPasswordConfirm" data-match="#inputPassword" data-match-error="passwordn not match" placeholder="Confirm Passsword" required>' +
'<div class="help-block with-errors"></div>' +
'</div>' +
'</div>' +

'<div class="form-group">' +
'<label for="gender" class="control-label">Faculty : </label>' +
'<div class="btn-group" id="radFaculty" data-toggle="buttons">' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radfaculty" value="FASC"/>FASC' +
'</label>' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radfaculty" value="FAFB"/> FAFB' +
'</label>' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radfaculty" value="FEBE"/> FEBE' +
'</label>' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radfaculty" value="FSAH"/> FSAH' +
'</label>' +
'<label class="btn btn-default blue">' +
'<input type="radio" class="radfaculty" value="CPUS"/> CPUS' +
'</label>' +
'</div>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

                //'<div class="form-group faculty btn-group">' +
                //'<select class="c-select" required>' +
                //'<option selected disabled>Faculty</option>' +
                //'<option value="FASC">FASC</option>' +
                //'<option value="FAFB">FAFB</option>' +
                //'<option value="FEBE">FEBE</option>' +
                //'<option value="FSAH">FSAH</option>' +
                //'<option value="CPUS">CPUS</option>' +
                //'</select>' +
                //'<div class="help-block with-errors"></div>' +
                //'</div>' +

'<div class="modal-footer form-group">' +
'<button type="submit" class="btn btn-default btnSubmit">Submit</button>' +
'</div>' +
'</form>' +
                            '</div>' +
                            '</div>' +
                            '</div>',
                controller: ['$scope', '$element', controllerFn],
                //link: showAll,
                replace: true
            };
        } ]);
    });
