(function (angular) {
    var app = angular.module('module.newland.tree', []);
    function $NLTree($NLTree) {
        return {
            restrict: 'EA',
            scope: {
                data: "=",
                defaultToggled: "=",
                selectedRow: "=",
                dataKey: "@",
                nameKey: "@"
            },
            controller: ["$scope", function ($scope) {
                if (!$scope.nameKey) $scope.nameKey = 'name';
                if (!$scope.dataKey) $scope.dataKey = 'data';
                $scope.select = function (row) {
                    if (row.active) {
                        row.active = false;
                        $scope.selectedRow = undefined;
                    } else {
                        if ($scope.selectedRow) $scope.selectedRow.active = false;
                        row.active = true;
                        $scope.selectedRow = row;
                    }
                }
                $scope.changeToggled = function (row) {
                    row.toggled = !row.toggled;
                }
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
                    "   <li ng-repeat='row" + i + " in " + (i == 0 ? "data" : "row" + (i-1) + "[dataKey]") +"' ng-class=\"{'active':(row" + i + ".active), 'toggled': row" + i + ".toggled}\" ng-init='initRowTOG(row" + i + ")'>" +
                    "       <i class='fa' ng-class=\"{'fa-plus-square-o': (row"+i+"[dataKey] && !row"+i+".toggled), 'fa-minus-square-o': (!row"+i+"[dataKey] || row"+i+".toggled)}\" ng-click='changeToggled(row"+i+")'></i>" +
                    "       <a href='javascript:;' ng-click='select(row"+i+")' ng-dblclick='changeToggled(row"+i+")'><span>{{row"+i+"[nameKey]}}</span></a>" +
                    "   </li>" +
                    "</ul>");
                tar.append(ul);
                tar = ul.children("li");
            }
        }
    }
    app.directive("nlTree", ["$NLTree", $NLTree]);
    app.provider("$NLTree", function treeProvider() {
        this.maxDepth = 10;
        this.defaultToggled = false;
        this.$get = function () {
            return new treeProvider();
        }
    })
})(angular);