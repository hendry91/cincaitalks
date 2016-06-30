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
                                if (res.status == "active") {
                                    $scope.userName = res.username;
                                    $scope.currUser = res.displayname;

                                    $element.find('.categoriesFieldset > div > .radio-inline').css('color', '');
                                    $element.find('.categoriesFieldset > div > .help-block').html("");
                                    $element.find('input#chkNickname').removeClass('checked');
                                    $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;

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
                            } else if (inputNick.length < 3 || inputNick.length > 25) {
                                $element.find('.inputNickname').parent().parent().find('.help-block').html('Length must between 3 - 25.').css('color', 'red');
                                return;
                            } else {
                                $element.find('.inputNickname').parent().parent().find('.help-block').html('');
                            }
                        }

                        var inputTitle = $element.find('.txtTitle').val();
                        if (inputTitle == "") {
                            return;
                        } else if (inputTitle.length < 3 || inputTitle.length > 30) {
                            $element.find('.txtTitle').parent().find('.help-block').html('Length must between 3 - 30.').css('color', 'red');
                            return;
                        } else {
                            $element.find('.txtTitle').parent().find('.help-block').html('');
                        }

                        var inputComment = $element.find('.txtComment').val().trim();
                        if (inputComment == "") {
                            $element.find('.txtComment').parent().find('.help-block').html('Please enter your comment').css('color', 'red');
                            return;
                        } else if (inputComment.length < 5 || inputComment.length > 5000) {
                            $element.find('.txtComment').parent().find('.help-block').html('Length must between 5 - 5000.').css('color', 'red');
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
                            username: $scope.userName,
                            displayname: chkNickname ? inputNick : $scope.currUser,
                            title: inputTitle,
                            content: inputComment,
                            image: "null",
                            liked: [],
                            commentedCount: 0,
                            shited: [],
                            loved: [],
                            disliked: [],
                            date: new Date(),
                            usenick: (inputNick != undefined) ? true : false
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
                            case "L&F":
                                proceedCreateAPI(attrs, "lnf");
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

                $("#my_create_post_Modal").on('hidden.bs.modal', function () {
                    resetField();
                });

                function proceedCreateAPI(attrs, categoriesType) {
                    deploydService.CreatePost(attrs, categoriesType, function (res) {
                        if (res != undefined && res.id != undefined) {
                            alert("Successful posted.");
                            resetField();
                            $rootScope.$broadcast('refreshPost');
                        }
                    });
                }

                function resetField() {
                    if ($scope.currUser != "anonymous") {
                        $element.find('.inputNickname').val('');
                        $element.find('.txtTitle').val('');
                        $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;
                        $element.find('input#chkNickname').prop('checked', false);
                        $element.find('.txtComment').val('');
                        $scope.isCheck = false;
                        $scope.isDisable = true;
                        $scope.disableNickname = false;
                    } else {
                        $element.find('.inputNickname').val('');
                        $element.find('.txtTitle').val('');
                        $element.find('.categoriesFieldset > .form-group  input:radio')[7].checked = true;
                        $element.find('.txtComment').val('');
                        $scope.disableNickname = true;
                        $element.find('input#chkNickname').prop('checked', true);
                        $scope.isCheck = true;
                        $scope.isDisable = false;
                    }
                }

            }

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
'<label for="usr">Name : {{currUser}}</label>' +
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
'<input type="radio" name="optradio" value="L&F"> Lost & Found' +
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
'<textarea class="form-control txtComment" rows="5" id="comment" data-minlength="15" maxlength="5000" required></textarea>' +
'<div class="help-block with-errors"></div>' +
'</div>' +

'<div class="modal-footer form-group">' +
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
