angular.module('NbaScraper', ['ngRoute', 'nvd3'])
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
