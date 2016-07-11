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
                                $scope.isfb = false;
                                $element.find('input#chkNickname').addClass('checked');

                                $element.find('.categoriesFieldset > .form-group  input:radio')[8].checked = true;

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
                                    $scope.isfb = (res.role == "FB") ? true : false;
                                    $element.find('.categoriesFieldset > div > .radio-inline').css('color', '');
                                    $element.find('.categoriesFieldset > div > .help-block').html("");
                                    $element.find('input#chkNickname').removeClass('checked');
                                    $element.find('.categoriesFieldset > .form-group  input:radio')[8].checked = true;

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
                            $element.find('.txtTitle').parent().find('.help-block').html('Please enter your title').css('color', 'red');
                            return;
                        } else if (inputTitle.length < 3 || inputTitle.length > 28) {
                            $element.find('.txtTitle').parent().find('.help-block').html('Length must between 3 - 28.').css('color', 'red');
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
                            usenick: (inputNick != undefined) ? true : false,
                            isfb: $scope.isfb
                        };
                        alert("here 11111");
                        if ($($element).find("#imgInp").val() == undefined || $($element).find("#imgInp").val() == "") {
                            submitPost(attrs, checkedCategories);
                        } else {
                            alert("here wwwww");
                            
                            authServices.RequestAccessToken(function (res) {
                                alert("here 3333");

                                if (res.access_token != undefined) {
                                    alert("got token");
                                    checkUploadImage(res.access_token, function (res) {
                                        alert("iiii");
                                        if (res.status != 200) {
                                            alert("There was something wrong, please contact admin with this error message [" + JSON.parse(res.responseText).data.error + "]");
                                        } else {
                                            attrs.image = res.data.link;
                                            submitPost(attrs, checkedCategories);
                                        }
                                    });
                                } else {
                                    alert("gg no token");
                                }
                            });
                        }
                    });

                    $element.find('.cancelPost').on('click', function (event) {
                        $element.modal('hide');
                    });

                    $($element).find("#imgInp").change(function () {
                        imageValidation(this);
                    });

                    $scope.closePreview = function () {
                        $($element).find("#imgInp").val('');
                        $scope.previewImg = " ";
                        $scope.imgLoaded = false;
                        $scope.imgProgress = false;
                        window.setTimeout(function () {
                            $($element).find('.previewIMG').attr('src', '');
                        }, 0);
                    }
                });

                $("#my_create_post_Modal").on('hidden.bs.modal', function () {
                    resetField();
                });

                function submitPost(attrs, checkedCategories) {
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
                }

                function resizeMe(img) {
                    var canvas = document.createElement('canvas');

                    var width = img.width;
                    var height = img.height;
                    var max_width = 800;
                    var max_height = 600;
                    // calculate the width and height, constraining the proportions
                    if (width > height) {
                        if (width > max_width) {
                            //height *= max_width / width;
                            height = Math.round(height *= max_width / width);
                            width = max_width;
                        }
                    } else {
                        if (height > max_height) {
                            //width *= max_height / height;
                            width = Math.round(width *= max_height / height);
                            height = max_height;
                        }
                    }

                    // resize the canvas and draw the image data into it
                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    return canvas.toDataURL("image/jpeg", 0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)

                }

                function checkUploadImage(access_token, callback) {
                    alert("aaa");
                    var input = $($element).find("#imgInp")[0];
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.readAsArrayBuffer(input.files[0]);
                        alert("bbb");
                        reader.onload = function (e) {
                            //var code = e.target.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""); //remove the header, if not cant upload
                            alert("ccc");
                            // blob stuff
                            var blob = new Blob([e.target.result]); // create blob...
                            window.URL = window.URL || window.webkitURL;
                            var blobURL = window.URL.createObjectURL(blob); // and get it's URL

                            // helper Image object
                            var image = new Image();
                            image.src = blobURL;

                            image.onload = function () {
                                // have to wait till it's loaded
                                var resizedbase64 = resizeMe(image); // send it to canvas
                                var code = resizedbase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""); //remove the header, if not cant upload
                                alert("ddd");
                                $.ajax({
                                    xhr: function () {
                                        alert("eee");
                                        var xhr = new window.XMLHttpRequest();
                                        $scope.imgProgress = true;
                                        xhr.upload.addEventListener("progress", function (evt) {
                                            if (evt.lengthComputable) {
                                                var percentComplete = evt.loaded / evt.total;
                                                percentComplete = parseInt(percentComplete * 100);
                                                console.log(percentComplete);
                                                $scope.$apply(function () {
                                                    $scope.progressUpload = percentComplete;
                                                });
                                                if (percentComplete === 100) {

                                                }

                                            }
                                        }, false);
                                        return xhr;
                                    },
                                    url: 'https://api.imgur.com/3/image',
                                    type: "POST",
                                    datatype: "json",
                                    data: {
                                        image: code,
                                        type: 'base64',
                                        album: '3VqTp'
                                    },
                                    beforeSend: function (xhr) {
                                        alert("kkk");
                                        xhr.setRequestHeader("Authorization", "Bearer " + access_token + "");
                                    },
                                    success: function (e) {
                                        alert("zzz");
                                        callback(e);
                                    },
                                    error: function (e) {
                                        callback(e);
                                    }
                                });
                                //reader.readAsDataURL(input.files[0]);
                            }


                        }
                    }
                }

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
                        $element.find('.categoriesFieldset > .form-group  input:radio')[8].checked = true;
                        $element.find('input#chkNickname').prop('checked', false);
                        $element.find('.txtComment').val('');
                        $scope.isCheck = false;
                        $scope.isDisable = true;
                        $scope.disableNickname = false;
                        $($element).find("#imgInp").val('');
                        $scope.previewImg = " ";
                        $scope.imgLoaded = false;
                        $scope.imgProgress = false;
                        $scope.progressUpload = 0;
                        window.setTimeout(function () {
                            $($element).find('.previewIMG').attr('src', '');
                        }, 0);
                    } else {
                        $element.find('.inputNickname').val('');
                        $element.find('.txtTitle').val('');
                        $element.find('.categoriesFieldset > .form-group  input:radio')[8].checked = true;
                        $element.find('.txtComment').val('');
                        $scope.disableNickname = true;
                        $element.find('input#chkNickname').prop('checked', true);
                        $scope.isCheck = true;
                        $scope.isDisable = false;
                        $($element).find("#imgInp").val('');
                        $scope.previewImg = " ";
                        $scope.imgLoaded = false;
                        $scope.imgProgress = false;
                        $scope.progressUpload = 0;
                        window.setTimeout(function () {
                            $($element).find('.previewIMG').attr('src', '');
                        }, 0);
                    }
                }

                function imageValidation(input) {
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();

                        reader.onload = function (e) {
                            $scope.$apply(function () {
                                $scope.previewImg = e.target.result;
                                $scope.imgLoaded = true;
                            });
                        }
                        if (input.files[0].type == "image/jpeg" || input.files[0].type == "image/png" || input.files[0].type == "image/jpeg") {
                            reader.readAsDataURL(input.files[0]);
                        } else {
                            alert("Only supported jpg/jpeg/png image type.")
                        }
                    } else {
                        $scope.$apply(function () {
                            $scope.previewImg = " ";
                            $scope.imgLoaded = false;

                        });
                        $($element).find('.previewIMG').attr('src', '');
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
'<input type="text" class="form-control txtTitle" required data-minlength="5" maxlength="28" id="usr" placeholder="Enter your post Title.">' +
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
'<div class="form-group" style="text-align: left">' +
'<form id="form1" runat="server">' +
'<input type="file" id="imgInp" style="width: 220px;" />' +
'<img ng-src="{{previewImg}}" class="previewIMG img-rounded" alt="Image Preview" style="max-height: 30px;" />' +
'<button type="button" class="close" style="float:none;margin-left:3px" ng-show="imgLoaded" ng-click="closePreview()">x</button>' +
'</form>' +
'</div>' +
'<div class="form-group" style="text-align: left">' +
'<progress class="progress progress-striped progress-success" value="{{progressUpload}}" max="100" ng-show="imgProgress"></progress>' +
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
