define(['directives/directives'],
    function (directives) {
        directives.directive('directCreatePost', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function init($scope, $element, $attrs) {
                $($element).ready(function () {
                    $scope.isDisable = undefined;
                    $scope.isCheck = undefined;
                    $scope.disableNickname = undefined;
                    $scope.disableCategories = undefined;
                    $rootScope.$on("createPost", function (e) {
                        $scope.currUser = undefined;
                        authServices.GetCurrentUser(function (res) {
                            if (res == -1) {
                                $scope.userName = "anonymous";
                                $scope.currUser = "anonymous";
                                $element.find('input#chkNickname').addClass('checked');

                                $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;

                                $element.find('.categoriesFieldset > div > .radio-inline').css('color', 'gainsboro');
                                $element.find('.categoriesFieldset > div > .help-block').html("you have no login, only able post to Public's wall.").css('color', 'red');

                                $scope.disableCategories = true;
                                $scope.isCheck = true;
                                $scope.isDisable = false;
                                $scope.disableNickname = true;

                            } else {
                                if (res.displayname != undefined) { //deployd login
                                    $scope.userName = res.displayname;
                                    $scope.currUser = res.displayname;

                                    $element.find('.categoriesFieldset > div > .radio-inline').css('color', '');
                                    $element.find('.categoriesFieldset > div > .help-block').html("");
                                    $element.find('input#chkNickname').removeClass('checked');
                                    $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;

                                    $scope.disableCategories = false;
                                    $scope.isCheck = false;
                                    $scope.disableNickname = false;
                                    $scope.isDisable = true;

                                } else if (res.status == "connected") { //facebook login
                                    $scope.userName = res.authResponse.userID;
                                    $scope.currUser = res.authResponse.userID;
                                    $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;

                                    $element.find('.categoriesFieldset > div > .radio-inline').css('color', '');
                                    $element.find('.categoriesFieldset > div > .help-block').html("");
                                    $element.find('input#chkNickname').removeClass('checked');

                                    $scope.disableCategories = false;
                                    $scope.isCheck = false;
                                    $scope.disableNickname = false;
                                    $scope.isDisable = true;
                                }
                            }
                        });
                    });

                    $element.find('input#chkNickname').change(function () {
                        if ($element.find('input#chkNickname').is(':checked')) {
                            $element.find('input#chkNickname').addClass('checked');
                            $scope.$apply(function () {
                                $scope.isDisable = false;
                            });
                        } else {
                            $element.find('input#chkNickname').removeClass('checked');
                            $scope.$apply(function () {
                                $scope.isDisable = true;
                            });
                        }
                    });

                    $element.find('.submitPost').on('click', function (event) {
                        // event.preventDefault(); // To prevent following the link (optional)

                        //$('.categoriesFieldset > .form-group  input:radio:checked') get checked radio
                        var chkNickname = $element.find('input#chkNickname').is(':checked');

                        if (chkNickname) {
                            var inputNick = $element.find('.inputNickname').val();
                            if (inputNick == "") {
                                return;
                            } else if (inputNick.length < 5 || inputNick.length > 25) {
                                $element.find('.inputNickname').parent().parent().find('.help-block').html('Length must between 5 - 25.').css('color', 'red');
                                return;
                            } else {
                                $element.find('.inputNickname').parent().parent().find('.help-block').html('');
                            }
                        }

                        var inputTitle = $element.find('.txtTitle').val();
                        if (inputTitle == "") {
                            return;
                        } else if (inputTitle.length < 5 || inputTitle.length > 30) {
                            $element.find('.txtTitle').parent().find('.help-block').html('Length must between 5 - 30.').css('color', 'red');
                            return;
                        } else {
                            $element.find('.txtTitle').parent().find('.help-block').html('');
                        }

                        var inputComment = $element.find('.txtComment').val();
                        if (inputComment == "") {
                            return;
                        } else if (inputComment.length < 15 || inputComment.length > 1000) {
                            $element.find('.txtComment').parent().find('.help-block').html('Length must between 15 - 1000.').css('color', 'red');
                            return;
                        } else {
                            $element.find('.txtComment').parent().find('.help-block').html('');
                        }

                        if ($scope.currUser == "anonymous") {
                            var checkedCategories = "Public";
                        } else {
                            var checkedCategories = $element.find('.categoriesFieldset > .form-group  input:radio:checked').val();
                        }

                        var attrs = {
                            username: $scope.currUser,
                            displayname: chkNickname ? inputNick : $scope.currUser,
                            title: inputTitle,
                            content: inputComment,
                            image: "null",
                            liked: 0,
                            commented: 0,
                            shited: 0,
                            loved: 0,
                            disliked: 0,
                            date: new Date()
                        };

                        switch (checkedCategories) {
                            case "Other":
                                proceedCreateAPI(attrs, "other");
                                break;
                            case "BehTahan":
                                proceedCreateAPI(attrs, "complain");
                                break;
                            case "F&B":
                                proceedCreateAPI(attrs, "fnb");
                                break;
                            case "Sport":
                                proceedCreateAPI(attrs, "sport");
                                break;
                            case "LoveStory":
                                proceedCreateAPI(attrs, "love");
                                break;
                            case "Entertainment":
                                proceedCreateAPI(attrs, "entertainment");
                                break;
                            case "S&R":
                                proceedCreateAPI(attrs, "salesnrent");
                                break;
                            default:
                                proceedCreateAPI(attrs, "public");
                                break;
                        }
                    });

                    $element.find('.cancelPost').on('click', function (event) {
                        $element.modal('hide');
                    });
                });

                function proceedCreateAPI(attrs, categoriesType) {
                    deploydService.CreatePost(attrs, categoriesType, function (res) {
                        if (res != undefined && res.id != undefined) {
                            alert("Successful posted.");
                            resetField();
                        }
                    });
                }

                function resetField() {
                    if ($scope.currUser != "anonymous") {
                        $element.find('.inputNickname').val('');
                        $element.find('.txtTitle').val('');
                        $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;
                        $element.find('.txtComment').val('');
                        $scope.isCheck = false;
                        $scope.isDisable = true;
                        $scope.disableNickname = true;
                    } else {
                        $element.find('.inputNickname').val('');
                        $element.find('.txtTitle').val('');
                        $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;
                        $element.find('.txtComment').val('');
                    }
                }

            }


            // removed from first div = 'ng-click="showAllIndice()"'
            return {
                restrict: 'E',
                template: '<div class="modal fade" id="my_create_post_Modal" role="dialog">' +
                        '<div class="modal-dialog">' +
                        '<!-- Modal content-->' +
                        '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                        '<h4 class="modal-title">Create new post</h4>' +
                        '</div>' +
'<form role="form">' +
'<div class="form-group">' +
'<label for="usr">Name : {{userName}}</label>' +
'</div>' +
'<div class="form-group">' +
'<div class="input-group">' +
'<span class="input-group-addon">' +
'<input type="checkbox" id="chkNickname" aria-label="Checkbox for following text input" ng-checked="isCheck" ng-disabled="disableNickname">Use nickname' +
'</span>' +
'<input type="text" class="form-control inputNickname" data-minlength="5" maxlength="25" required aria-label="Text input with checkbox" ng-disabled="isDisable">' +
'</div>' +
'<div class="help-block with-errors"></div>' +
'</div>' +
'<div class="form-group">' +
'<label for="usr">Post Title : </label>' +
'<input type="text" class="form-control txtTitle" required data-minlength="5" maxlength="30" id="usr" placeholder="Enter your post Title.">' +
'<div class="help-block with-errors"></div>' +
'</div>' +
'<fieldset class="categoriesFieldset" ng-disabled="disableCategories">' +
'<div class="form-group">' +
'<label for="usr">Categories : </label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="F&B"> F&B' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="Sport"> Sport' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="BehTahan"> Beh Tahan' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="LoveStory"> Love Story' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="Entertainment"> Entertainment' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="S&R"> Sales & Rent' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="Other"> Other' +
'</label>' +
'<label class="radio-inline">' +
'<input type="radio" name="optradio" value="Public"> Public' +
'</label>' +
'<div class="help-block with-errors"></div>' +
'</div>' +
'</fieldset>' +
'<div class="form-group">' +
'<label for="comment">Comment:</label>' +
'<textarea class="form-control txtComment" rows="5" id="comment" data-minlength="15" maxlength="1000" required></textarea>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

'<div class="modal-footer  form-grou">' +
'<button type="submit" class="btn btn-default submitPost">Submit</button>' +
'<button type="button" class="btn btn-default cancelPost">Close</button>' +
'</form>' +
                        '</div>' +
                        '</div>' +
                        '</div></div>',
                link: init,
                //link: showAll,
                replace: true
            };
        } ]);
    });
