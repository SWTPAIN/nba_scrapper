angular.module('NbaScraper', ['ngRoute', 'ngAnimate', 'nvd3', 'toaster'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'PlayerController'
      })
      .when('/findings', {
        templateUrl: 'app/views/findings.html',
        controller: 'FindingController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
