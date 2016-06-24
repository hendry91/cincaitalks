define(['directives/directives', 'moment'],
    function (directives, moment) {
        directives.directive('directPostDetails', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function init($scope, $element, $attrs) {

                $element.find('.btnSubmit').on('click', function () {
                    var comment = $element.find('#comment').val();
                    if (comment == "") {
                        $element.find('#comment').parent().find('.help-block').html('Please enter your comment.').css('color', 'red');
                        return;
                    } else if (comment.length < 5) {
                        $element.find('#comment').parent().find('.help-block').html('Comment must more than 5 words.').css('color', 'red');
                        return;
                    } else {
                        $element.find('#comment').parent().find('.help-block').html('');
                        authServices.GetCurrentUser(function (res) {
                            if (res.displayname != undefined) {
                                var inputNickname = $element.find('.inputNickname').val();

                                if (inputNickname != "") {
                                    if (inputNickname.length < 5) {
                                        $element.find('.inputNickname').parent().parent().find('.help-block-input').html('Nickname must more than 5 words.').css('color', 'red');
                                    } else {
                                        nickname = inputNickname;
                                        usenick = true;
                                    }
                                } else {
                                    nickname = res.displayname;
                                    usenick = false;
                                }

                                var attrs = {};
                                attrs.postid = $scope.postid;
                                attrs.displayname = nickname;
                                attrs.username = res.username;
                                attrs.date = new Date();
                                attrs.content = comment;
                                attrs.categories = $scope.postType;
                                attrs.nickname = usenick;
                                createPost(attrs, function (res) {
                                    alert("successful commeted");
                                });

                            } else {
                                var inputNickname = $element.find('.inputNickname').val();
                                if (inputNickname == "") {
                                    $element.find('.inputNickname').parent().parent().find('.help-block-input').html('You have no login, Please use a nickname.').css('color', 'red');
                                    $element.find('input#chkNickname').addClass('checked');
                                    $scope.isCheck = true;
                                } else if (inputNickname.length < 5) {
                                    $element.find('.inputNickname').parent().parent().find('.help-block-input').html('Nickname must more than 5 words.').css('color', 'red');
                                    $element.find('input#chkNickname').addClass('checked');
                                    $scope.isCheck = true;
                                } else {
                                    $element.find('.inputNickname').parent().parent().find('.help-block-input').html('');
                                    var attrs = {};
                                    attrs.postid = $scope.postid;
                                    attrs.displayname = inputNickname;
                                    attrs.username = "anonymous";
                                    attrs.date = new Date();
                                    attrs.content = comment;
                                    attrs.categories = $scope.postType;
                                    attrs.nickname = true;
                                    createPost(attrs, function (res) {
                                        alert("successful commeted");

                                    });
                                }
                            }
                        })
                    }
                });

                function createPost(attrs, callback) {

                    deploydService.CreateComment(attrs, "comment", function (res) {
                        if (res.id != undefined) {
                            $scope.isCheck = false;
                            $element.find('input#chkNickname').removeClass('checked');
                            $element.find('.inputNickname').val('');
                            $element.find('#comment').val('');
                            refreshComment();
                        } else {
                            alert("failed to comment, please try again or contact admin.");
                        }
                    });
                }

                function refreshComment() {
                    console.log($element, $scope);
                    deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                        $scope.commentdb = res;
                        if ($scope.commentdb.length - $scope.commentLimit > 3) {
                            $scope.remainLength = $scope.commentdb.length - $scope.commentLimit;
                            $scope.displayAllComment = true;
                        } else {
                            $scope.displayAllComment = false;
                            ($scope.commentdb.length > 3) ? $scope.displayReadmore = true : $scope.displayReadmore = false;
                        }
                    });
                }

                $($element).ready(function () {
                    $rootScope.$on("openPost", function (e) {
                        content = $rootScope.contentDetails;
                        $scope.postid = content.id;
                        $scope.postTitle = content.title;
                        $scope.postContent = content.content;
                        $scope.postDate = $scope.formatFromTodayDate(content.date);
                        $scope.postBy = content.displayname;
                        $scope.liked = content.liked.length;
                        $scope.disliked = content.disliked.length;
                        $scope.commented = content.commented.length;
                        $scope.shited = content.shited.length;
                        $scope.loved = content.loved.length;
                        $scope.postType = content.postType;
                        $element.modal('show');
                    });

                    $element.find('#comment').autoGrow({
                        extraLine: true
                    });

                    $("#my_postDetails_Modal").on('hidden.bs.modal', function () {
                        $(this).data('bs.modal', null);
                        $element.find('#collapseComment').collapse("hide");
                        $scope.commentdb = [];
                    });

                    $scope.readMoreComment = function () {
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentdb = res;
                            var remain = $scope.commentdb.length - $scope.commentLimit;
                            if ($scope.commentLimit < $scope.commentdb.length) {
                                (remain >= 3) ? $scope.commentLimit += 3 : $scope.commentLimit += remain;
                                (remain >= 3) ? $scope.remainLength -= 3 : $scope.remainLength -= remain;
                                ($scope.remainLength > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
                                //(remain <= 3) ? $scope.displayRefreshbtn = true : $scope.displayRefreshbtn = false;
                                $scope.displayCollapsebtn = true;
                            }
                            ($scope.commentdb.length > $scope.commentLimit) ? $scope.displayReadmore = true : $scope.displayReadmore = false;
                        });
                    }
                    $scope.readAllComment = function () {
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentLimit = res.length;
                            $scope.remainLength = 0;
                            $scope.displayAllComment = false;
                            $scope.displayReadmore = false;
                            //$scope.displayRefreshbtn = true;
                            $scope.displayCollapsebtn = true;
                        });
                    }
                    $scope.refreshAllComment = function () {
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentdb = res;
                            $scope.commentLimit = 3;
                            $scope.displayCollapsebtn = false;
                            if ($scope.commentdb.length == $scope.commentLimit) {
                                return;
                            } else {
                                var remain = $scope.commentdb.length - $scope.commentLimit;
                                (remain > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
                                //(remain <= 3) ? $scope.displayRefreshbtn = true : $scope.displayRefreshbtn = false;
                                (($scope.commentdb.length - $scope.commentLimit) > 3) ? $scope.remainLength = $scope.commentdb.length - 3 : "";
                                ($scope.commentdb.length > $scope.commentLimit) ? $scope.displayReadmore = true : $scope.displayReadmore = false;
                            }
                        });
                    }

                    $scope.collapseAllComment = function () {
                        $scope.commentLimit = 3;
                        $scope.displayCollapsebtn = false;
                        ($scope.commentdb.length > $scope.commentLimit) ? $scope.displayReadmore = true : $scope.displayReadmore = false;
                        (($scope.commentdb.length - $scope.commentLimit) > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
                        (($scope.commentdb.length - $scope.commentLimit) > 3) ? $scope.remainLength = $scope.commentdb.length - 3 : "";
                    }

                    $element.find('#collapseComment').on('show.bs.collapse', function () {
                        $scope.commentLimit = 3;
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentdb = res;
                            $scope.displayCollapsebtn = false;
                            $scope.displayRefreshbtn = true;
                            ($scope.commentdb.length > 3) ? $scope.remainLength = $scope.commentdb.length - 3 : "";
                            ($scope.commentdb.length > 3) ? $scope.displayReadmore = true : $scope.displayReadmore = false;
                            ($scope.remainLength > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
                            //($scope.commentdb.length <= 3) ? $scope.displayRefreshbtn = true : $scope.displayRefreshbtn = false;
                        });
                    });
                });

                var endOfToday = moment().endOf('day');
                var startOfToday = moment().startOf('day');
                $scope.formatFromTodayDate = function (date) {
                    if (moment(date) >= startOfToday && moment(date) <= endOfToday)
                        return moment(date).fromNow();
                    else
                        return moment(date).format('DD-MM-YYYY, h:mm a');
                };
            }

            return {
                restrict: 'E',
                template: '<div class="modal fade" id="my_postDetails_Modal" role="dialog">' +
                            '<div class="modal-dialog">' +
                            '<!-- Modal content-->' +
                            '<div class="modal-content">' +
                            '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                            '<h4 class="modal-title">{{postTitle}}</h4>' +
                            '<small class="text-muted"> {{postDate}} was posted by :{{postBy}}</small>' +
                            '</div>' +
                            '<form role="form">' +
                            '<div class="form-group">' +
                                '<p style="max-height: 250px;min-height: 100px;background: aquamarine;padding-left: 10px;padding-top: 10px;overflow: auto;">{{postContent}}</p>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<span><a class="btnLike" style="font-size: 20px;cursor: pointer;">&#128077; {{liked}} Like </a> </span>' +
                                '<span><a class="btnDislike" style="font-size: 20px;cursor: pointer;">&#128078; {{disliked}} Dislike </a> </span> ' +
                                '<span><a class="btnShit" style="font-size: 20px;cursor: pointer;color: brown;">&#128169; {{shited}} Shit </a></span>' +
                                '<span><a class="btnLove" style="font-size: 20px;cursor: pointer;color:red">&#x2764; {{loved}} Love </a> </span> ' +
                                '<span><a class="btnComment" style="font-size: 20px;cursor: pointer;color:#4acdea;" data-toggle="collapse" href="#collapseComment">&#128172; {{commented}} Comment </a> </span> ' +
                            '</div>' +
                            '<div class="collapse" id="collapseComment">' +
                                '<div class="container">' +
                                    '<div class="row">' +
                                         '<a ng-click="readMoreComment()" ng-if="displayReadmore" href=""><small class="text-muted">Read more</small></a>' +
                                         '<a ng-click="readAllComment()" ng-if="displayAllComment" href="" style="margin-left: 10px;"><small class="text-muted">Read previous {{remainLength}} comment</small></a>' +
                                         '<a ng-click="collapseAllComment()" ng-if="displayCollapsebtn" href="" style="margin-left: 10px;"><small class="text-muted">collapse</small></a>' +
                                         '<a ng-click="refreshAllComment()" ng-if="displayRefreshbtn" href="" style="margin-left: 10px;"><small class="text-muted">Refresh comment</small></a>' +
                                        '<div ng-repeat="comment in commentdb | limitTo:commentLimit | orderBy:\'date\'"  class="col-sm-12" style="border-bottom: 1px solid #ebebeb;max-height: 100px;min-height: 50px;text-align: left;">' +
                                            '<div><strong style="color:blue">{{comment.displayname}}</strong> : {{comment.content}} </div>' +
                                            '<div><small class="text-muted">{{formatFromTodayDate(comment.date)}}</small></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<form role="form">' +
                                    '<div class="form-group card-block card">' +
                                        '<textarea class="form-control" rows="3" id="comment" placeholder="Enter comment" ></textarea>' +
                                        '<div class="help-block with-errors"></div>' +

                                        '<div class="form-group">' +
                                            '<div class="input-group">' +
                                            '<span class="input-group-addon">' +
                                            '<input type="checkbox" id="chkNickname" aria-label="Checkbox for following text input" ng-checked="isCheck" ng-disabled="disableNickname">Use nickname' +
                                            '</span>' +
                                            '<input type="text" class="form-control inputNickname" placeholder="Leave it empty if do not want to use nickname" data-minlength="5" maxlength="25" aria-label="Text input with checkbox" ng-disabled="isDisableInputNickname">' +
                                            '</div>' +
                                            '<div class="help-block-input with-errors"></div>' +
                                        '</div>' +

                                        '<button class="btn btn-primary btnSubmit" type="submit">Submit</button>' +
                                    '</div>' +
                                '</form>' +
                            '</div>' +
                            '</form>' +
                            '</div>' +
                            '</div>' +
                            '</div>',
                link: init,
                replace: true
            };
        } ]);
    });
