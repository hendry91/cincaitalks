define(['directives/directives', 'moment'],
    function (directives, moment) {
        directives.directive('directPostDetails', ['$compile', 'deploydService', '$cookies', 'authServices', '$rootScope', function ($compile, deploydService, $cookies, authServices, $rootScope) {

            function resizeWin(scope, element){

                var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

                console.log(w);
                var el = scope.popWindow.element,
                winHeight = el.height(),
                titleHeight = el.find('.title').height(),
                contentHeight = el.find('.postcontent').height(),
                postDetailsHeight = el.find('.postedDetails').height();

                el.css('overflow', 'hidden');

                var commentElement = el.find('.commentArea');
                var commentHeight = winHeight - titleHeight - contentHeight -postDetailsHeight - 10;
                commentElement.height(commentHeight);
            }

            function init($scope, $element, $attrs) {
               
                $scope.popWindow = $element.find('#popupWin').kendoWindow({
                    width: "55%",
                    height: "55%",
                    visible: false,
                    title:false,
                    modal:true,
                    resizable: false,
                    draggable: false,
                }).data("kendoWindow");

                 $scope.popWindow.wrapper.parent().on("click", ".k-overlay", function () {
                    $scope.popWindow.close();
                });

                $($element).ready(function () {
                    $rootScope.$on("openPost", function (e) {
                        var content = $rootScope.contentDetails;
                         $scope.$apply(function () {
                            $scope.postTitle = content.title;
                            $scope.postContent = content.content;
                            $scope.postDate = formatFromTodayDate(content.date);
                            $scope.postBy = content.displayname;
                            $scope.liked = content.liked;
                            $scope.dislike = content.liked;
                            $scope.commented = content.commented;
                        });

                        $scope.popWindow.center().open();
                        resizeWin($scope, $element);

                    });
                    $(window).resize(function () {
                        console.log("aa");
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
                template: '<div class="post-content-wrapper">'+
                            '<div id="popupWin">'+
                                 '<div style="background: #f5e1e1;text-align: center;font-size: 30px;" class="title"> {{postTitle}} </div>'+
                                 '<div class="postcontent" style="max-height: 250px;min-height: 100px;background: aquamarine;padding-left: 10px;padding-top: 10px;overflow: auto;"> {{postContent}} </div>'+
                                 '<div class="postedDetails text-muted" style="background:#231f1b;">'+
                                     '<span><img src="img/social/like.png" style="height: 40px;cursor:pointer" class="btnLiked"/>{{liked}} Like</span>'+
                                     '<span><img src="img/social/dislike.png" style="height: 40px;cursor:pointer" class="btnDisliked"/> {{dislike}} Disliked </span> '+
                                     '<span><img src="img/social/comment.png" style="height: 40px;cursor:pointer" class="btnCommented"/>{{commented}} Comment</span> '+
                                     '<small style="float:right;padding-top: 10px;padding-right: 5px;}"> {{postDate}} was posted by :{{postBy}} </small>'+
                                 '</div>'+
                                 '<div class="commentArea" style="background: aqua;"></div>'+
                             '<div>'+
                             '</div>',
                link: init,
                replace: true
            };
        } ]);
    });
