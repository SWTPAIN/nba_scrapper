angular.module('NbaScraper', ['ngRoute', 'ngAnimate', 'nvd3', 'toaster'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'PlayerController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
