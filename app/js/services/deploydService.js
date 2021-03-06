define(['services/services'],
    function (services) {
        services.service('deploydService', ['$resource','$httpParamSerializer','$http', '$httpParamSerializerJQLike', 
            function ($resource, $httpParamSerializer,$http, $httpParamSerializerJQLike) {

                //var prefixurl = "http://localhost:2403";
                var prefixurl = "http://52.203.59.239:8080";

                var path = {
                    other: "other",
                    complain: "complain",
                    fnb: "fnb",
                    sport: "sport",
                    entertainment: "entertainment",
                    salesnrent: "salesnrent",
                    public: "public",
                    love: "love",
                    feedback: "feedback",
                    publicfeedback: "publicfeedback",
                    comment: "comment",
                    backuppost : "backuppost",
                    lnf : "lnf",
                    backupcomment : "backupcomment"
                };

                //=============================== AJAX CALLS DEFINITION =====================================================
                
                var deploydUser = $resource(prefixurl + "/users/:path/:object", null, {
                    getCurr: { method: 'GET', params: { object: "", path:"me"} },
                    login: { method: 'POST', params: { object: "", path:"login"} },
                    logout: { method: 'POST', params: { object: "", path:"logout"} },
                    create: { method: 'POST', params: { object: ""} },
                    update : { method: 'PUT', params: { object: ""} }
                });
                
                var fbCheckUser =  $resource(prefixurl + "/users?:object", null, {
                    check : { method: 'GET', params: { object: ""},isArray: true }
                });
                
                var deploydUserByAttr = $resource(prefixurl + "/users?:attr=:value", null, {
                    get: { method: 'GET', params: { attr: "", value:""},isArray: true },
                });

                var postRequest = $resource(prefixurl + "/:path?:object", null, {
                    getLimit: {method: 'GET',params: {path:"", object: ""},isArray: true},
                    getbyUsername: {method: 'GET',params: {path:"", object: ""},isArray: true},
                    getbyId: {method: 'GET',params: {path:"", object: ""},isArray: false},
                    remove: { method: 'DELETE', params: {path:"", id : ""} },
                    update: { method: 'PUT', params: { path:"", object : ""} }
                });

                var create = $resource(prefixurl + "/:path/:object", null, {
                    createPosting: { method: 'POST', params: { path:"", object: ""} },
                    createFeedb: { method: 'POST', params: { path:"", object: ""} },
                    createComment: { method: 'POST', params: { path:"", object: ""} },
                    update: {method : 'PUT' , params:{ path:"",object: ""} },
                    addBackup: { method: 'POST', params: { path:"", object: ""} },
                    addCommentbackup: { method: 'POST', params: { path:"", object: ""} }
                });

                var comment = $resource(prefixurl + "/comment?:object", null, {
                    getCommentbyId: {method: 'GET',params: {object: ""},isArray: true},
                    update : { method: 'PUT', params: { object : ""} }
                });

                //=============================== PROCESS RESPONSE =====================================================

                function transformResponse(data, header) {
                    return angular.fromJson(data);
                };

                function responseSuccess(success, datakey, callback) {
                    if (angular.isFunction(callback)) callback(success);
                };

                function responseError(error, callback) {
                    var data = {
                        status: error.status,
                        errorMsg: error.data
                    }

                    if (data.status != "200") {
                        data.errorMsg = "Error " + data.status;
                    }

                    if (angular.isFunction(callback))
                        callback(data);
                };

                //=============================== REQUEST API FUNCTION ====================================================

                
                function getPostbyLimit(attrs, type, callback) {
                    var objectSort = {};
                    objectSort[attrs.sortCategories] = attrs.sortType;
                    var type = path[type];
                    var request = {
                        $limit: attrs.limit, 
                        $skip: attrs.skip,
                        $sort: objectSort,
                        status: {$ne : "D"} //set to get status != D post.
                    };

                    var userList = postRequest.getLimit({path : type, object : JSON.stringify(request)},
        	            function (success) { responseSuccess(success, null, callback) },
        	            function (error) { responseError(error, callback) });
                };
                

                function getPostbyUsername(name, type, callback) {

                    var request = "username=" + name;
                    var type = path[type];

                    var userList = postRequest.getbyUsername({path : type}, {object : request},
        	            function (success) { responseSuccess(success, null, callback) },
        	            function (error) { responseError(error, callback) });
                };

                function getPostbyPostid(id, type, callback){
                    var request = {
                        id: id
                    };
                    var type = path[type];
                    var get = postRequest.getbyId({ path : type, object : JSON.stringify(request)},
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }

                function createPost(attrs, type, callback) {
                    var request = {
						username : attrs.username,
                        displayname : attrs.displayname,
                        title: attrs.title,
						content : attrs.content,
						image : attrs.image,
                        liked: [],
                        disliked: [],
                        loved: [],
                        shited: [],
                        commentedCount: 0,
						date : attrs.date,
                        status : "A",
                        usenick: attrs.usenick,
                        isfb : attrs.isfb
					};

                    var type = path[type];
					
					var createP = create.createPosting({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };
                
                function updatePostAction(attrs,actionType, type, callback) {
                    var request = {};
                    
                    request[actionType] = attrs[actionType];
					
                    var type= path[type];
					
					var update = create.update({path : type,object:attrs.id}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };


                 function createComment(attrs, type, callback) {
                    var request = {
                        postid : attrs.postid,
						username : attrs.username,
                        displayname : attrs.displayname,
						date : attrs.date,
                        content: attrs.content,
                        categories:attrs.categories,
                        usenick:attrs.usenick,
                        status: "A",
                        isfb: attrs.isfb
					};
                    var type = path[type];
					
					var createP = create.createComment({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

                function getCommentbyPostid(id, type, callback){
                    var request = {
                        postid: id, 
                        $sort: {"date":-1},
                        status: {$ne : "D"}
                    };

                    var get = comment.getCommentbyId({ object : JSON.stringify(request)},
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }

                function createUser(attrs, callback){
                     var request = {
						username : attrs.username,
                        displayname : attrs.displayname,
						gender : attrs.gender,
                        email : attrs.email,
						password : attrs.password,
                        pass : attrs.password,
                        faculty : attrs.faculty,
                        date:new Date(),
                        role: attrs.role ,
                        status: "active"
					};
                    var user = deploydUser.create(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };
                
                function updateUser(attrs,callback){
                    var request = attrs;
                    
                    var user = deploydUser.update({ object:attrs.id },JSON.stringify(request),
                        function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }

                function userLogin(attrs, callback) {
                    var request = {
						username : attrs.username,
						password : attrs.password
					};
					
					var user = deploydUser.login(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

                function userLogout(attrs, callback) {
                    var request = {
						Cookie : "sid=" + attrs.Cookie
					};
					
					var user = deploydUser.logout(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

                function getCurrentUser(attrs, callback) {
                    var request = {
						Cookie : "sid=" + attrs.Cookie
					};
					
					var currUser = deploydUser.getCurr(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

                function createFeedback(attrs, type, callback) {

                    var request = {
						username : attrs.username,
						content : attrs.content,
						date : attrs.date
					};
					var type = path[type];

					var createP = create.createFeedb({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };
                
                function getUserByAttr(attrs, callback) {
                    
					var User = deploydUserByAttr.get({attr:attrs.attr,value:attrs.value},
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

                function checkExistingUser(id, callback){
                    var request = "username=" + id;
                    var get = fbCheckUser.check({object : request},
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }

                function updatePost(attrs, type, callback){
                    var request = { id: attrs.postid, content: attrs.content, updatedby: attrs.updatedby,lastdate : attrs.lastdate };
                    //var toPost = {postid: attrs.postid, username: attrs.updatedby, content: attrs.oldContent,date:new Date()}
                    //{path : type ,object:JSON.stringify({ include:"testadsadsadasd" })}
					var update = postRequest.update({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }

                function deletePost(attrs, type, callback){
                    var request = attrs;
					var update = postRequest.update({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }

                function addbackup(attrs, type, callback) {
                    var request = {
                        postid : attrs.postid,
						username : attrs.username,
						content : attrs.content,
						date : new Date(),
//                      title: attrs.title,
//						image : attrs.image,
					};
                    var type = path[type];
					var createP = create.createPosting({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };
                
                function deleteComment(attrs, callback){
                    var request = attrs;
                    
					var update = comment.update(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }
                
                function updateComment(attrs, callback){
                    var request = { 
                        id: attrs.commentid, 
                        content: attrs.content, 
                        updatedby: attrs.updatedby,
                        lastdate : attrs.lastdate 
                    };
                    
					var update = comment.update(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                }
                
                function addCommentBackup(attrs, type, callback) {
                    var request = {
                        commentid : attrs.commentid,
						username : attrs.username,
						content : attrs.content,
						date : new Date(),
//                      title: attrs.title,
//						image : attrs.image
					};
                    var type = path[type];
					var creteComment = create.addCommentbackup({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

                //=============================== RETURN FUNCTION ====================================================
                return {
                    //PUBLIC POST
                    GetPostbyLimit: getPostbyLimit,
                    GetPostbyUsername: getPostbyUsername,
                    CreatePost : createPost,
                    Addbackup : addbackup, 
                    UpdatePostAction : updatePostAction,
                    CreateComment : createComment,
                    AddCommentBackup : addCommentBackup, 
                    DeleteComment : deleteComment,
                    UpdateComment : updateComment,
                    GetCommentbyPostid : getCommentbyPostid,
                    GetPostbyPostid : getPostbyPostid,

                    DeletePost: deletePost,
                    UpdatePost:updatePost,
                    CreateUser: createUser,
                    UpdateUser: updateUser,
                    UserLogin: userLogin,
                    UserLogout: userLogout,
                    GetCurrentUser: getCurrentUser,
                    GetUserByAttr: getUserByAttr,

                    CreateFeedback: createFeedback,

                    CheckExistingUser : checkExistingUser
                }
            }
        ]);
    }
);