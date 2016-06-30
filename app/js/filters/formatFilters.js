
define([
        'filters/filters',
        ],
        function (filters) {
            filters.filter('newLine', ['$sce', function ($sce) {
                return function (input) {
                    var temp = escape(input).replace(/%0A/g, "<br/>")
                    input = unescape(temp);
                    return $sce.trustAsHtml(input);
                };
            }]);
        });
