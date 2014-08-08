angular.module('NbaScraper')
  .controller('PlayerController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $scope.playerName = "";
    $scope.searchPlayer = function(playerName){
      $scope.isProcessing = true;
      $http.post('/search', playerName)
        .success(function(data, status){
          $scope.playerStat = data;
          $scope.isProcessing = false;
        })
        .error(function(data, status){
          $scope.playerStat = data;
          $scope.isProcessing = false;
        });      
    }
  }])