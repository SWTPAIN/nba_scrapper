angular.module('NbaScraper', ['ngRoute'])
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
