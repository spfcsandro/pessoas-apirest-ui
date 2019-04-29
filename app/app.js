// create the module and name it app

var app = angular.module('app', ['ngRoute', 'ngMaterial', 'ngMessages', 'ui.mask', 'md.data.table']);

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

app.config(['uiMask.ConfigProvider', function(uiMaskConfigProvider) {
    uiMaskConfigProvider.clearOnBlur(false);
}]);

// configure our routes
app.config(function($routeProvider) {
    $routeProvider
        // route for the home page
        .when('/', {
            templateUrl : 'views/home.html',
            controller  : 'mainController'
        })
        // route for the about page
        .when('/list-people', {
            templateUrl : 'views/list-people.html',
            controller: 'listPeopleController',
        })
});

app.controller('listPeopleController', function($scope, $http, $mdDialog) {
    $scope.isLoading = true;
    $scope.status = '  ';
    $scope.customFullscreen = false;
    $scope.message = 'Realize cadastro e manutenção nos dados.';
    // $scope.user = null;
    $scope.selected = [];
    $scope.query = {
        order: 'name',
        limit: 5,
        page: 1
    }

    $scope.getPeoples = function() {
        $http.get('https://apirest-pessoas-angularjs.herokuapp.com/rest/pessoas', {headers: {"Accept": "*/*"}})
            .then(data => {
                console.log(data);
                $scope.datas = data['data'];
                $scope.isLoading = false;
            }).catch(err => {
                console.log(err)
            });
    };


    $scope.getStates = function () {
        $http.get('https://br-cidade-estado-nodejs.glitch.me/estados')
            .then(dataStates => {
                $scope.states = dataStates;
                $scope.isLoadingState = false;
            }).catch(errStates => {
                console.log(errStates);
            });
    };

    $scope.deletePeople = function(idPeople) {
        $http.delete(`https://apirest-pessoas-angularjs.herokuapp.com/rest/pessoa/remove/${idPeople}`)
            .then(deleteUser => {
                $scope.getPeoples();
                console.log(deleteUser);
            }).catch(errDelete => {
                console.log(errDelete);
            })
    }

    $scope.getPeoples();

    $scope.getStates();

    console.log($scope.datas);

    $scope.showAdvanced = function(ev, dataToPass, method) {
        console.log(ev);
        $mdDialog.show({
            locals: {dataToPass: dataToPass, method: method, states: $scope.states},
            controller: DialogController,
            templateUrl: 'views/dialog-people.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $http.get('https://apirest-pessoas-angularjs.herokuapp.com/rest/pessoas', {headers: {"Accept": "*/*"}})
                    .then(data => {
                        $scope.datas = data['data'];
                    }).catch(err => {   
                        console.log(err)
                    });
            });
    };

    function DialogController($scope, $mdDialog, dataToPass, method, states, $http) {
        $scope.user = dataToPass;
        $scope.method = method;
        $scope.isLoadingState = true;
        $scope.states = states['data'];
        $scope.state = null;
        $scope.citys  = null;

        $scope.saveStates = function (idState) {
            $scope.state = idState;
        }

        $scope.getCityByState = function (idState) {
            $http.get(`https://br-cidade-estado-nodejs.glitch.me/estados/${idState}/cidades`)
            .then(dataCitys => {
                $scope.citys = dataCitys['data'];
            }).catch(errCitys => {
                console.log(errCitys);
            }); 
        }

        $scope.hide = function() {
            $mdDialog.hide();
        };
    
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };

        $scope.create = function() {
            $scope.isLoadingSave = true;
            $http.post('https://apirest-pessoas-angularjs.herokuapp.com/rest/pessoa/save', $scope.user)
                .then(dataSave => {
                    console.log(dataSave);
                    $scope.isLoadingSave = false;
                    $scope.cancel();
                }).catch(err => {
                    console.log(err)
                })
        };

        $scope.save = function() {
            $scope.isLoadingSave = true;
            $http.post(`https://apirest-pessoas-angularjs.herokuapp.com/rest/pessoa/save/${$scope.user.id}`, $scope.user)
                .then(dataSave => {
                    console.log(dataSave);
                    $scope.isLoadingSave = false;
                    $scope.cancel();
                }).catch(err => {
                    console.log(err)
                })
            console.log($scope.user);
        };
    }
});

// create the controller and inject Angular's $scope
app.controller('mainController', function($scope) {
    // create a message to display in our view
    $scope.message = 'Home';
});