'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkDefaultValues = exports.testGetUrl = exports.destroyDataActions = exports.updateDataActions = exports.createDataActions = exports.processDataActions = exports.getDataActions = exports.MultiDispatchAction = exports.actionMethod = exports.actionTypes = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint-env jasmine, browser */

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jasmineCallHelpers = require('@djforth/jasmine-call-helpers');

var _stubsSpyManager = require('@djforth/stubs-spy-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spyManager = (0, _stubsSpyManager.spies)();

// Helpers
var createStubsAndSpies = function createStubsAndSpies(items, stubs) {
  stubs.add(items);
  var spies = items.map(function (item) {
    return item + 'Something';
  });
  spyManager.add(spies);

  items.forEach(function (item) {
    stubs.return(item)('returnValue', spyManager.get(item + 'Something'));
  });
};

var getReturnType = function getReturnType(item) {
  return _lodash2.default.has(item, 'return_type') ? item.return_type : 'returnValue';
};

var createWithReturns = function createWithReturns(items, stubs) {
  stubs.add(_lodash2.default.compact(_lodash2.default.map(items, 'stub')));

  var spies = _lodash2.default.map(items, 'spy');
  spyManager.add(_lodash2.default.compact(spies));

  items.forEach(function (item) {
    var return_type = getReturnType(item);
    if (_lodash2.default.has(item, 'stub')) {
      var rValue = _lodash2.default.has(item, 'spy') ? spyManager.get(item.spy) : item.data;
      stubs.return(item.stub)(return_type, rValue);
    } else if (_lodash2.default.has(item, 'spy')) {
      spyManager.addReturn(item.spy)(return_type, item.data);
    }
  });
};

var constructArguments = function constructArguments(args) {
  if (_lodash2.default.isFunction(args)) return args;
  return function () {
    args.map(function (arg) {
      if (_lodash2.default.isPlainObject(arg) && _lodash2.default.has(arg, 'spy')) return spyManager.get(arg.spy);
      if (_lodash2.default.isString(arg) && arg === 'dispatch') return spyManager.get(arg);
      return arg;
    });
  };
};

var checkcalls = function checkcalls(data) {
  return _lodash2.default.has(data, 'stub') || _lodash2.default.has(data, 'spy') || _lodash2.default.has(data, 'dispatch');
};

var createStubCall = function createStubCall(data, stubs) {
  var obj = {};
  var call = [function () {
    return stubs.get(data.stub);
  }, constructArguments(data.attrs)];
  if (_lodash2.default.has(data, 'callcount')) {
    call.push(data.callcount);
  }

  obj[data.stub] = call;
  return obj;
};

var createSpyCall = function createSpyCall(data) {
  var obj = {};
  var call = [function () {
    return spyManager.get(data.spy);
  }, constructArguments(data.attrs)];
  if (_lodash2.default.has(data, 'callcount')) {
    call.push(data.callcount);
  }

  obj[data.spy] = call;
  return obj;
};

var createDispatchCall = function createDispatchCall(data) {
  var obj = {};
  var call = [function () {
    return spyManager.get('dispatch');
  }, constructArguments(data.attrs)
  // , data.dispatch
  ];
  obj['dispatch' + data.dispatch] = call;
  return obj;
};

var constructCalls = function constructCalls(data, stubs) {
  return _lodash2.default.reduce(data, function (calls, new_call) {
    if (!checkcalls(new_call)) return calls;
    if (_lodash2.default.has(new_call, 'stub')) {
      return Object.assign(calls, createStubCall(new_call, stubs));
    }

    if (_lodash2.default.has(new_call, 'spy')) {
      return Object.assign(calls, createSpyCall(new_call));
    }

    if (_lodash2.default.has(new_call, 'dispatch')) {
      return Object.assign(calls, createDispatchCall(new_call));
    }

    return calls;
  }, {});
};

var constructDispatch = function constructDispatch(dispatchs) {
  var calls = {};
  _lodash2.default.forEach(dispatchs, function (d, i) {
    var c = [function () {
      return spyManager.get('dispatch');
    }, function () {
      return [d];
    }, i];
    calls['dispatch' + i] = c;
  });
  return calls;
};

var booleanCheck = function booleanCheck(c) {
  return c ? 'toBeTruthy' : 'toBeFalsey';
};

function CheckSpy(spy_data) {
  var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['some data'];
  var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['some state'];

  var spy = void 0;
  var attrs = state;
  if (_lodash2.default.isArray(spy_data)) {
    spy = spy_data[0];
    attrs = attrs.concat(spy_data[1]);
  } else {
    spy = spy_data;
    attrs = attrs.concat(attr);
  }
  return { spy: spy, attrs: attrs };
}
// Helpers end

var actionTypes = exports.actionTypes = function actionTypes(types, actions) {
  describe('Action Types', function () {
    actions.forEach(function (action) {
      it('should have action type of ' + action, function () {
        expect(typeof action === 'undefined' ? 'undefined' : _typeof(action)).toEqual('string');
        expect(types).toContain(action);
      });
    });
  });
};

var actionMethod = exports.actionMethod = function actionMethod(title, mod) {
  return function (expectedData, ip) {
    describe(title, function () {
      var action = void 0,
          value = void 0;
      beforeEach(function () {
        action = mod();
        value = action.apply(this, ip);
      });

      _lodash2.default.forIn(expectedData, function (v, k) {
        if (_lodash2.default.isPlainObject(v) && _lodash2.default.has(v, 'check')) {
          it('should have ' + k + ' that ' + v.check + ' & returns ' + v.boolean, function () {
            var exp = value[k];
            expect(_lodash2.default.has(value, k)).toBeTruthy();
            expect(_lodash2.default[v.check](exp))[booleanCheck(v.boolean)]();
          });
        } else {
          it('should have ' + k + ' that equals ' + v, function () {
            var exp = value[k];
            expect(_lodash2.default.has(value, k)).toBeTruthy();
            expect(exp).toEqual(v);
          });
        }
      });
    });
  };
};

var MultiDispatchAction = exports.MultiDispatchAction = function MultiDispatchAction(title, mainAction, stubs, sp) {
  return function (actions, state, args) {
    describe(title + ' action', function () {
      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        spyManager.addReturn('getState')('returnValue', state);
        spyManager.add('dispatch');
        createWithReturns(actions, stubs);
        var Action = mainAction();
        var action = Action.apply(this, args);
        action(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      var calls = Object.assign({
        getState: function getState() {
          return spyManager.get('getState');
        }
      }, constructCalls(actions, stubs, spyManager));
      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

// Fetch Actions
var getDataActions = exports.getDataActions = function getDataActions(title, stubs, GetMethod) {
  return function (urlFn, actions) {
    var url = void 0;

    describe('Get ' + title, function () {
      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        spyManager.add(['fetcher', 'getState', 'dispatch']);
        stubs.return('FetchAction')('returnValue', spyManager.get('fetcher'));
        stubs.return(urlFn)('returnValue', 'some/api/call');

        spyManager.addReturn('getState')('returnValue', 'some state');
        spyManager.addReturn('fetcher')('returnValue', 'fetching');
        GetMethod()(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      var calls = {
        getState: function getState() {
          return spyManager.get('getState');
        },
        dispatch: [function () {
          return spyManager.get('dispatch');
        }, function () {
          return ['fetching'];
        }],
        FetchAction: [function () {
          return stubs.get('FetchAction');
        }, function () {
          return actions;
        }],
        fetcher: [function () {
          return spyManager.get('fetcher');
        }, function () {
          return ['some/api/call'];
        }]
      };

      calls[urlFn] = [function () {
        return stubs.get(urlFn);
      }, function () {
        return ['some state'];
      }];

      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

var processDataActions = exports.processDataActions = function processDataActions(title, stubs, ProcessMethod) {
  return function (returnData, dispatchs, data) {
    describe('Process ' + title, function () {
      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        createWithReturns(returnData, stubs);
        spyManager.add('dispatch');
        ProcessMethod(data)(spyManager.get('dispatch'));
      });
      var calls = constructCalls(returnData, stubs);
      calls = Object.assign({}, calls, constructDispatch(dispatchs));
      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

var DispatchCounter = function DispatchCounter() {
  var counter = -1;
  return function () {
    counter++;
    return counter;
  };
};

var TestMethods = function TestMethods(type, promises) {
  return function (list) {
    list.forEach(function (li) {
      it('Called once saved ' + li[0], function (done) {
        var _promises = promises();

        var _promises2 = _slicedToArray(_promises, 2);

        var promise = _promises2[0];
        var resolve = _promises2[1];

        promise.then(function () {
          var spy = type.get(li[0]);
          expect(spy).toHaveBeenCalled();

          var attrs = li[1]();
          var calls = spy.calls.argsFor(li[2] || 0);
          attrs.forEach(function (attr) {
            expect(calls).toContain(attr);
          });
        });

        resolve('success');

        setTimeout(function () {
          done();
        }, 10);
      });
    });
  };
};

// Creating tests
var createDataActions = exports.createDataActions = function createDataActions(title, stubs, CreateMethod) {
  return function (fns, CreateBlock, actions) {
    var state = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { foo: 'bar' };

    describe('Create ' + title, function () {
      var _fns = _slicedToArray(fns, 4);

      var processFn = _fns[0];
      var readyData = _fns[1];
      var urlFn = _fns[2];
      var StopEditing = _fns[3];


      readyData = CheckSpy(readyData);
      urlFn = CheckSpy(urlFn);

      var creator = void 0,
          insert = void 0,
          promise = void 0,
          reject = void 0,
          resolve = void 0;

      var stubs_spies = (0, _stubsSpyManager.helper)(stubs, spyManager);
      var makeSpyCalls = (0, _jasmineCallHelpers.make_calls)(spyManager);
      var makeStubCalls = (0, _jasmineCallHelpers.make_calls)(stubs);

      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        promise = new Promise(function (res, rej) {
          resolve = res;
          reject = rej;
        });

        insert = {
          snippet_draft_key: 'aaa',
          entity_mappable_offset: 1
        };

        state = Object.assign(state, { snippets: { editorState: 'some-editor-state' } });

        var stsp = [{
          stub: 'CreateAction',
          spy: 'creator'
        }, {
          spy: 'creator',
          callback: 'creating'
        }, {
          stub: processFn,
          callback: processFn
        }, {
          stub: 'InsertPosition',
          callback: insert
        }, {
          stub: 'Save',
          callback: promise
        }, {
          stub: urlFn.spy,
          callback: 'some/api/call'
        }, {
          stub: readyData.spy,
          callback: function callback(st, d) {
            return d;
          }
        }, {
          spy: 'dispatch',
          callback: function callback(rv) {
            return rv;
          }
        }, { spy: 'getState',
          callback: function callback() {
            return state;
          }
        }];

        if (CreateBlock) {
          stsp = stsp.concat([{ stub: 'CreateBlock',
            callback: CreateBlock
          }]);
        }

        if (StopEditing) {
          stsp = stsp.concat([{ stub: StopEditing,
            callback: 'stop-editing'
          }]);
        }

        stubs_spies(stsp);

        creator = CreateMethod({ data: 'some data' });
        creator(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      it('should return function', function () {
        expect(_lodash2.default.isFunction(creator)).toBeTruthy();
      });

      var dispatch_call = DispatchCounter();

      var create_action_stubs = [['CreateAction', function () {
        return actions.concat([stubs.get(processFn)]);
      }]];

      var create_block_stubs = void 0,
          create_block_spies = void 0,
          stop_editing_stubs = void 0,
          stop_editing_spies = void 0;

      if (StopEditing) {
        stop_editing_stubs = [[StopEditing, function () {
          return [];
        }]];

        stop_editing_spies = [['dispatch', function () {
          return ['stop-editing'];
        }, dispatch_call()]];
      }

      if (CreateBlock) {
        create_block_stubs = [['CreateBlock', function () {
          return [CreateBlock];
        }]];

        create_block_spies = [['dispatch', function () {
          return [CreateBlock];
        }, dispatch_call()]];
      }

      var save_stubs = [['Save', function () {
        return [];
      }]];

      var save_spies = [['dispatch', function () {
        return [promise];
      }, dispatch_call()]];

      var create_spies = [['getState', function () {
        return [];
      }], ['dispatch', function () {
        return ['creating'];
      }, dispatch_call()], ['creator', function () {
        return ['some/api/call', Object.assign({ data: 'some data' }, insert)];
      }]];

      var create_stubs = [['InsertPosition', function () {
        return ['some-editor-state'];
      }], [urlFn.spy, function () {
        return [state, Object.assign({ data: 'some data' }, insert)];
      }], [readyData.spy, function () {
        return [state, Object.assign({ data: 'some data' }, insert)];
      }]];

      var calls = makeStubCalls(create_action_stubs);

      if (StopEditing) {
        calls = makeStubCalls(stop_editing_stubs, calls);
        calls = makeSpyCalls(stop_editing_spies, calls);
      }

      if (CreateBlock) {
        calls = makeStubCalls(create_block_stubs, calls);
        calls = makeSpyCalls(create_block_spies, calls);
      }

      calls = makeStubCalls(save_stubs, calls);
      calls = makeSpyCalls(save_spies, calls);
      (0, _jasmineCallHelpers.check_multiple_calls)(calls);

      var testSpy = TestMethods(spyManager, function () {
        return [promise, resolve];
      });
      var testStub = TestMethods(stubs, function () {
        return [promise, resolve];
      });
      testSpy(create_spies);
      testStub(create_stubs);
    });
  };
};

// Update Test
var updateDataActions = exports.updateDataActions = function updateDataActions(title, stubs, UpdateMethod) {
  return function (processFn, readyData, urlFn, actions, data) {
    readyData = CheckSpy(readyData);
    urlFn = CheckSpy(urlFn);
    describe('Update ' + title, function () {
      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        spyManager.add(['updater', 'getState', 'dispatch']);
        stubs.add(processFn);
        stubs.return('UpdateAction')('returnValue', spyManager.get('updater'));
        stubs.return(urlFn.spy)('returnValue', 'some/api/call');
        stubs.return(readyData.spy)('returnValue', 'some data');

        spyManager.addReturn('getState')('returnValue', 'some state');
        spyManager.addReturn('updater')('returnValue', 'updating');
        UpdateMethod(data)(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      var calls = {
        getState: function getState() {
          return spyManager.get('getState');
        },
        dispatch: [function () {
          return spyManager.get('dispatch');
        }, function () {
          return ['updating'];
        }],
        UpdateAction: [function () {
          return stubs.get('UpdateAction');
        }, function () {
          return actions.concat([stubs.get(processFn)]);
        }],
        updater: [function () {
          return spyManager.get('updater');
        }, function () {
          return ['some/api/call', 'some data'];
        }]
      };

      calls[urlFn.spy] = [function () {
        return stubs.get(urlFn.spy);
      }, function () {
        return urlFn.attrs;
      }];
      calls[readyData.spy] = [function () {
        return stubs.get(readyData.spy);
      }, function () {
        return readyData.attrs;
      }];

      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

// Destroy Tests
var destroyDataActions = exports.destroyDataActions = function destroyDataActions(title, stubs, DestroyMethod) {
  return function (processFn, readyData, urlFn, actions, data) {
    readyData = CheckSpy(readyData);
    urlFn = CheckSpy(urlFn);

    describe('Destroy ' + title, function () {
      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        spyManager.add(['destroyer', 'getState', 'dispatch']);
        stubs.add(processFn);
        stubs.return('DestroyAction')('returnValue', spyManager.get('destroyer'));
        stubs.return(urlFn.spy)('returnValue', 'some/api/call');
        stubs.return(readyData.spy)('callFake', function () {
          return data;
        });

        spyManager.addReturn('getState')('returnValue', 'some state');
        spyManager.addReturn('destroyer')('returnValue', 'destroying');
        DestroyMethod(data)(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      var calls = {
        getState: function getState() {
          return spyManager.get('getState');
        },
        dispatch: [function () {
          return spyManager.get('dispatch');
        }, function () {
          return ['destroying'];
        }],
        DestroyAction: [function () {
          return stubs.get('DestroyAction');
        }, function () {
          return actions.concat([stubs.get(processFn)]);
        }],
        destroyer: [function () {
          return spyManager.get('destroyer');
        }, function () {
          return ['some/api/call', data];
        }]
      };

      calls[urlFn.spy] = [function () {
        var spy = stubs.get(urlFn.spy);
        return stubs.get(urlFn.spy);
      }, function () {
        return urlFn.attrs;
      }];

      calls[readyData.spy] = [function () {
        return stubs.get(readyData.spy);
      }, function () {
        return readyData.attrs;
      }];

      (0, _jasmineCallHelpers.check_multiple_calls)(calls);
    });
  };
};

// GetUrl tests
var testGetUrl = exports.testGetUrl = function testGetUrl(title, mod, stubs) {
  return function (state_path) {
    var with_id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    describe(title, function () {
      var getUrl = void 0,
          data = void 0,
          state = void 0;

      afterEach(function () {
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function () {
        getUrl = mod();
        spyManager.addReturn('create_url')('returnValue', 'my/api');
        data = { data_key: 'aaa' };

        state = {};
      });

      describe('If a fail', function () {
        var url = void 0;
        beforeEach(function () {
          stubs.return('CreateUrl')('returnValue', null);
          url = getUrl(null, data);
        });

        it('should return null', function () {
          expect(url).toBeNull();
        });

        var calls = {
          CreateUrl: [function () {
            return stubs.get('CreateUrl');
          }, function () {
            return [null, state_path];
          }]
        };
        (0, _jasmineCallHelpers.check_multiple_calls)(calls);
      });

      describe('If a success', function () {
        var attrs = void 0,
            url = void 0;
        beforeEach(function () {
          stubs.return('CreateUrl')('returnValue', spyManager.get('create_url'));
          url = getUrl(state, data);

          attrs = [data];
          if (with_id) attrs.push(1);
        });

        it('should return api url', function () {
          expect(url).toEqual('my/api');
        });

        var calls = {
          CreateUrl: [function () {
            return stubs.get('CreateUrl');
          }, function () {
            return [state, state_path];
          }],
          create_url: [function () {
            return spyManager.get('create_url');
          }, function () {
            return attrs;
          }]
        };
        (0, _jasmineCallHelpers.check_multiple_calls)(calls);
      });
    });
  };
};

var checkDefaultValues = exports.checkDefaultValues = function checkDefaultValues(title, defaultValues, expected, state) {
  describe('Should return the default value of ' + title, function () {
    var default_value = defaultValues(state);

    _lodash2.default.forIn(default_value, function (v, k) {
      it(k + ' should equal ' + v, function () {
        expect(_lodash2.default.has(default_value, k)).toBeTruthy();
        expect(expected[k]).toEqual(default_value[k]);
      });
    });
  });
};