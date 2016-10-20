'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jasmineCallHelpers = require('@djforth/jasmine-call-helpers');

var _stubsSpyManager = require('@djforth/stubs-spy-manager');

var stub_helper = function stub_helper(type) {
  return function (state, action) {
    if (action.type === type) return type;
    return false;
  };
};

var MakesCalls = function MakesCalls(stubs) {
  return function (state, action, current, fn) {
    var calls = fn.reduce(function (prev, curr) {
      var call = {};
      call[curr] = [function () {
        return stubs.get(curr);
      }, function () {
        return [state, action];
      }];
      return Object.assign(prev, call);
    }, {});

    return Object.assign({
      setDefaults: [function () {
        return stubs.get('setDefaults');
      }, function () {
        return [current];
      }]
    }, calls);
  };
};

exports.default = function (title, stubs, spyManager) {
  return function (reducer, default_state) {
    var stubs_spies = (0, _stubsSpyManager.helper)(stubs, spyManager);

    var make_calls = MakesCalls(stubs);

    describe(title + ' reducer', function () {
      beforeEach(function () {
        stubs_spies([{
          stub: 'updateState',
          spy: {
            title: 'update_state',
            callback: 'new-state'
          }

        }, {
          stub: 'setDefaults',
          returnType: 'callFake',
          callback: function callback(state) {
            return Object.assign({}, default_state, state);
          }
        }, {
          stub: 'fetcher',
          returnType: 'callFake',
          callback: stub_helper('FETCH')
        }, {
          stub: 'creator',
          returnType: 'callFake',
          callback: stub_helper('CREATE')

        }, {
          stub: 'destroyer',
          returnType: 'callFake',
          callback: stub_helper('DESTROY')

        }, {
          stub: 'updater',
          returnType: 'callFake',
          callback: stub_helper('UPDATE')
        }, {
          stub: 'modal',
          returnType: 'callFake',
          callback: stub_helper('MODAL')
        }]);
      });

      describe('when nothing matches', function () {
        var state = void 0;
        beforeEach(function () {
          state = reducer({}, { type: 'FOO' });
        });

        var calls = make_calls(default_state, { type: 'FOO' }, {}, ['fetcher', 'creator', 'destroyer', 'updater', 'modal']);

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);

        it('should return default state', function () {
          expect(state).toEqual(default_state);
        });
      });

      describe('when fetch matches', function () {
        var state = void 0;
        beforeEach(function () {
          state = reducer({}, { type: 'FETCH' });
        });

        var calls = make_calls(default_state, { type: 'FETCH' }, {}, ['fetcher']);

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);

        it('should return FETCH', function () {
          expect(state).toEqual('FETCH');
        });
      });

      describe('when create matches', function () {
        var state = void 0;
        beforeEach(function () {
          state = reducer({}, { type: 'CREATE' });
        });

        var calls = make_calls(default_state, { type: 'CREATE' }, {}, ['fetcher', 'creator']);

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);

        it('should return CREATE', function () {
          expect(state).toEqual('CREATE');
        });
      });

      describe('when destroy matches', function () {
        var state = void 0;
        beforeEach(function () {
          state = reducer({}, { type: 'DESTROY' });
        });

        var calls = make_calls(default_state, { type: 'DESTROY' }, {}, ['fetcher', 'creator', 'destroyer']);

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);

        it('should return DESTROY', function () {
          expect(state).toEqual('DESTROY');
        });
      });

      describe('when update matches', function () {
        var state = void 0;
        beforeEach(function () {
          state = reducer({}, { type: 'UPDATE' });
        });

        var calls = make_calls(default_state, { type: 'UPDATE' }, {}, ['fetcher', 'creator', 'destroyer', 'updater']);

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);

        it('should return UPDATE', function () {
          expect(state).toEqual('UPDATE');
        });
      });

      describe('when modal matches', function () {
        var state = void 0;
        beforeEach(function () {
          state = reducer({}, { type: 'MODAL' });
        });

        var calls = make_calls(default_state, { type: 'MODAL' }, {}, ['fetcher', 'creator', 'destroyer', 'updater', 'modal']);

        (0, _jasmineCallHelpers.check_multiple_calls)(calls);

        it('should return MODAL', function () {
          expect(state).toEqual('MODAL');
        });
      });
    });
  };
};