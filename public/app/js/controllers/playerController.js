angular.module('NbaScraper')
  .controller('PlayerController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $scope.playerName = "";
    $scope.searchPlayer = function(playerName){
      $http.post('/search', playerName)
        .success(function(data, status){
          $scope.playerStat = data;
        })
        .error(function(data, status){
          $scope.playerStat = data;
        });      
    }
  }])