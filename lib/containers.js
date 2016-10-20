'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormStubs = exports.testDispatchToProps = exports.testStateToProps = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jasmineCallHelpers = require('@djforth/jasmine-call-helpers');

var _stubsSpyManager = require('@djforth/stubs-spy-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spyManager = (0, _stubsSpyManager.spies)();

var testStateToProps = exports.testStateToProps = function testStateToProps(mod) {
  var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  return function (state, expectedData, calls, props) {
    describe(title + ' map state to props', function () {
      var results = void 0,
          stateToProps = void 0;
      beforeEach(function () {
        props = _lodash2.default.isFunction(props) ? props() : props;

        stateToProps = mod();
        results = stateToProps(state, props);
      });

      _lodash2.default.forIn(expectedData, function (v, k) {
        it('should have ' + k + ' to equal ' + v, function () {
          expect(_lodash2.default.has(results, k)).toBeTruthy();
          expect(results[k]).toEqual(v);
        });
      });

      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

var testDispatchToProps = exports.testDispatchToProps = function testDispatchToProps(title, getMod, stubs) {
  return function (actions) {
    describe(title + ' map state to props', function () {
      var dispatchToProps = void 0,
          dipatchers = void 0;
      afterEach(function () {
        spyManager.removeAll();
      });

      describe('check actions are function', function () {
        actions.forEach(function (act) {
          it('Action ' + (act.actionMethod || act.action) + ' should be a function', function () {
            var action = getMod(act.actionMethod || act.action);
            expect(_lodash2.default.isFunction(action)).toBeTruthy();
          });
        });
      });

      describe('check dispatches', function () {
        var calls = actions.reduce(function (prev, curr, i) {
          var action = curr.actionMethod || curr.action;
          if (_lodash2.default.has(curr.attributes)) {
            (function () {
              var attrs = _lodash2.default.isArray(curr.attributes) ? curr.attributes : [curr.attributes];
              prev[curr.action] = [function () {
                return stubs.get(action);
              }, function () {
                return attrs;
              }];
            })();
          } else {
            prev[curr.action] = function () {
              return stubs.get(action);
            };
          }

          prev['dispatch' + i] = [function () {
            return spyManager.get('dispatch');
          }, function () {
            return [action + '-value'];
          }, i];

          return prev;
        }, {});

        beforeEach(function () {
          var _this = this;

          spyManager.add('dispatch');

          dispatchToProps = getMod('mapDispatchToProps');
          dipatchers = dispatchToProps(spyManager.get('dispatch'));
          actions.forEach(function (act) {
            var action = act.actionMethod || act.action;
            var attrs = _lodash2.default.isArray(act.attributes) ? act.attributes : [act.attributes];
            stubs.return(action)('returnValue', action + '-value');
            dipatchers[act.action].apply(_this, attrs);
          });
        });

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);
      });
    });
  };
};

var FormStubs = exports.FormStubs = function FormStubs(item) {
  return [{
    stub: {
      title: 'DataHelper',
      callback: item
    }
  }, {
    stub: {
      title: 'Selected',
      callback: function callback(c, type) {
        return type;
      },
      returnType: 'callFake'
    }
  }, {
    stub: {
      title: 'SelectedValue',
      callback: false
    }
  }, {
    stub: {
      title: 'CreateOpts',
      callback: function callback(opts) {
        return opts;
      },
      returnType: 'callFake'
    }
  }, {
    stub: {
      title: 'CreateCheckbox',
      callback: function callback(id) {
        return id;
      },
      returnType: 'callFake'
    }
  }, {
    stub: {
      title: 'CreateTitle',
      callback: 'Title'
    }
  }, {
    stub: {
      title: 'GetAssociatedItem',
      spy: {
        title: 'selected_item',
        callback: function callback(items, name) {
          return name;
        },
        returnType: 'callFake'
      }
    }
  }, {
    stub: {
      title: 'InsertPosition',
      callback: { draft_key: 'aaa', position: 222 }
    }
  }];
};