
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

	app.factory("User", function($resource){
		return $resource("http://hampton.sqrawler.com:3000/users/:id");
	});
	
	app.controller('UserController', function(User) {
		this.u = User.get({id:1});
	});

	app.controller("UpdateFormController", function() {
		this.data = {};
		this.updateUser = function(user) {
			user.u.name = this.data.name;
			this.data = {}; // clears the form
		}
	});
 
})();

