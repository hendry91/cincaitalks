define(['services/services'],
    function (services) {
        services.service('deploydService', ['$resource',
            function ($resource) {

                //var prefixurl = "http://localhost:2403";
                var prefixurl = "http://ec2-52-91-4-159.compute-1.amazonaws.com:9090";

                //=============================== AJAX CALLS DEFINITION =====================================================
                
                var deploydUser = $resource(prefixurl + "/users/:path/:object", null, {
                    getCurr: { method: 'GET', params: { object: "", path:"me"} },
                    login: { method: 'POST', params: { object: "", path:"login"} },
                    logout: { method: 'POST', params: { object: "", path:"logout"} },
                    create: { method: 'POST', params: { object: ""} }
                });

                var postRequest = $resource(prefixurl + "/:path?:object", null, {
                    getLimit: {method: 'GET',params: {path:"", object: ""},isArray: true},
                    getbyUsername: {method: 'GET',params: {path:"", object: ""},isArray: true}
                });

                var createPosting = $resource(prefixurl + "/:path/:object", null, {
                    create: { method: 'POST', params: { path:"", object: ""} }
                });

                var feedback = $resource(prefixurl + "/:path/:object", null, {
                    create: { method: 'POST', params: { path:"", object: ""} }
                });

                  //EXAMPLE : 
				  //TRY http://52.2.24.172:9090/users open in browser
				  //TRY http://52.2.24.172:9090/users/?{"id":"9b7361d4486408f4"} open in browser
				  
//                var xxxRequest = $resource(prefixurl + "/xxx/:object/?:id", null, {
//					list: { method: 'GET', params: {}, isArray: true, transformResponse: transformResponse },
//					listbyid: { method: 'GET', params: { id:"" }, isArray: true, transformResponse: transformResponse },
//					create: { method: 'POST', params: { object: ""} },
//					update: { method: 'PUT', params: { object : ""} },
//					remove: { method: 'DELETE', params: { object : ""} },
//				});


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

                    var request = {
                        $limit: attrs.limit, 
                        $skip: attrs.skip,
                        $sort: objectSort
                    };

                    var userList = postRequest.getLimit({path : type}, { object : JSON.stringify(request)},
        	            function (success) { responseSuccess(success, null, callback) },
        	            function (error) { responseError(error, callback) });
                };
                

                function getPostbyUsername(name, type, callback) {

                    var request = "username=" + name

                    var userList = postRequest.getbyUsername({path : type}, {object : request},
        	            function (success) { responseSuccess(success, null, callback) },
        	            function (error) { responseError(error, callback) });
                };

                function createPost(attrs, type, callback) {

                    var request = {
						username : attrs.username,
                        displayname : attrs.displayname,
                        title: attrs.title,
						content : attrs.content,
						image : attrs.image,
                        liked: attrs.liked,
                        commented: attrs.commented,
                        shited: attrs.shited,
                        loved: attrs.loved,
                        disliked: attrs.disliked,
						date : attrs.date
					};
					
					var create = createPosting.create({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

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
                        role: "student",
                        status: "active"
					};
                    var user = deploydUser.create(JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };

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
						date : attrs.date,
					};
					
					var create = feedback.create({path : type}, JSON.stringify(request),
						function (success) { responseSuccess(success, null, callback) },
						function (error) { responseError(error, callback) });
                };


                //EXAMPLE : SRART
//              function getxxxList(callback){
//					var xxxList = xxxRequest.list({},
//						function (success) { responseSuccess(success, null, callback) },
//						function (error) { responseError(error, callback) });
//				};

//				function getxxxById(userid,callback){
//					var request = {
//						userid: userid,
//						include: "getNameByID",  
//					***if got include, deployd dashboard write event***
//					***************************************************
// 						if(query.include === 'getNameByID') {
// 							dpd.users.get({id: this.id}, function(users) {
// 								this.usersname = users.displayname;
// 							});
// 						});
//					***************************************************
//					}

//					var xxxList = xxxRequest.listbyid({ id : JSON.stringify(request)},
//						function (success) { responseSuccess(success, null, callback) },
//						function (error) { responseError(error, callback) });
//				};

//				function createXxx(attrs,callback){
//					var request = {
//						userid : attrs.userid,
//						content : attrs.content,
//					};
//					
//					var xxxList = xxxRequest.create(JSON.stringify(request),
//						function (success) { responseSuccess(success, null, callback) },
//						function (error) { responseError(error, callback) });
//				};

//				function updateXxx(attrs,callback){
//					var request = attrs
//					
//					var xxxList = xxxRequest.update(JSON.stringify(request),
//						function (success) { responseSuccess(success, null, callback) },
//						function (error) { responseError(error, callback) });
//				};

//				function removeXxx(id,callback){
//					
//					var xxxList = xxxRequest.remove({object: id},
//						function (success) { responseSuccess(success, null, callback) },
//						function (error) { responseError(error, callback) });
//				};
                 //EXAMPLE : END

                //=============================== RETURN FUNCTION ====================================================
                return {
                    //PUBLIC POST
                    GetPostbyLimit: getPostbyLimit,
                    GetPostbyUsername: getPostbyUsername,


                    CreatePost: createPost,

                    CreateUser: createUser,
                    UserLogin: userLogin,
                    UserLogout: userLogout,
                    GetCurrentUser:getCurrentUser,

                    CreateFeedback: createFeedback,
                    //EXAMPLE
                    //RemovePost: removePost,
                  
                }
            }
        ]);
    }
);