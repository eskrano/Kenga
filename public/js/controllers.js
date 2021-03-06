/**
 * Created by dead on 15.05.2016.
 */
var adminControllers = angular.module('adminControllers', [])
    .controller('LessonsCtrl', function ($rootScope, $scope, $http, $location, $mdDialog, $routeParams) {
        $scope.params = {name: 'Lessons', url: 'lessons', editurl: 'lesson'};
        console.log($scope.params.name + " Ctrl init");

        $scope.sortType = 'name'; // set the default sort type
        $scope.sortReverse = false;  // set the default sort order
        $scope.search = $routeParams.search;

        $scope.init = function () {
            console.log($scope.params.name + " Ctrl scope init");
            $http.get("/api/v1/" + $scope.params.url + "", $rootScope.config)
                .then(function (res) {
                    //console.log(res.data.response[0]);
                    if (res.data.error == false) {
                        console.log($scope.params.name + " Ctrl data to view");
                        $scope.data = res.data.response;
                    } else {
                        console.log($scope.params.name + " Ctrl data have error");
                        $rootScope.warning('Request return error');
                    }
                }, function (res) {
                    console.log($scope.params.name + " Ctrl bad request");
                    $rootScope.error('Request failed');
                });
        };
        $scope.publish = function (event) {
            var id = event.id;
            console.log($scope.params.name + " Ctrl try publish event with id" + id);
            var confirm = $mdDialog.confirm()
                .textContent('Your want publish event with id:' + id + '?')
                .ok('Please do it!')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                $http.get('/api/v1/' + $scope.params.url + '/publish/' + id, $rootScope.config)
                    .then(function (res) {
                        if (res.data.error !== true) {
                            event.publish = 1;
                            $rootScope.success('Request is done');
                        } else if (res.data.error == true) {
                            console.log(res);
                            $rootScope.warning('Request return error try with:' + res.data.response + '<br>' + res.data.message);
                        }
                    }, function (res) {
                        console.log(res);
                        $rootScope.error('Request return error code');
                    });
            }, function () {
                $rootScope.info('Publish event was aborted');
            });

        };
        $scope.unpublish = function (event) {
            var id = event.id;
            console.log($scope.params.name + " Ctrl try unpublish event with id" + id);
            var confirm = $mdDialog.confirm()
                .textContent('Your want unpublish event with id:' + id + '?')
                .ok('Please do it!')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                $http.get('/api/v1/' + $scope.params.url + '/unpublish/' + id, $rootScope.config)
                    .then(function (res) {
                        if (res.data.error !== true) {
                            event.publish = 0;
                            $rootScope.success('Request is done');
                        } else if (res.data.error == true) {
                            console.log(res);
                            $rootScope.warning('Request return error try with:' + res.data.response + '<br>' + res.data.message);
                        }
                    }, function (res) {
                        console.log(res);
                        $rootScope.error('Request return error code');
                    });
            }, function () {
                $rootScope.info('UnPublish event was aborted');
            });

        };
        $scope.edit = function (id) {
            console.log($scope.params.name + ' Ctrl try edit ' + id);
            $location.path("/" + $scope.params.editurl + "/" + id);
        };
        $scope.delete = function (id) {
            console.log($scope.params.name + ' Ctrl try delete ' + id);
            var confirm = $mdDialog.confirm()
                .title('Really?')
                .textContent('Your want delete item with id:' + id + '?')
                .ariaLabel('Lucky day')
                .ok('Please do it!')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                $http.delete('/api/v1/' + $scope.params.url + '/' + id, $rootScope.config)
                    .then(function (res) {
                        if (res.data.error !== true) {
                            $rootScope.success('Request is done');
                            $http.get("/api/v1/" + $scope.params.url + "")
                                .then(function (res) {
                                    //console.log(res.data.response[0]);
                                    if (res.data.error == false) {
                                        console.log($scope.params.name + " Ctrl data to view");
                                        $scope.data = res.data.response;
                                    } else {
                                        console.log($scope.params.name + " Ctrl data have error");
                                        $rootScope.warning('Request return error');
                                    }
                                }, function (res) {
                                    console.log($scope.params.name + " Ctrl bad request");
                                    $rootScope.error('Request failed');
                                });
                        } else if (res.data.error == true) {
                            console.log(res);
                            $rootScope.warning('Request return error try with:' + res.data.response + '<br>' + res.data.message);
                        }
                    }, function (res) {
                        console.log(res);
                        $rootScope.error('Request return error code');
                    });
            }, function () {
                $rootScope.info('Request was aborted');
            });
        };
    })
    .controller('LessonCtrl', function ($rootScope, $scope, $http, $routeParams, $location, Upload, $timeout) {
        /*PARAMS FOR CONTROLLER*/
        $scope.params = {name: 'Lesson', url: 'lessons'};
        console.log($scope.params.name + " Ctrl init");
        $scope.data = {};
        $scope.init = function () {
            console.log($scope.params.name + " Ctrl scope init");
            $http.get('api/v1/' + $scope.params.url + '/s/edit', {ignoreLoadingBar: true})
                .then(function (res) {
                    console.log($scope.params.name + '  Ctrl loading schema');
                    //console.log(res.data.response);
                    $scope.schema = res.data.response;
                    //console.log($scope.schema);
                    angular.forEach(res.data.response, function (v, i) {
                        $scope.data[v.key];
                    })
                    //console.log($scope.data);
                });
            $scope.id = $routeParams.id;
            if (typeof $scope.id == 'undefined') {
                $scope.id = 'new';
            } else {
                $http.get('/api/v1/' + $scope.params.url + '/' + $scope.id,$rootScope.config).then(function (res) {
                    $scope.data = res.data.response;
                    $scope.photos = res.data.response.photos;
                    //console.log($scope.photos);
                });
            }
            console.log($scope.params.name + ' Ctrl try edit id ' + $scope.id);
        };

        $scope.removePhoto = function (photoId) {
            //console.log(photoId);
            $http.get('/api/v1/photo/' + photoId+'/remove',$rootScope.config).then(function (res) {
                $scope.init();
            });

        }
        /*upload image*/
        $scope.upload = function (file) {
            //console.log(file);
            console.log($scope.params.name + ' Ctrl  try upload' + file);
            if (file) {
                console.log($scope.params.name + ' Ctrl  file exists');
                var file = file;
                if (!file.$error) {
                    console.log($scope.params.name + ' Ctrl  go upload');
                    Upload.upload({
                        url: '/images/upload',
                        data: {
                            image: file,
                            event:$scope.id
                        }
                    }).then(function (res) {
                        //console.log(res);
                        if (res.status == 200) {
                            //$scope.uploadedFile = res.data;
                            $rootScope.success('OK');
                            $scope.init();
                        }
                    });
                }

            }
        };
        $scope.save = function () {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            console.log($scope.params.name + ' Ctrl try save user with id:' + $scope.id);
            if ($scope.id !== 'new') {
                //console.log($scope.data);
                //$rootScope.transform(
                $http.put('/api/v1/' + $scope.params.url + '/' + $scope.id,$rootScope.serialize($scope.data), $rootScope.config)
                    .then(function (res) {
                        if (res.data.error == false) {
                            //$scope.id
                            $rootScope.success('OK');
                            $location.path('/' + $scope.params.url + '');
                        } else {
                            if (res.data.message == 'valid') {
                                var msg = '';
                                angular.forEach(res.data.validator, function (v, i) {
                                    msg += v + '<br>';
                                })
                            } else {
                                msg = res.data.message;
                            }
                            $rootScope.warning(msg);
                        }
                    }, function (res) {
                        $rootScope.error('Request return failed');
                    });
            } else {
                //console.log($scope.data);
                console.log($scope.params.name + ' Ctrl try save new row');
                $http.post('/api/v1/' + $scope.params.url + '', $rootScope.transform($scope.data), $rootScope.config)
                    .then(function (res) {
                        if (res.data.error == false) {
                            $rootScope.success('OK');
                            $location.path('/' + $scope.params.url + '');
                        } else {
                            if (res.data.message == 'valid') {
                                var msg = '';
                                angular.forEach(res.data.validator, function (v, i) {
                                    msg += v + '<br>';
                                })
                            } else {
                                msg = res.data.message;
                            }
                            $rootScope.warning(msg);
                        }
                    }, function (res) {
                        $rootScope.error('Request return failed');
                    });
            }

        }
    })
