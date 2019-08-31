(function(module) {
try {
  module = angular.module('todoPartials');
} catch (e) {
  module = angular.module('todoPartials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/partials/footer.html',
    '<footer id="footer" ng-show="todos.length" ng-cloak>\n' +
    '					<span id="todo-count"><strong>{{remainingCount}}</strong>\n' +
    '						<ng-pluralize count="remainingCount" when="{ one: \'item left\', other: \'items left\' }"></ng-pluralize>\n' +
    '					</span>\n' +
    '    <ul id="filters">\n' +
    '        <li>\n' +
    '            <a ng-class="{selected: status == \'\'} " href="#/">All</a>\n' +
    '        </li>\n' +
    '        <li>\n' +
    '            <a ng-class="{selected: status == \'active\'}" href="#/active">Active</a>\n' +
    '        </li>\n' +
    '        <li>\n' +
    '            <a ng-class="{selected: status == \'completed\'}" href="#/completed">Completed</a>\n' +
    '        </li>\n' +
    '    </ul>\n' +
    '    <button id="clear-completed" ng-click="clearCompletedTodos()" ng-show="completedCount">Clear completed ({{completedCount}})</button>\n' +
    '</footer>');
}]);
})();

(function(module) {
try {
  module = angular.module('todoPartials');
} catch (e) {
  module = angular.module('todoPartials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/partials/todomvc-index.html',
    '<div>\n' +
    '    <section id="todoapp">\n' +
    '\n' +
    '        <header id="header">\n' +
    '            <h1>todos</h1>\n' +
    '            <form id="todo-form" ng-submit="addTodo()">\n' +
    '                <input id="new-todo" placeholder="What needs to be done?" ng-model="newTodo" ng-disabled="saving">\n' +
    '            </form>\n' +
    '        </header>\n' +
    '\n' +
    '        <section id="main" ng-show="todos.length" ng-cloak>\n' +
    '            <input id="toggle-all" type="checkbox" ng-model="allChecked" ng-click="markAll(allChecked)">\n' +
    '            <label for="toggle-all">Mark all as complete</label>\n' +
    '            <ul id="todo-list">\n' +
    '                <li ng-repeat="todo in todos | filter:statusFilter track by $index" ng-class="{completed: todo.completed, editing: todo == editedTodo}">\n' +
    '                    <div class="view">\n' +
    '                        <input class="toggle" type="checkbox" ng-model="todo.completed" ng-change="toggleCompleted(todo)">\n' +
    '                        <label ng-dblclick="editTodo(todo)">{{todo.title}}</label>\n' +
    '                        <button class="destroy" ng-click="removeTodo(todo)"></button>\n' +
    '                    </div>\n' +
    '                    <form ng-submit="saveEdits(todo, \'submit\')">\n' +
    '                        <input class="edit" ng-trim="false" ng-model="todo.title" todo-escape="revertEdits(todo)" ng-blur="saveEdits(todo, \'blur\')" todo-focus="todo == editedTodo">\n' +
    '                    </form>\n' +
    '                </li>\n' +
    '            </ul>\n' +
    '        </section>\n' +
    '\n' +
    '        <td-footer></td-footer>\n' +
    '\n' +
    '    </section>\n' +
    '    <footer id="info">\n' +
    '        <p>Double-click to edit a todo</p>\n' +
    '    </footer>\n' +
    '</div>\n' +
    '');
}]);
})();
