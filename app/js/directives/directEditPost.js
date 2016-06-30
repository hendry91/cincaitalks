define(['directives/directives'],
    function (directives) {
        directives.directive('directEditPost', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {


            function init($scope, $element, $attrs) {
                $($element).ready(function () {
                    $rootScope.$on("editPost", function (e) {
                        content = $rootScope.contentDetails;

                        $scope.postid = content.id;
                        $scope.postTitle = content.title;
                        $scope.postContent = content.content;
                        $scope.backupContent = angular.copy(content.content);
                        $scope.postDate = $scope.formatFromTodayDate(content.date);
                        $scope.postBy = content.displayname;
                        $scope.postType = content.postType;
                        $scope.usenick = content.usenick;
                        $element.find('.txtComment').autoGrow({
                            extraLine: true
                        });
                        $element.modal('show');
                    });
                });

                $scope.btnSubmitEdit = function (res) {
                    console.log($scope.backupContent);
                    var inputComment = $element.find('.txtComment').val().trim();

                    if($scope.backupContent === inputComment){
                        $element.find('.txtComment').parent().find('.help-block').html('Please modify your content.').css('color', 'red');
                        return;
                    }

                    if (inputComment == "") {
                        $element.find('.txtComment').parent().find('.help-block').html('Please enter your comment').css('color', 'red');
                        return;
                    } else if (inputComment.length < 5 || inputComment.length > 5000) {
                        $element.find('.txtComment').parent().find('.help-block').html('Length must between 5 - 5000.').css('color', 'red');
                        return;
                    } else {
                        $element.find('.txtComment').parent().find('.help-block').html('');
                    }

                    authServices.GetCurrentUser(function (res) {
                        if (res == -1) {
                            alert("Login error, if saw this message, please report to admin.");
                        } else {
                            var currUser = res.username;
                            var attrsbackup = { postid: $scope.postid, username: currUser, content: $scope.backupContent };
                            var attrs = { postid: $scope.postid, content: inputComment, updatedby: currUser, lastdate: new Date() };

                            deploydService.Addbackup(attrsbackup, "backuppost", function (res) {
                                if (res.id != undefined) {
                        deploydService.UpdatePost(attrs, $scope.postType, function (res) {
                                        if (res.id != undefined) {
                                alert("Post updated.");
                                $rootScope.$broadcast('refreshPost');
                                $element.modal('hide');
                                        } else {
                                            alert("Something wrong, please report to admin with code x00979.");
                                        }
                                    });
                                } else {
                                    alert("Something wrong, please report to admin with code x00978.");
                                }

                            });
                            }
                        });
                }
            }

            return {
                restrict: 'E',
                template: '<div class="modal fade" id="my_editPost_Modal" role="dialog">' +
                            '<div class="modal-dialog">' +
                            '<!-- Modal content-->' +
                            '<div class="modal-content">' +
                            '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                            '<h4 class="modal-title">{{postTitle}}</h4>' +
                            '<small class="text-muted"> {{postDate}} was posted by :{{postBy}}' +
                            '<i class="fa fa-star-o" aria-hidden="true" style="color:red" ng-if="usenick == true" data-toggle="tooltip" data-placement="bottom" title="This star mean the author use custom nickname to post."></i></small>' +
                            '</div>' +
                            '<img src="img/loading.gif" id="loading-indicator" style="display:none" />' +
                            '<form role="form">' +
                                '<div class="form-group">' +
                                    '<textarea class="form-control txtComment overflowauto" rows="10" maxlength="5000" required style="max-height: 400px;min-height: 100px;background: #fafffd;padding-left: 10px;padding-top: 10px;overflow: auto;" class="form-control" id="comment" ng-bind-html = "postContent | newLine" ng-model="postContent"></textarea>' +
                                    '<div class="help-block with-errors"></div>' +
                                '</div>' +
                            '</form>' +
                            '<div class="modal-footer form-group">' +
                            '<button type="submit" class="btn btn-default" ng-click="btnSubmitEdit()">Submit</button>' +
                            '<button type="button" class="btn btn-default cancelPost" data-dismiss="modal">Close</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>',
                link: init,
                replace: true
            };
        } ]);
    });
