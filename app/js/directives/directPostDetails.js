define(['directives/directives', 'moment'],
    function (directives, moment) {
        directives.directive('directPostDetails', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function init($scope, $element, $attrs) {
                var content = undefined;

                $element.find('#collapseComment').on('show.bs.collapse', function () {
                    console.log(content);
                })
                $element.find('.btnSubmit').on('click', function () {
                    var comment = $element.find('#comment').val();
                    if (comment == "") {
                        $element.find('#comment').parent().find('.help-block').html('Please enter your comment.').css('color', 'red');
                        return;
                    } else if (comment.length < 5) {
                        $element.find('#comment').parent().find('.help-block').html('Comment must more than 5 words.').css('color', 'red');
                        return;
                    } else {
                        authServices.GetCurrentUser(function (res) {
                            if (res.displayname != undefined) {
                                var attrs = {};
                                attrs.postid = content.id;
                                attrs.displayname = res.displayname;
                                attrs.username = res.username;
                                attrs.date = new Date();

                                console.log(attrs);
                            } else {
                                alert('Plese login');
                            }
                        })
                    }
                })

                $($element).ready(function () {
                    $rootScope.$on("openPost", function (e) {
                        content = $rootScope.contentDetails;
                        $scope.$apply(function () {
                            $scope.postTitle = content.title;
                            $scope.postContent = content.content;
                            $scope.postDate = formatFromTodayDate(content.date);
                            $scope.postBy = content.displayname;
                            $scope.liked = content.liked;
                            $scope.disliked = content.disliked;
                            $scope.commented = content.commented;
                            $scope.shited = content.shited;
                            $scope.loved = content.loved;
                        });

                        $element.modal('show');


                    });
                });

                var endOfToday = moment().endOf('day');
                var startOfToday = moment().startOf('day');
                function formatFromTodayDate(date) {
                    if (moment(date) >= startOfToday && moment(date) <= endOfToday)
                        return moment(date).fromNow();
                    else
                        return moment(date).format('MMM Do YYYY, h:mm a'); ;
                };
            }

            // removed from first div = 'ng-click="showAllIndice()"'
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
                                        '<div class="col-sm-3" style="border: 1px solid;height: 100px;">' +
                                        '123321321' +
                                        '</div>' +
                                        '<div class="col-sm-9" style="border: 1px solid;height: 100px;">' +
                                        'One of three columns' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<form role="form">' +
                                    '<div class="form-group card-block card">' +
                                        '<textarea class="form-control" rows="3" id="comment" placeholder="Enter comment"></textarea>' +
                                        '<div class="help-block with-errors"></div>' +
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
