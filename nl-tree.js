(function (angular) {
    var app = angular.module('module.newland.tree', []);
    function $NLTree($NLTree) {
        return {
            restrict: 'EA',
            scope: {
                data: "=",
                defaultToggled: "=",
                selectedRow: "@",
                selected: "&",
                dataKey: "@",
                nameKey: "@",
                fatherNodeCheck: "@",
                multiSelect: "="
            },
            controller: ["$scope", function ($scope) {
                if (!$scope.nameKey) $scope.nameKey = 'name';
                if (!$scope.dataKey) $scope.dataKey = 'data';
                if (!$scope.multiSelect) $scope.multiSelect = $NLTree.defaultMultiSelect;
                if (!$scope.fatherNodeCheck) $scope.fatherNodeCheck = false;
                $scope.select = function (row) {
                    if (row.active) {
                        if ($scope.multiSelect) {
                            recursiveActive(row, false);
                        } else {
                            row.active = false;
                            $scope.selected({row: undefined});
                            $scope.selectedRow = undefined;
                        }
                    } else {
                        if ($scope.selectedRow) $scope.selectedRow.active = false;
                        if ($scope.multiSelect) {
                            recursiveActive(row, true);
                        } else {
                            row.active = true;
                            $scope.selected({'row': row});
                            $scope.selectedRow = row;
                        }
                    }
                };
                function recursiveActive(row, state) {
                    row.active = state;
                    var list = row[$scope.dataKey];
                    if (list) {
                        for (var i = 0; i < list.length; i++) {
                            var sonRow = list[i];
                            recursiveActive(sonRow, state);
                        }
                    }
                }
                $scope.changeToggled = function (row) {
                    row.toggled = !row.toggled;
                };
                var d = $scope.defaultToggled;
                $scope.initRowTOG = function (row) {
                    row.toggled = row.toggled == undefined ? (d == undefined ? $NLTree.defaultToggled : d) : row.toggled;
                };
            }],
            template: "<div></div>",
            replace: true,
            compile: $compile
        };
        function $compile(elem, attrs) {
            var tar = $(elem);
            for (var i = 0; i < $NLTree.maxDepth; i++) {
                var ul = $("<ul ng-if='" + (i == 0 ? true : ("row" + (i-1) + "[dataKey]")) +"'>" +
                    "   <li ng-repeat='row" + i + " in " + (i == 0 ? "data" : "row" + (i-1) + "[dataKey]") +"' " +
                    "       ng-class=\"{'active':(row" + i + ".active), 'toggled': row" + i + ".toggled}\" " +
                    "       ng-init='initRowTOG(row" + i + ")'>" +
                    "       <i class='fa' ng-class=\"{'fa-plus-square-o': (row"+i+"[dataKey] && !row"+i+".toggled), 'fa-minus-square-o': (!row"+i+"[dataKey] || row"+i+".toggled)}\" ng-click='changeToggled(row"+i+")'></i>" +
                    "       <i class='fa' ng-show='multiSelect && (fatherNodeCheck || (!fatherNodeCheck && !row" + i + "[dataKey]))'" +
                    "           ng-class=\"{true: 'fa-square-o', false: 'fa-check-square-o'}[row" + i + ".active != true]\"" +
                    "           ng-click='select(row"+i+")' ng-dblclick='changeToggled(row"+i+")'></i>" +
                    "       <a href='javascript:;' ng-click='select(row"+i+")' ng-dblclick='changeToggled(row"+i+")'><span>{{row"+i+"[nameKey]}}</span></a>" +
                    "   </li>" +
                    "</ul>");
                tar.append(ul);
                tar = ul.children("li");
            }
        }
    }
    app.directive("nlTree", ["$NLTree", $NLTree]);
    // app.filter("nlTreeChecked", function () {
    //     return function (data) {
    //         var state = -1;
    //         for (var i = 0; i < data.length; i++) {
    //             var row = data[i];
    //             if (state == -1) {
    //                 state = row.active ? 2 : 0;
    //                 continue;
    //             }
    //             if (state == 0 && row.active) {
    //                 state = 1;
    //             } else if (state == 2 && !row.active) {
    //                 state = 1;
    //             }
    //         }
    //         return state;
    //     }
    // });
    app.provider("$NLTree", function treeProvider() {
        this.maxDepth = 10;
        this.defaultToggled = false;
        this.defaultMultiSelect = false;
        this.sortDataList = function(list, parentId, keyId, parentIdKey) {
            var targetList = [];
            for (var i = 0; i < list.length; i++) {
                var object = list[i];
                if (object[parentIdKey] == parentId) {
                    var sonList = this.sortDataList(list, object[keyId], keyId, parentIdKey);
                    if (sonList.length > 0) object.data = sonList;
                    targetList.push(object);
                }
            }
            return targetList;
        };
        this.$get = function () {
            return new treeProvider();
        }
    })
})(angular);