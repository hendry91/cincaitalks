var request = require("request");
var fs = require('fs');
var FormData = require('form-data');


function ImageShack (apiKey, persist) {
  this.apiKey     = apiKey;
  this.persist    = persist;
  this.authToken  = process.env.IMG_AUTHTOKEN
};

ImageShack.prototype.login = function (username, password, next) {
  if(this.authToken) { return next(); }
  var self = this;
  var r = request.post('https://api.imageshack.com/v2/user/login', 
    function (err, httpResponse, body) {
      if (err) { next(err); }
      var result = JSON.parse(body);
      console.log(result);
      if(self.persist) {
        self.authToken = process.env.IMG_AUTHTOKEN = result.result.auth_token;
      }
      next(null, result);
  });
  var form = r.form();
  form.append('email',    username);
  form.append('password', password);
  form.append('api_key',  this.apiKey);
};

ImageShack.prototype.upload = function (sourcePath, next) {
  console.log(sourcePath);
  var form = new FormData();
  form.append('file',       fs.createReadStream(sourcePath));
  form.append('api_key',    this.apiKey);
  form.append('auth_token', this.authToken);
  form.getLength(function(err,length){
    var r = request.post('https://api.imageshack.com/v2/images', { 
        headers: { 'content-length': length } 
      }, 
      function(err, res, body) { 
        var result = JSON.parse(body);
        console.log(result);
        return next(err, result);
      });
    r._form = form;
  });
};

module.exports = ImageShack; 