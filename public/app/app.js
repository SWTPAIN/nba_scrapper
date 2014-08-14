angular.module('NbaScraper', ['ngRoute', 'ngAnimate', 'nvd3', 'toaster'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/main.html',
        controller: 'PlayerController'
      })
      .when('/draft', {
        templateUrl: 'app/views/draft.html',
        controller: 'DraftController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
