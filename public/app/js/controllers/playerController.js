angular.module('NbaScraper')
  .controller('PlayerController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $scope.playerName = "";
    $scope.playerStat = {};
    $scope.searchPlayer = function(playerName){
      $scope.isProcessing = true;
      $http.post('/search', playerName)
        .success(function(data, status){
          $scope.playerStat = data;
          console.log(data);
          $scope.isProcessing = false;
          $scope.data = getScoreData($scope.playerStat);  
        })
        .error(function(data, status){
          $scope.playerStat = data;
          $scope.isProcessing = false;
        });
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
                  stateChange: function(e){ console.log("stateChange"); },
                  changeState: function(e){ console.log("changeState"); },
                  tooltipShow: function(e){ console.log("tooltipShow"); },
                  tooltipHide: function(e){ console.log("tooltipHide"); }
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

        // $scope.data = sinAndCos();
        $scope.data = getScoreData($scope.playerStat);  


        //Getting the first year scoring data
        function getScoreData(data){
          var firstYear = [];
          if (Object.getOwnPropertyNames(data).length === 0){
            return [
              {
                values: [ {x:0, y:0}]
              }
            ]
          }
          
          var games = data.yearlyGameStat[0].yearGameStat;
          for ( var i=0; i<games.length-1; i++){
            firstYear.push({
              x:  games[i].age*1,
              y:  games[i].pts*1             
            })
          };

          return [
            {
              values: firstYear,
              keys: 'First Year Scoring',
              color: '#ff7f0e'
            }
          ]
        }; 

  }])