angular.module('NbaScraper')
  .controller('PlayerController', ['$scope', '$rootScope', '$http', 'toaster', function($scope, $rootScope, $http ,toaster){
    $scope.playerName = "";
    $scope.playerData = {};
    $scope.playersData =[]; //initial values
    $scope.isProcessing = false;
    $scope.searchPlayer = function(playerName){
      $scope.isProcessing = true;
      $http.post('/search', playerName)
        .success(function(data, status){
          $scope.playerData = data;
          $scope.isProcessing = false;
        })
        .error(function(data, status){
          $scope.isProcessing = false;
          $scope.notification = data
        });
    };

  $scope.$watch('playerData', function(newVal, oldVal){
    if(oldVal == newVal) return;
    $scope.playersData.push(getScoreData(newVal));
  })

  $scope.$watch('notification', function(newVal, oldVal){
    if(oldVal == newVal) return;
    $scope.pop();
  })  

  $scope.pop = function(){
    toaster.pop('error', "Error", $scope.notification, 6000);
  };

  $scope.options = {
            chart: {
              type: 'lineChart',
              height: 200,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 40,
                  left: 55
              },
              x: function(d){ return d.x; },
              y: function(d){ return d.y; },
              useInteractiveGuideline: true,
              dispatch: {
                  // stateChange: function(e){ console.log("stateChange"); },
                  // changeState: function(e){ console.log("changeState"); },
                  // tooltipShow: function(e){ console.log("tooltipShow"); },
                  // tooltipHide: function(e){ console.log("tooltipHide"); }
              },
              xAxis: {
                  axisLabel: 'Age',
                  tickFormat: function(d){
                      return d3.format(',.2f')(d);
                  }
              },
              yAxis: {
                  axisLabel: 'Points',
                  tickFormat: function(d){
                      return d3.format(',.2f')(d);
                  },
                  axisLabelDistance: 30
              },
              callback: function(chart){
                  console.log("!!! lineChart callback !!!");
              }
            },
            title: {
              enable: true,
              text: 'Player Stat'
            },
            subtitle: {
              enable: true,
              text: 'Scoring aganist age',
              css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
              }
            },
            caption: {
              enable: true,
              html: '<b>Figure 1.</b>',
              css: {
                'text-align': 'justify',
                'margin': '10px 13px 0px 7px'
              }
            }
  };

  //Getting the first year scoring data
  function getScoreData(data){
    var firstYear = [];
    // if (Object.getOwnPropertyNames(data).length === 0){
    //   return [
    //     {
    //       values: [ {x:0, y:0}]
    //     }
    //   ]
    // }
    
    var totalgames = _.flatten(data.yearlyGameStat.map(function(ys){
      return ys.yearGameStat
    }))

    var games = totalgames;
    for ( var i=0; i<games.length-1; i++){
      firstYear.push({
        x:  games[i].age*1,
        y:  games[i].pts*1             
      })
    };

    return {
        values: firstYear,
        key: data.fullName,
        color: getRandomColor()
    }
  }; 

  function getRandomColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#'
    for (var i=0; i<6; i++){
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}]);