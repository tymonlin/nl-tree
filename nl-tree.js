/**
 * data: 数据
 * defaultToggled: 是否默认打开所有节点
 * selected(row): 选中一个节点后的事件
 * loadNodes(row): 动态加载子节点的事件
 * dataKey: 子节点的数据 Key
 * nameKey: 显示字符串的 Key
 * translateKey: 是否加载i18n,以及对应的key（true/false)
 * multiSelect: 是否多选框（true/false), 多选框默认选中时，要用 checked 字段进行预值
 * treeFlag: 是否显示树形结构（true/false)
 * setConfig： json对象设置，配置基本信息
 * {
 *      toggledOpenIcon: "fa fa-minus-square-o", 节点打开时的图标
        toggledCloseIcon: "fa fa-plus-square-o",  节点关闭时的图标
        defaultToggled: false,                  是否默认打开所有节点
        defaultMultiSelect: false               是否多选框
 * }
 */
(function (angular) {
    var app = angular.module('module.newland.tree', []);
    function $NLTree($NLTree, $injector) {
        return {
            restrict: 'EA',
            scope: {
                data: "=",
                defaultToggled: "=",
                selected: "&",
                loadNodes: "&",
                dataKey: "@",
                nameKey: "@",
                multiSelect: "@",
                translateKey: "@",
                setConfig: "@",
                treeFlag: "@"
            },
            controller: ["$scope", function ($scope) {
                $scope.config = angular.extend({}, $NLTree.defaultConfig);
                if ($scope.setConfig) {
                    angular.extend($scope.config, jQuery.parseJSON($scope.setConfig));
                }
                if (!$scope.nameKey) $scope.nameKey = 'name';
                if (!$scope.dataKey) $scope.dataKey = 'data';
                if ($scope.multiSelect == undefined) {
                    $scope.multiSelect = $scope.config.defaultMultiSelect;
                } else if ($scope.multiSelect == 'true') {
                    $scope.multiSelect = true;
                } else {
                    $scope.multiSelect = false;
                }
                if (!$scope.fatherNodeCheck) $scope.fatherNodeCheck = false;
                if ($scope.treeFlag != undefined && $scope.treeFlag == 'false') {
                    $scope.showTree = false;
                } else {
                    $scope.showTree = true;
                }
                if ($scope.translateKey && !$injector.has("$translate")) {
                    console.warn("The angular-translate module was not loaded, or the translate-key parameter was cancelled.");
                }
                $scope.select = function (row) {
                    if ($scope.multiSelect) {
                        if ($scope.showTree == false) {
                            $scope.check(row);
                        }
                        return;
                    };
                    if (row.active) {
                        row.active = false;
                        $scope.selected({row: undefined});
                        $scope.selectedRow = undefined;
                    } else {
                        if ($scope.selectedRow) $scope.selectedRow.active = false;
                        row.active = true;
                        $scope.selected({'row': row});
                        $scope.selectedRow = row;
                    }
                };
                $scope.check = function (row) {
                    // 0 没选中
                    // 1 部分选中
                    // 2 全选中
                    row.checked = row.checked ? 0 : 2;
                    if ($scope.treeFlag == false) return;
                    recursiveChecked(row, row.checked);
                    $NLTree.recursiveState($scope.data, $scope.dataKey);
                };
                function recursiveChecked(row, state) {
                    row.checked = state;
                    var list = row[$scope.dataKey];
                    if (list) {
                        for (var i = 0; i < list.length; i++) {
                            var sonRow = list[i];
                            recursiveChecked(sonRow, state);
                        }
                    }
                };
                $scope.changeToggled = function (row) {
                    if (!$scope.showTree) return;
                    if (!row.toggled) {
                        var data = $scope.loadNodes({"row": row});
                        if (data) row.data = data;
                    }
                    row.toggled = !row.toggled;
                };
                $scope.initRowTOG = function (row) {
                    if (row.active) {
                        if ($scope.selectedRow) $scope.selectedRow.active = false;
                        $scope.selectedRow = row;
                    }
                    if (row[$scope.dataKey]) {
                        row.toggled = row.toggled == undefined ? ($scope.defaultToggled == undefined ? $scope.config.defaultToggled : $scope.defaultToggled) : row.toggled;
                    } else {
                        row.toggled = false;
                    }
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
                    "       <i ng-if='showTree' ng-class=\"{true:config.toggledOpenIcon, false:config.toggledCloseIcon}[row"+i+".toggled == true]\" ng-click='changeToggled(row"+i+")'></i>" +
                    "       <i ng-show='multiSelect' ng-class=\"{'fa fa-square-o': !row" + i + ".checked, 'fa fa-check-square-o': row" + i + ".checked==2, 'fa fa-check-square': row" + i + ".checked==1}\" ng-click='check(row"+i+")'></i>" +
                    "       <a href='javascript:;' ng-click='select(row"+i+")' ng-dblclick='changeToggled(row"+i+")'><span>{{translateKey ? (row" + i + "[translateKey] | nlTreeTranslate) : row"+i+"[nameKey]}}</span></a>" +
                    "   </li>" +
                    "</ul>");
                tar.append(ul);
                tar = ul.children("li");
            }
        }
    }
    app.directive("nlTree", ["$NLTree", "$injector", $NLTree]);
    app.filter("nlTreeTranslate", ["$NLTree", "$injector", function ($NLTree, $injector) {
        var $translate = $injector.has("$translate") ? $injector.get("$translate") : undefined;
        var fun = function (tag) {
            return $translate ? $translate.instant(tag) : tag;
        };
        fun.$stateful = true;
        return fun;
    }]);
    app.provider("$NLTree", function treeProvider() {
        this.defaultConfig = {
            toggledOpenIcon: "fa fa-minus-square-o",
            toggledCloseIcon: "fa fa-plus-square-o",
            defaultToggled: false,
            defaultMultiSelect: false
        };
        this.maxDepth = 10;
        this.getCheckedList = function (list, dataKey, hasFatherNode) {
            if (!dataKey) dataKey = "data";
            var target = [];
            for (var i = 0; i < list.length; i++) {
                var row = list[i],sonCheckedList = [];
                if (row[dataKey]) sonCheckedList = this.getCheckedList(row[dataKey], dataKey, hasFatherNode);
                if ((!hasFatherNode && !row[dataKey] && row.checked == 2) || (hasFatherNode && row.checked == 2)) target.push(row);
                target = target.concat(sonCheckedList);
            }
            return target;
        };
        this.recursiveState = function (list, dataKey) {
            var result = 0;
            for (var i = 0; i < list.length; i++) {
                var row = list[i];
                var state = row.checked;
                if (row[dataKey]) {
                    state = this.recursiveState(row[dataKey], dataKey);
                    row.checked = state;
                }
                if (result == 0 && i == 0) {
                    result = state ? state : 0;
                } else if( (result == 0 && state == 2 && i > 0) || (result == 2 && !state) || (state == 1)) {
                    result = 1;
                }
            }
            return result;
        };
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
        };
    })
})(angular);