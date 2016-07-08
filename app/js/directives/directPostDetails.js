define(['directives/directives', 'moment'],
    function (directives, moment) {
        directives.directive('directPostDetails', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function init($scope, $element, $attrs) {
                // $element.find('.btnSubmit').on('click', function () {
                $scope.commentSubmit = function (){ 
                    var comment = $element.find('#comment').val();
                    if (comment == "") {
                        $element.find('#comment').parent().find('.help-block').html('Please enter your comment.').css('color', 'red');
                        return;
                    } else if (comment.length < 2) {
                        $element.find('#comment').parent().find('.help-block').html('Comment must more than 2 character.').css('color', 'red');
                        return;
                    } else {
                        $element.find('#comment').parent().find('.help-block').html('');
                        authServices.GetCurrentUser(function (res) {
                            if (res.displayname != undefined) {
                                var inputNickname = $element.find('.inputNickname').val();

                                if (inputNickname == "") {
                                    nickname = res.displayname;
                                    usenick = false;
                                } else if (inputNickname.length < 3) {
                                        $element.find('.inputNickname').parent().parent().find('.help-block-input').html('Nickname must more than 3 character.').css('color', 'red');
                                    return;
                                    } else {
                                        nickname = inputNickname;
                                        usenick = true;
                                    }

                                var attrs = {};
                                attrs.postid = $scope.postid;
                                attrs.displayname = nickname;
                                attrs.username = res.username;
                                attrs.date = new Date();
                                attrs.content = comment;
                                attrs.categories = $scope.postType;
                                attrs.usenick = usenick;
                                attrs.isfb = (res.role == "FB") ? true : false;
                                createPost(attrs, function (res) {
                                    alert("successful commeted");
                                });

                            } else {
                                var inputNickname = $element.find('.inputNickname').val();
                                var attrs = {};
                                if (inputNickname == "") {
                                    attrs.displayname = "anonymous";
                                    attrs.username = "anonymous";
                                } else if (inputNickname.length < 3) {
                                    $element.find('.inputNickname').parent().parent().find('.help-block-input').html('Nickname must more than 3 character.').css('color', 'red');
                                    return;
                                } else {
                                    attrs.displayname = inputNickname;
                                    attrs.username = "anonymous";
                                }
                                attrs.postid = $scope.postid;
                                    attrs.date = new Date();
                                    attrs.content = comment;
                                    attrs.categories = $scope.postType;
                                    attrs.usenick = true;
                                attrs.isfb = false;
                                    createPost(attrs, function (res) {
                                        alert("successful commeted");
                                    });
                                }
                            $element.find('.inputNickname').parent().parent().find('.help-block-input').html('');
                        })
                    }
                }
                // });

                function createPost(attrs, callback) {
                    deploydService.CreateComment(attrs, "comment", function (res) {
                        if (res.id != undefined) {
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
                    deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                        $scope.commentdb = res;
                        $scope.commentedCount = res.length;
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
                        $element.modal('show');
                        $('#overlay').show();
                        $element.find("#loading-indicator").show();
                        authServices.GetCurrentUser(function (res) {
                            if (res == -1) { //no login
                                $scope.currDisplayname = "anonymous";
                            } else if (res.displayname != undefined) { //deployd login
                                $scope.currDisplayname = res.displayname;
                            }

                            deploydService.GetPostbyPostid(content.id, content.postType, function (res) {
                                $scope.postid = res.id;
                                $scope.postTitle = res.title;
                                $scope.postContent = res.content;
                                $scope.postDate = $scope.formatFromTodayDate(res.date);
                                $scope.postBy = res.displayname;
                                $scope.liked = res.liked.length;
                                $scope.disliked = res.disliked.length;
                                $scope.shited = res.shited.length;
                                $scope.loved = res.loved.length;
                                $scope.postType = content.postType;
                                $scope.commentedCount = res.commentedCount;
                                    $scope.usenick = res.usenick;
                                $scope.isfb = res.isfb;
                                $scope.username = res.username;
                                $('#overlay').hide();
                                $element.find("#loading-indicator").hide();

                                $scope.thisPost = angular.copy(res);
                                checkPostAction($scope.thisPost);
                            });
                        });

                    });
                    $element.find('#comment').autoGrow({
                        extraLine: true
                    });

                    $("#my_postDetails_Modal").on('hidden.bs.modal', function () {
                        $(this).data('bs.modal', null);
                        $element.find('#collapseComment').collapse("hide");
                        $element.find('.inputNickname').parent().parent().find('.help-block-input').html('');
                        $element.find('.inputNickname').val('');
                        $element.find('#comment').val('');
                        $scope.commentdb = [];
                        $scope.hasDeleted = false;
                        $scope.commentDeleted = undefined;
                    });

                    $scope.readMoreComment = function () {
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentdb = res;
                            var remain = $scope.commentdb.length - $scope.commentLimit;
                            if ($scope.commentLimit < $scope.commentdb.length) {
                                (remain >= 3) ? $scope.commentLimit += 3 : $scope.commentLimit += remain;
                                (remain >= 3) ? $scope.remainLength -= 3 : $scope.remainLength -= remain;
                                ($scope.remainLength > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
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
                            $scope.displayCollapsebtn = true;
                        });
                    }
                    $scope.refreshAllComment = function () {
                        $scope.hasDeleted = false;
                        $scope.commentDeleted = undefined;
                        
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentdb = res;
                            $scope.commentLimit = 3;
                            $scope.displayCollapsebtn = false;
                            if ($scope.commentdb.length == $scope.commentLimit) {
                                return;
                            } else {
                                var remain = $scope.commentdb.length - $scope.commentLimit;
                                (remain > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
                                (($scope.commentdb.length - $scope.commentLimit) > 3) ? $scope.remainLength = $scope.commentdb.length - 3 : $scope.remainLength = $scope.commentdb.length;
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
                    
                    $scope.deleteComment = function(e){
                        $scope.hasDeleted = false;
                        $scope.currentCommentTarget = this.comment;
                        //$(e.target).popover("show");
                        if ($scope.currentCommentTarget.username != $scope.commentUser.username && $scope.commentUser.role != "admin") {
                            alert('ops, something wrong, if this comment belong to your, please report to admin!');
                        } else {
                            var attrs = { 
                                id: $scope.currentCommentTarget.id, 
                                status: "D", 
                                updatedby: $scope.commentUser, 
                                lastdate : new Date() 
                            }
                            
                            deploydService.DeleteComment(attrs, function (res) {
                                if (res.status == "D") {
                                    alert("your comment has been deleted.");
                                    $scope.currentCommentTarget.status = res.status;
                                    $scope.commentedCount --;
                                    $scope.commentDeleted = $scope.currentCommentTarget;
                                    $scope.hasDeleted = true;
                                    // for(var i=0;i<$scope.commentdb.length;i++){
                                    //     if($scope.commentdb[i].id == res.id){
                                    //         $scope.commentdb.splice(i,1);
                                    //         $scope.commentedCount --;
                                    //         break;
                                    //     }
                                    // }
                                }
                            });
                        }
                    }
                    
                    $scope.editComment = function(e){
                        $(e.target).parent().parent().parent().find(".help-block").html('');
                        $scope.currentCommentTarget = this.comment;
                        $scope.commentdb.forEach(function(res){
                            if(res.isEdit == true){
                                res.isEdit = false;
                                res.content = angular.copy($scope.commentBackup.content);
                            }
                        })
                        $scope.commentBackup = angular.copy($scope.currentCommentTarget);
                        $scope.currentCommentTarget.isEdit = true;
                        window.setTimeout(function() {
                            $element.find('.editComment').autoGrow({
                                extraLine: true
                            });
                        }, 0);
                    }
                    
                    $scope.updateComment = function(e){
                        $scope.currentCommentTarget = this.comment;
                        
                        var inputComment = $scope.currentCommentTarget.content.trim();
                        var commentRow = $(e.target).parent().parent().parent();
                        
                        if($scope.commentBackup.content === inputComment){
                            commentRow.find('.help-block').html('Please modify your content.').css('color', 'red');
                            return;
                        }
                        else if (inputComment == "") {
                            commentRow.find('.help-block').html('Please enter your comment.').css('color', 'red');
                            return;
                        } else if (inputComment.length < 2) {
                            commentRow.find('.help-block').html('Comment must more than 2 character.').css('color', 'red');
                            return;
                        } else {
                            commentRow.find('.help-block').html('');
                        }

                        authServices.GetCurrentUser(function (res) {
                            if (res == -1) {
                                alert("Login error, if saw this message, please report to admin.");
                            } else {
                                var currUser = res.username;
                                var attrsbackup = { commentid: $scope.currentCommentTarget.id , username: currUser, content: $scope.commentBackup.content };
                                var attrs = { commentid: $scope.currentCommentTarget.id, content: $scope.currentCommentTarget.content, updatedby: currUser, lastdate: new Date() };

                                deploydService.AddCommentBackup(attrsbackup, "backupcomment", function (res) {
                                    if (res.id != undefined) {
                                        deploydService.UpdateComment(attrs, function (res) {
                                            if (res.id != undefined) {
                                                alert("Post updated.");
                                                $scope.refreshAllComment();
                                                
                                            } else {
                                                alert("Something wrong, please report to admin with code x00979.");
                                                $scope.currentCommentTarget.isEdit = false;
                                            }
                                        });
                                    } else {
                                        alert("Something wrong, please report to admin with code x00978.");
                                        $scope.currentCommentTarget.isEdit = false;
                                    }
                                    
                                });
                                
                                }
                            });
                        
                    }
                    
                    $scope.commentCancel = function(e){
                        $scope.currentCommentTarget = this.comment;
                        $scope.currentCommentTarget.isEdit = false;
                        $(e.target).parent().parent().parent().find(".help-block").html('');
                        
                        if($scope.commentBackup.id == $scope.currentCommentTarget.id)
                            $scope.currentCommentTarget.content = angular.copy($scope.commentBackup.content);
                        else
                            console.debug("Invalid Backup ID")
                    }
                    
                    $scope.undoDeleted = function(){
                        var attrs = { 
                            id: $scope.commentDeleted.id, 
                            status: "A",
                            updatedby: $scope.commentUser, 
                        }
                            
                        deploydService.DeleteComment(attrs, function (res) {
                            if (res.status == "A") {
                                alert("your comment has been UNDO.");
                                $scope.commentDeleted.status = res.status;
                                $scope.commentedCount ++;
                                $scope.hasDeleted = false;
                                $scope.commentDeleted = undefined;
                                // for(var i=0;i<$scope.commentdb.length;i++){
                                //     if($scope.commentdb[i].id == res.id){
                                //         $scope.commentdb.splice(i,1);
                                //         $scope.commentedCount --;
                                //         break;
                                //     }
                                // }
                            }
                        });
                    }

                    $element.find('#collapseComment').on('show.bs.collapse', function () {
                        $scope.commentLimit = 3;
                        $('#overlay').show();
                        $scope.hasDeleted = false;
                        $scope.commentDeleted = undefined;
                        
                        authServices.GetCurrentUser(function (res) {
                            if (res == -1) { //no login
                                $scope.currLoginName = "anonymous";
                            } else if (res.displayname != undefined) { //deployd login
                                $scope.currLoginName = res.displayname;
                                $scope.commentUser = res;
                            }
                        });

                        $element.find("#loading-indicator").show();
                        deploydService.GetCommentbyPostid($scope.postid, "comment", function (res) {
                            $scope.commentdb = res;
                            $scope.displayCollapsebtn = false;
                            $scope.displayRefreshbtn = true;
                            ($scope.commentdb.length > 3) ? $scope.remainLength = $scope.commentdb.length - 3 : $scope.remainLength = $scope.commentdb.length;
                            ($scope.commentdb.length > 3) ? $scope.displayReadmore = true : $scope.displayReadmore = false;
                            ($scope.remainLength > 3) ? $scope.displayAllComment = true : $scope.displayAllComment = false;
                            $element.find("#loading-indicator").hide();
                            $('#overlay').hide();
                        });
                    });

                    var processBlock = false;
                    $scope.actionClicked = function (actionType, isActionType, e) {
                        if (!processBlock) {
                            processBlock = true;
                            if ($scope.thisPost[isActionType]) {
                                $scope.thisPost[actionType].splice($scope.thisPost[actionType].indexOf($scope.username));
                            }
                            else {
                                $scope.thisPost[actionType].push($scope.username);
                            }

                            var attr = {};
                            attr.id = $scope.thisPost.id;
                            attr[actionType] = $scope.thisPost[actionType];

                            deploydService.UpdatePostAction(attr, actionType, $scope.postType, function (res) {
                                $scope[actionType] = res[actionType].length;
                                $scope.thisPost[isActionType] = !($scope.thisPost[isActionType]);
                                processBlock = false;
                            })
                        }
                    }
                });

                var endOfToday = moment().endOf('day');
                var startOfToday = moment().startOf('day');
                $scope.formatFromTodayDate = function (date) {
                    if (moment(date) >= startOfToday && moment(date) <= endOfToday)
                        return moment(date).fromNow();
                    else
                        return moment(date).format('DD-MM-YYYY, h:mm a');
                };

                function checkPostAction(data) {
                    var actionString = ["liked", "disliked", "shited", "loved"];
                    var isActionString = ["isLiked", "isDisliked", "isShited", "isLoved"];

                    for (var i = 0; i < actionString.length; i++) {
                        $scope.thisPost[isActionString[i]] = false;
                        data[actionString[i]].forEach(function (res) {
                            if (res == $scope.username)
                                $scope.thisPost[isActionString[i]] = true;
                        })
                    }

                }
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
                            '<span ng-if="usenick == false && isfb == true"><small class="text-muted"> {{postDate}} was posted by <a href="http://www.facebook.com/{{username}}" target="_blank"  style="color:#a8168f">{{postBy}}</a></small></span>' +
                            '<span ng-if="usenick == true || isfb == false"><small class="text-muted"> {{postDate}} was posted by {{postBy}}</small></span>' +
                            '<i class="fa fa-star-o" aria-hidden="true" style="color:red" ng-if="usenick == true" data-toggle="tooltip" data-placement="bottom" title="This star mean the author use custom nickname to post."></i></small>' +
                            '</div>' +
                            '<img src="img/loading.gif" id="loading-indicator" style="display:none" />' +
                            '<form role="form">' +
                            '<div class="form-group">' +
                                '<p style="max-height: 250px;min-height: 100px;background: aquamarine;padding-left: 10px;padding-top: 10px;overflow: auto;" ng-bind-html = "postContent | newLine" ng-model="postContent">{{postContent}}</p>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<span><a class="btnLike actionBtn" ng-click="actionClicked(\'liked\',\'isLiked\',$event)" >&#128077; {{liked}} <span ng-if="!thisPost.isLiked">Like</span> <span ng-if="thisPost.isLiked">Liked</span> </a> </span>' +
                                '<span><a class="btnDislike actionBtn" ng-click="actionClicked(\'disliked\',\'isDisliked\',$event)">&#128078; {{disliked}} <span ng-if="!thisPost.isDisliked">Dislike</span> <span ng-if="thisPost.isDisliked">Disliked</span></a> </span>' +
                                '<span><a class="btnShit actionBtn" style="color: brown;" ng-click="actionClicked(\'shited\',\'isShited\',$event)">&#128169; {{shited}} <span ng-if="!thisPost.isShited">Shit</span> <span ng-if="thisPost.isShited">Shited</span></a></span>' +
                                '<span><a class="btnLove actionBtn" style="color:red;" ng-click="actionClicked(\'loved\',\'isLoved\',$event)">&#x2764; {{loved}} <span ng-if="!thisPost.isLoved">Love</span> <span ng-if="thisPost.isLoved">Loved</span></a> </span> ' +
                                '<span><a class="btnComment actionBtn" style="color:#4acdea;" data-toggle="collapse" href="#collapseComment" >&#128172; {{commentedCount}} Comment </a> </span> ' +
                            '</div>' +
                            '<div class="collapse" id="collapseComment">' +
                                '<div class="container">' +
                                    '<img src="img/loading.gif" id="loading-indicator" style="display:none" />' +
                                    '<div class="row">' +
                                         '<a ng-click="readMoreComment()" ng-if="displayReadmore" href=""><small class="text-muted">Read more</small></a>' +
                                         '<a ng-click="readAllComment()" ng-if="displayAllComment" href="" style="margin-left: 10px;"><small class="text-muted">Read previous {{remainLength}} comment</small></a>' +
                                         '<a ng-click="collapseAllComment()" ng-if="displayCollapsebtn" href="" style="margin-left: 10px;"><small class="text-muted">collapse</small></a>' +
                                         '<a ng-click="refreshAllComment()" ng-if="displayRefreshbtn" href="" style="margin-left: 10px;"><small class="text-muted">Refresh comment</small></a>' +
                                         '<a ng-click="undoDeleted()" ng-if="hasDeleted" href=""><small class="text-muted" style="display:block;color:blue">Undo</small></a>' +
                                        '<div ng-repeat="comment in commentdb | limitTo:commentLimit | orderBy:\'date\'" ng-if="comment.status == \'A\'" class="col-sm-12" style="border-bottom: 1px solid #ebebeb;min-height: 50px;text-align: left;">' +
                                            '<div ng-if="comment.username != \'anonymous\' && commentUser.username == comment.username || commentUser.role == \'admin\'" style="float: right;position: relative;">' +
                                            '<a href="" style="color:#c53232" class="dropdown-toggle glyphicon glyphicon-menu-down btn-lg" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                            '</a>' +
                                            '<div class="dropdown-menu" aria-labelledby="dpCategories" style="min-width:90px;max-width:90px">' +
                                            '<a class="dropdown-item" ng-click="editComment($event)">Edit</a>' +
                                            '<a class="dropdown-item deleteBtn"  ng-click="deleteComment()" >Delete</a>' +
                                            '</div>' +
                                            '</div>' +
                                            '<div><strong style="color:blue;display:inline-block"> {{comment.displayname}}</strong> : <div ng-if="!comment.isEdit" style="display:inline-block">{{comment.content}}</div>'+
                                            '<div class="help-block" style="display:inline-block"></div><textarea row="1" class="form-control txtComment overflowauto editComment" ng-if="comment.isEdit" maxlength="500" style="display:block;max-height: 400px;min-height: 100px;background: #fafffd;padding-left: 10px;padding-top: 10px;overflow: auto;" ng-bind-html = "comment.content | newLine" ng-model="comment.content"></textarea>'+
                                            '<div style="float:right" ng-if="comment.isEdit"><small class="text-muted"><a href="#" style="margin-right:3px" ng-click="updateComment($event)">Upate</a><a href="#" ng-click="commentCancel($event)">Cancel</a></small></div>'+
                                            '<div><small class="text-muted">{{formatFromTodayDate(comment.date)}}</small></div></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<form role="form">' +
                                    '<div style="margin-left:10px;color:red" ng-if="currDisplayname == \'anonymous\' && !( postType == \'public\' )" >Please login to comment</div>'+
                                    '<div class="form-group card-block card" ng-if="(postType != \'public\' && currDisplayname != \'anonymous\') || ( postType == \'public\' )">' +
                                        '<textarea class="form-control" rows="3" id="comment" placeholder="Enter comment" ></textarea>' +
                                        '<div class="help-block with-errors"></div>' +

                                        '<div class="form-group">' +
                                            '<div class="input-group">' +
                                            '<span class="input-group-addon">' +
                                            '<h6>Comment by : </h6>' +
                                            '</span>' +
                                            '<input type="text" class="form-control inputNickname" ng-model="inputText" placeholder="{{currLoginName}} (You may change this name if you wish to.)" maxlength="25" aria-label="Text input with checkbox" ng-disabled="isDisableInputNickname">' +
                                            '</div>' +
                                            '<div class="help-block-input with-errors"></div>' +
                                        '</div>' +
                                        '<button class="btn btn-primary btnSubmit" type="submit" ng-click="commentSubmit()">Submit</button>' +
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
