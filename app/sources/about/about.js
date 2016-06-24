define(['directives/directives'],
    function (directives) {
        directives.directive('about', ['deploydService', '$rootScope', 'authServices', function (deploydService, $rootScope, authServices) {


            function tableCtrl($scope, $element) {
                $rootScope.breakLineTitle = "About Us";
                $rootScope.$broadcast('setBreakLineTitle');
            }
            function init($scope, $element, $attrs) {
                $element.find('.btnSubmit').on('click', function (event) {
                    var comment = $element.find('#comment').val();

                    if (comment == "") {
                        $element.find('#comment').parent().find('.help-block').html('Please enter your comment.').css('color', 'red');
                        return;
                    } else if (comment.length < 10) {
                        $element.find('#comment').parent().find('.help-block').html('Comment must more than 10 words.').css('color', 'red');
                        return;
                    } else {
                        $element.find('#comment').parent().find('.help-block').html('');
                        authServices.GetCurrentUser(function (res) {
                            if (res.displayname != undefined) {
                                var attrs = {};
                                attrs.username = res.displayname;
                                attrs.content = comment;
                                attrs.date = new Date();

                                deploydService.CreateFeedback(attrs, "feedback", function (res) {
                                    if (res.id != undefined) {
                                        alert('feedback form submitted.');
                                        $element.find('#comment').val('');
                                    }
                                });
                            } else {
                                var attrs = {};
                                attrs.username = "anonymous";
                                attrs.content = comment;
                                attrs.date = new Date();

                                deploydService.CreateFeedback(attrs, "publicfeedback", function (res) {
                                    if (res.id != undefined) {
                                        alert('feedback form submitted.');
                                        $element.find('#comment').val('');
                                    }
                                });
                            }
                        });


                    }

                });

            }

            return {
                restrict: 'A',
                link: init,
                template: '<div class="aboutUs container-fluid" style="margin-top:20px">' +
'<div class="jumbotron">' +
'<h1 class="display-3">Hello, TARUCIAN!</h1>' +
'<p class="lead">This is a non-profit organization website for taruc communication purpose.</p>' +
'<hr class="m-y-2">' +
'<p>If you have any feedback for us to improving this website, you may proceed to submit the form below.</p>' +
'<div class="form-group">' +
'<label for="comment">Comment:</label>' +
'<textarea class="form-control" rows="5" id="comment" placeholder="Please login to submit this form to enjoy high priority. ' +
'You will still able to submit this form without login, but it may having the high trafic due to some people spam/sending unused feedback to the web. Thanks"></textarea>' +
'<div class="help-block with-errors"></div>' +
'<button class="btn btn-primary btnSubmit" type="submit">Submit</button>' +
'</div>' +
'</div>' +
                            '</div>',
                controller: ['$scope', '$element', tableCtrl]
            };
        } ]);

    });
