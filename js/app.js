
(function() { // We use this anonymous function to create a closure.

	var app = angular.module('splatter-web', ['ngResource']);
	
	app.config(function($provide) {
		$provide.decorator('$q', ['$delegate', '$rootScope', function($delegate, $rootScope) {
		  var pendingPromisses = 0;
		  $rootScope.$watch(
			function() { return pendingPromisses > 0; }, 
			function(loading) { $rootScope.loading = loading; }
		  );
		  var $q = $delegate;
		  var origDefer = $q.defer;
		  $q.defer = function() {
			var defer = origDefer();
			pendingPromisses++;
			defer.promise.finally(function() {
			  pendingPromisses--;
			});
			return defer;
		  };
		  return $q;
		}]);
	});
	
	var apiurl = "http://hampton.sqrawler.com/api"; // no trailing slash
	
	app.factory("Splatts", function($resource){
		return $resource(apiurl+"/splatts/:id");
	});

	app.factory('NewSplatt', function($resource)  {
		return $resource(apiurl+'/splatts/', {"splatt": {"body":"test22", "user_id":"1"}},
			{'update': {method:'POST'}} );
	});
	
	app.factory('User', function($resource)  {
		return $resource(apiurl+'/users/:id.json', {id: '@id'},{
			'update': 			{method:'PUT'},
			'follow': 			{method:'POST', 		url:apiurl+'/api/users/follows/'},
			'unfollow': 			{method:'DELETE', 	url:apiurl+'/users/follows/:id/:follows_id'},
			'createsplatt': 		{method:'POST', 		url:apiurl+"/splatts.json"},
			'mysplatts': 		{method:'GET', 		url: apiurl+"/users/splatts/:id.json",isArray:true},
			'myfeed': 			{method:'GET', 		url: apiurl+"/users/splatts-feed/:id.json",isArray:true},
		});
	});
	
	

	app.controller('UserController', function(User) {
			this.data = {};
			this.ulist = User.query();
			this.getUser = function(i) {
			return User.get({id: i});
		};
		
		this.newsplatt = function () {
			data = {"splatt":{
						"body": 		this.data.splattbody, 
  						"user_id": 	this.loggedin_user.id 
			}}
			
			User.createsplatt({},data);
			this.data = {}
		};

		this.login = function() {
			this.loggedin_user = this.getUser(this.data.id);
			this.mysplatts = User.mysplatts({id: this.data.id});
			this.myfeed = User.myfeed({id:this.data.id});
			$('body').addClass('loggedin');
			this.data = {};
		};
		
		
		this.logout = function() {
			this.loggedin_user = "";	
			$('body').removeClass('loggedin');
		}
		
		this.followUser = function() {	
			data = {"id": this.loggedin_user.id,"follows_id": this.data.followid};
			User.follow({},data);
			this.data = {}
		};
		
		this.unfollowUser = function() {	
			User.unfollow({id: this.loggedin_user.id,follows_id: this.data.unfollowid},{});
			this.data = {} 
		}
		
		this.updateUser = function() {
			this.loggedin_user.name = this.data.name;
			this.loggedin_user.email = this.data.email;
			this.loggedin_user.blurb = this.data.blurb;
			this.loggedin_user.$update();
			
			this.data = {};
		};

		this.createUser = function() {
			this.u = new User();
			this.u.name = this.data.cname;
			this.u.email = this.data.cemail;
			this.u.password = this.data.cpassword;
			this.u.blurb = this.data.cblurb;
			this.u.$save(function(u){
				alert("Account successfully created, please login with the user id " + u.id);
			},function(u){
				alert("Uhoh, there was an error creating your account, please try again.");
			});
			this.data = {};
		};

		this.delUser = function() {
			User.delete({id: this.data.delid});
		};
			


	});	
		
	
	app.controller('GetAllSplatts', function(Splatts) {
		this.feed = Splatts.query();
	});

	app.controller("UpdateFormController", function() {
		this.data = {};
		this.updateUser = function(user) {
			user.u.name = this.data.name;
			this.data = {}; // clears the form
		}
	});
 
})();

