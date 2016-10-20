'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootReducerWithReturn = exports.rootReducer = exports.simpleReducerTest = exports.testDefaults = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /*eslint-env jasmine, browser */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jasmineCallHelpers = require('@djforth/jasmine-call-helpers');

var _stubsSpyManager = require('@djforth/stubs-spy-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SetStubs(stubs, reducer, returnValue) {
  stubs.return(reducer)('returnValue', returnValue || reducer);
  return stubs.get(reducer);
}

function SetSpy(sm, spy) {
  sm.add(spy);
  sm.addReturn(spy)('returnValue', spy);
}

function checkReducer(data, rtn) {
  describe('Reducer check', function () {
    var spy = void 0,
        state = void 0;
    beforeEach(function () {
      var _data = data();

      var _data2 = _slicedToArray(_data, 2);

      spy = _data2[0];
      state = _data2[1];
    });

    it('should call the reducer', function () {
      expect(spy).toHaveBeenCalled();
    });

    it('should return reducer value', function () {
      expect(state).toEqual(rtn);
    });
  });
}

function getMessage(arg) {
  var msg = 'should have correct argument';
  if (!_lodash2.default.isFunction(arg)) {
    msg += 'of ' + arg;
  }

  return msg;
}

function checkArgs(data, exp) {
  var call = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  describe('check arguments', function () {
    var spy = void 0;
    beforeEach(function () {
      spy = data();
    });

    it('should have the correct number of argument', function () {
      var count = spy.calls.argsFor(call).length;
      // console.log(count, exp.length)
      expect(count).toEqual(exp.length);
    });

    exp.forEach(function (arg) {
      it(getMessage(arg), function () {
        if (_lodash2.default.isFunction(arg)) {
          arg = arg();
        }
        expect(spy.calls.argsFor(call)).toContain(arg);
      });
    });
  });
}

var testDefaults = exports.testDefaults = function testDefaults(setDefaults, expected_defaults) {
  describe('setDefaults', function () {
    var defaults = void 0;
    beforeEach(function () {
      var set_defaults = setDefaults();
      defaults = set_defaults();
    });

    _lodash2.default.forIn(expected_defaults, function (value, key) {
      it('It should have ' + key + ' that equals ' + value, function () {
        expect(_lodash2.default.has(defaults, key)).toBeTruthy();
        expect(defaults[key]).toEqual(value);
      });
    });
  });
};

var simpleReducerTest = exports.simpleReducerTest = function simpleReducerTest(method, get_reducer) {
  return function () {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var exp_args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    describe(method + ' changes state', function () {
      var new_state = void 0,
          update_state = void 0,
          reducer = void 0;
      beforeEach(function () {
        reducer = get_reducer();
        spyManager.add('update_state');
        spyManager.addReturn('update_state')('returnValue', 'new_state');
        update_state = spyManager.get('update_state');
        var args = [update_state].concat(attrs);
        new_state = reducer.apply(this, args);
      });

      afterEach(function () {
        spyManager.removeAll();
      });

      var calls = {
        update_state: [function () {
          return update_state;
        }, function () {
          return exp_args;
        }]
      };

      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

var rootReducer = exports.rootReducer = function rootReducer(stubs, mainReducer) {
  return function (reducer, action, exp) {
    var call = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var state = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    describe(reducer + ' called on ' + action.type, function () {
      var fn = void 0,
          newState = void 0;
      afterEach(function () {
        stubs.revertAll(); // Reverts All stubs
      });
      beforeEach(function () {
        fn = SetStubs(stubs, reducer);
        newState = mainReducer(state, action);
      });

      checkReducer(function () {
        return [fn, newState];
      }, reducer);
      checkArgs(function () {
        return fn;
      }, exp, call);
    });
  };
};

var rootReducerWithReturn = exports.rootReducerWithReturn = function rootReducerWithReturn(stubs, mainReducer) {
  return function (reducer, action, exp, spy_args) {
    describe(reducer + ' called on ' + action.type, function () {
      var fn = void 0,
          newState = void 0;
      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });
      beforeEach(function () {
        spyManager.addReturn(reducer + '_spy')('returnValue', reducer + '_spy');
        fn = SetStubs(stubs, reducer, spyManager.get(reducer + '_spy'));
        newState = mainReducer(null, action);
      });

      checkReducer(function () {
        return [fn, reducer + '_spy'];
      }, reducer + '_spy');
      checkArgs(function () {
        return fn;
      }, exp);

      describe('return function', function () {
        checkReducer(function () {
          return [spyManager.get(reducer + '_spy'), newState];
        }, reducer + '_spy');
        checkArgs(function () {
          return spyManager.get(reducer + '_spy');
        }, spy_args);
      });
    });
  };
};