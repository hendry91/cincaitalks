define(['directives/directives', 'moment'],
    function (directives, moment) {
        directives.directive('publicwall', ['deploydService', '$compile', '$rootScope', 'itemPerPage', function (deploydService, $compile, $rootScope, itemPerPage) {

            function tableCtrl($scope, $element) {
                $rootScope.breakLineTitle = "Public";
                $rootScope.$broadcast('setBreakLineTitle');
            }

            function init(scope, element, attrs) {
                scope.pageCategories = "public";
                $(element).ready(function () {

                    //for limit the return number
                    var attrs = {
                        //                        limit: 12, //eg:6 will get 6 post
                        //                        skip: 0, //skip how many, eg: 1 page 10 post, when click second page, should skip 10 post.
                        //                        sortCategories: "date",
                        //                        sortType: -1  //1 for ascending sort (lowest first; A-Z, 0-10) or -1 for descending (highest first; Z-A, 10-0)
                    }

                    deploydService.GetPostbyLimit(attrs, scope.pageCategories, function (res) {
                        scope.postdb = res;

                        scope.openPost = function (e) {
                            $rootScope.contentDetails = this.post;
                            $rootScope.contentDetails.postType = scope.pageCategories;
                            $rootScope.$broadcast('openPost');
                        }

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

                    //                    $('#pagination').twbsPagination({
                    //                        totalPages: 35,
                    //                        visiblePages: 10,
                    //                        onPageClick: function (event, page) {
                    //                            //$('#page-content').text('Page ' + page);
                    //                        }
                    //                        //href: '?page={{number}}'
                    //                    });




                });

                var endOfToday = moment().endOf('day');
                var startOfToday = moment().startOf('day');
                function formatFromTodayDate(date) {
                    if (moment(date) >= startOfToday && moment(date) <= endOfToday)
                        return moment(date).fromNow();
                    else
                        return moment(date).format('MMM Do YYYY, h:mm a'); ;
                };

                function processResize(scope, element) {
                    var contentCount = $(element).find('.pContent');
                    angular.forEach(contentCount, function (res) {
                        checkOverflow(res, function (res) {
                            $('<a class="btnExpand">Expand Now</a> or <a class="btnReadMore">Read More</a>').insertAfter(res);
                        });
                    });
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

                                '<div class="card cardContent" ng-repeat="post in postdb" ng-click="openPost($event)">' +
                                    '<img  ng-if="post.image != \'null\'" class="card-img-top" src="http://wowslider.com/sliders/demo-22/data1/images/peafowl.jpg" alt="Card image cap">' +
                                    '<div class="card-block ellipsis ">' +
                                        '<h5 class="card-title" style="color:#1515d1;border-bottom: solid 1px black;"><strong> {{post.title}} </strong></h5>' +
                                        '<p class="card-text pContent" style="max-height: 250px;overflow: hidden;"> {{post.content}} </p>' +
                                        '<p class="card-text"><small class="text-muted"> {{formatFromTodayDate(post.date)}} posted by {{post.displayname}}</small></p>' +
                                    '</div>' +
                                '</div>' +

                            '</div>' +
                            '</div>' +

                //                            '<nav>'+
                //                            '<ul id="pagination" class="pagination-sm"></ul>' +
                //                            '</nav>'+

                            '<div id="pager" class="k-pager-wrap"></div>'
            };
        } ]);

    });
