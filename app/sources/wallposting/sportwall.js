define(['directives/directives', 'moment'],
    function (directives, moment) {
        directives.directive('sportwall', ['deploydService', '$compile', '$rootScope', 'itemPerPage', 'authServices', function (deploydService, $compile, $rootScope, itemPerPage, authServices) {

            function tableCtrl($scope, $element) {
                $rootScope.breakLineTitle = "Sport";
                $rootScope.$broadcast('setBreakLineTitle');
                $('#loading').show();
                $('#overlay').show();
            }

            function init(scope, element, attrs) {
                scope.pageCategories = "sport";
                $rootScope.$on("refreshPost", function (e) {
                    authServices.GetCurrentUser(function (res) {
                        if (res == -1) { //no login
                            scope.currUser = "anonymous";
                            scope.displayname = "anonymous";
                            scope.role = undefined;
                        } else if (res.status == "active") { //deployd login
                            scope.currUser = res.username;
                            scope.displayname = res.displayname;
                            scope.role = res.role;
                        }
                    });
                    refreshPost();
                });
                $(element).ready(function () {

                    deploydService.GetPostbyLimit(attrs, scope.pageCategories, function (res) {
                        if (res.length > 1) {
                            $('#pagination').twbsPagination({
                                totalPages: Math.ceil(res.length / itemPerPage), //round up decimal +1
                                visiblePages: 10,
                                onPageClick: function (event, page) {
                                    $('#loading').show();
                                    $('#overlay').show();
                                    toGetPost(page);
                                    //$('#page-content').text('Page ' + page);
                                }
                                //href: '?page={{number}}'
                            });
                        } else {
                            $('#loading').hide();
                            $('#overlay').hide();
                        }
                    });
                });


                function toGetPost(pageNum) {
                    var skipnum = (pageNum - 1) * itemPerPage;
                    //for limit the return number
                    var attrs = {
                        limit: itemPerPage, //eg:6 will get 6 post
                        skip: skipnum, //skip how many, eg: 1 page 10 post, when click second page, should skip 10 post.
                        sortCategories: "date",
                        sortType: -1  //1 for ascending sort (lowest first; A-Z, 0-10) or -1 for descending (highest first; Z-A, 10-0)
                    }

                    authServices.GetCurrentUser(function (res) {
                        if (res == -1) { //no login
                            scope.currUser = "anonymous";
                            scope.displayname = "anonymous";
                            scope.role = undefined;
                        } else if (res.status == "active") { //deployd login
                            scope.currUser = res.username;
                            scope.displayname = res.displayname;
                            scope.role = res.role;
                        }

                        deploydService.GetPostbyLimit(attrs, scope.pageCategories, function (res) {
                            scope.postdb = res;
                            processResize(scope, element);

                            $(element).find('.btnReadMore,.btnExpand').on('click', function (e) {
                                console.log(e);
                                var target = e.currentTarget.text;

                                switch (target) {
                                    case "Expand Now":
                                        $(this).text('Collapse');
                                        $(this.parentElement).find('.pContent').css('overflow', 'visible');
                                        $(this.parentElement).find('.pContent').css('max-height', '');
                                        break;
                                    case "Read More":
                                        console.log("more");
                                        break;
                                    case "Collapse":
                                        $(this).text('Expand Now');
                                        $(this.parentElement).find('.pContent').css('overflow', 'hidden');
                                        $(this.parentElement).find('.pContent').css('max-height', '300px');
                                        break;
                                }
                            });

                        });
                    });
                }


                scope.openPost = function (e) {
                    scope.currentPostTarget = this.post;
                    if (!$(e.target).hasClass('dropdown-toggle') && !$(e.target).hasClass('dropdown-item')) {
                        $rootScope.contentDetails = this.post;
                        $rootScope.contentDetails.postType = scope.pageCategories;
                        $rootScope.$broadcast('openPost');
                    }
                }

                scope.editPost = function (e) {
                    scope.currentPostTarget = this.post;
                    if (this.post.username != scope.currUser && scope.role != "admin") {
                        alert('ops, something wrong, if this post belong to your, please report to admin!');
                    } else {
                        $rootScope.contentDetails = this.post;
                        $rootScope.contentDetails.postType = scope.pageCategories;
                        $rootScope.$broadcast('editPost');
                    }
                }

                scope.deletePost = function (e) {
                    scope.currentPostTarget = this.post;
                    if (this.post.username != scope.currUser && scope.role != "admin") {
                        alert('ops, something wrong, if this post belong to your, please report to admin!');
                        window.setTimeout(function () {
                            element.find('#confirm-delete').modal('hide');
                        }, 0);
                    } else {
                        $(element).find('#confirm-delete').modal('show');
                    }
                }

                $('#confirm-delete').on('show.bs.modal', function (e) {
                    var content = scope.currentPostTarget;
                    scope.postTitle = content.title;
                });

                element.find('.btnDeletePost').on('click', function (event) {
                    if (scope.currUser == scope.currentPostTarget.username || scope.role == "admin") {
                        var attrs = { id: scope.currentPostTarget.id, status: "D", updatedby: scope.currUser, lastdate: new Date() }
                        deploydService.DeletePost(attrs, scope.pageCategories, function (res) {
                            if (res.status = "D") {
                                alert("your post has been deleted.");
                                refreshPost();
                            }
                            element.find('#confirm-delete').modal('hide');
                        });
                    } else {
                        alert("You can't remove people post, if this post belong to you, there must be some error, please contact admin to solve this problem. Thanks.");
                    }
                });

                var endOfToday = moment().endOf('day');
                var startOfToday = moment().startOf('day');
                function formatFromTodayDate(date) {
                    if (moment(date) >= startOfToday && moment(date) <= endOfToday)
                        return moment(date).fromNow();
                    else
                        return moment(date).format('MMM Do YYYY, h:mm a'); ;
                };

                function refreshPost() {
                    var attrs = {
                        limit: itemPerPage, //eg:6 will get 6 post
                        skip: 0, //skip how many, eg: 1 page 10 post, when click second page, should skip 10 post.
                        sortCategories: "date",
                        sortType: -1  //1 for ascending sort (lowest first; A-Z, 0-10) or -1 for descending (highest first; Z-A, 10-0)
                    }
                    deploydService.GetPostbyLimit(attrs, scope.pageCategories, function (res) {
                        scope.postdb = res;
                    });
                }

                function processResize(scope, element) {
                    var contentCount = $(element).find('.pContent');
                    angular.forEach(contentCount, function (res) {
                        checkOverflow(res, function (res) {
                            $('<a class="btnExpand">Expand Now</a> or <a class="btnReadMore">Read More</a>').insertAfter(res);
                        });
                    });

                    $('#loading').hide();
                    $('#overlay').hide();
                }

                function checkOverflow(el, callback) {
                    var curOverflow = el.style.overflow;
                    if (!curOverflow || curOverflow === "visible")
                        el.style.overflow = "hidden";
                    var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
                    el.style.overflow = curOverflow;
                    if (isOverflowing) {
                        callback(el);
                    }
                }
            }

            return {
                restrict: 'A',
                link: init,
                controller: ['$scope', '$element', tableCtrl],
                template: '<div class="row listWrapper" style="margin-top:20px">' +
                            '<div class="card-columns">' +

                                '<div class="card cardContent" ng-repeat="post in postdb" ng-if="post.status == \'A\'" ng-click="openPost($event)">' +
                                '<div ng-if="post.image == \'null\' && currUser != \'anonymous\' && currUser == post.username || role ==\'admin\'" style="position: absolute">' +
                                '<a href="" style="color:#c53232" class="dropdown-toggle glyphicon glyphicon-menu-down btn-lg" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                '</a>' +
                                '<div class="dropdown-menu" aria-labelledby="dpCategories" style="min-width:90px;max-width:90px">' +
                                '<a class="dropdown-item" ng-click="editPost($event)">Edit</a>' +
                                '<a class="dropdown-item" data-toggle="modal" ng-click="deletePost($event)">Delete</a>' +
                                '</div>' +
                                '</div>' +

                                    '<img  ng-if="post.image != \'null\'" class="card-img-top" src="http://wowslider.com/sliders/demo-22/data1/images/peafowl.jpg" alt="Card image cap">' +
                                '<div ng-if="post.image != \'null\' && currUser != \'anonymous\' && currUser == post.username || role == \'admin\'" style="position: absolute">' +
                                '<a href="" style="color:#c53232" class="dropdown-toggle glyphicon glyphicon-menu-down btn-lg" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                '</a>' +
                                '<div class="dropdown-menu" aria-labelledby="dpCategories" style="min-width:90px;max-width:90px">' +
                                '<a class="dropdown-item" ng-click="editPost($event)">Edit</a>' +
                                '<a class="dropdown-item" data-toggle="modal" ng-click="deletePost($event)">Delete</a>' +
                                '</div>' +
                                '</div>' +
                                    '<div class="card-block ellipsis ">' +
                                        '<h5 class="card-title" style="color:#1515d1;border-bottom: solid 1px black;"><strong> {{post.title}} </strong></h5>' +
                                        '<p class="card-text pContent" style="max-height: 250px;overflow: hidden;" ng-bind-html = "post.content | newLine" ng-model="post.content" >  </p>' +
                                        '<p class="card-text"><small class="text-muted"> {{formatFromTodayDate(post.date)}} posted by {{post.displayname}}' +
                                        '<i class="fa fa-star-o" aria-hidden="true" style="color:red" ng-if="post.usenick == true" data-toggle="tooltip" data-placement="bottom" title="This star mean the author use custom nickname to post."></i></small></p>' +
                                    '</div>' +
                                '</div>' +

                            '</div>' +
                            '</div>' +

                            '<nav>' +
                            '<ul id="pagination" class="pagination-sm"></ul>' +
                            '</nav>' +
'<div class="modal fade" id="confirm-delete" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
'<div class="modal-dialog">' +
'<div class="modal-content">' +

'<div class="modal-header">' +
'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
'<h4 class="modal-title" id="myModalLabel">Confirm Delete</h4>' +
'</div>' +

'<div class="modal-body">' +
'<p>Are you sure to delete this {{postTitle}} post?</p>' +
'<p>Do you want to proceed?</p>' +
'</div>' +

'<div class="modal-footer">' +
'<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
'<a class="btn btn-danger btn-ok btnDeletePost">Delete</a>' +
'</div>' +
'</div>' +
'</div>' +
'</div>'
            };
        } ]);

    });
