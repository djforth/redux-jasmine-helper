/* eslint-env jasmine, browser */

import _ from 'lodash';

import {
  check_multiple_calls as checkMulti
  , make_calls as MakeCalls
  , not_called as CreateNotCalled
} from '@djforth/jasmine-call-helpers';

import {
  spies as SpyManager
  , helper as StubsSpyHelper
} from '@djforth/stubs-spy-manager';

const spyManager = SpyManager();

// Helpers
const createStubsAndSpies = (items, stubs)=>{
  stubs.add(items);
  let spies = items.map((item)=>`${item}Something`);
  spyManager.add(spies);

  items.forEach((item)=>{
    stubs.return(item)('returnValue', spyManager.get(`${item}Something`));
  });
};

const getReturnType = (item)=>{
  return (_.has(item, 'return_type')) ? item.return_type : 'returnValue';
};

const createWithReturns = (items, stubs)=>{
  stubs.add(_.compact(_.map(items, 'stub')));

  let spies = _.map(items, 'spy');
  spyManager.add(_.compact(spies));

  items.forEach((item)=>{
    let return_type = getReturnType(item);
    if (_.has(item, 'stub')){
      let rValue = (_.has(item, 'spy')) ? spyManager.get(item.spy) : item.data;
      stubs.return(item.stub)(return_type, rValue);
    } else if(_.has(item, 'spy')) {
      spyManager.addReturn(item.spy)(return_type, item.data);
    }
  });
};

const constructArguments = function(args){
  if (_.isFunction(args)) return args;
  return function(){
    args.map((arg)=>{
      if (_.isPlainObject(arg) && _.has(arg, 'spy')) return spyManager.get(arg.spy);
      if (_.isString(arg) && arg === 'dispatch')return spyManager.get(arg);
      return arg;
    });
  };
};

const checkcalls = (data)=>{
  return _.has(data, 'stub') ||
  _.has(data, 'spy') ||
  _.has(data, 'dispatch');
};

const createStubCall = (data, stubs)=>{
  let obj = {};
  let call = [
    ()=>stubs.get(data.stub)
    , constructArguments(data.attrs)
  ];
  if (_.has(data, 'callcount')){
    call.push(data.callcount);
  }

  obj[data.stub] = call;
  return obj;
};

const createSpyCall = (data)=>{
  let obj = {};
  let call = [
    ()=>spyManager.get(data.spy)
    , constructArguments(data.attrs)
  ];
  if (_.has(data, 'callcount')){
    call.push(data.callcount);
  }

  obj[data.spy] = call;
  return obj;
};

const createDispatchCall = (data)=>{
  let obj = {};
  let call = [
    ()=>{
      return spyManager.get('dispatch');
    }
    , constructArguments(data.attrs)
    // , data.dispatch
  ];
  obj[`dispatch${data.dispatch}`] = call;
  return obj;
};

const constructCalls = (data, stubs)=>{
  return _.reduce(data, (calls, new_call)=>{
    if (!checkcalls(new_call)) return calls;
    if (_.has(new_call, 'stub')){
      return Object.assign(calls, createStubCall(new_call, stubs));
    }

    if (_.has(new_call, 'spy')){
      return Object.assign(calls, createSpyCall(new_call));
    }

    if (_.has(new_call, 'dispatch')){
      return Object.assign(calls, createDispatchCall(new_call));
    }

    return calls;
  }, {});
};

const constructDispatch = (dispatchs)=>{
  let calls = {};
  _.forEach(dispatchs, (d, i)=>{
    let c = [
      ()=>spyManager.get('dispatch')
      , ()=>[d]
      , i
    ];
    calls[`dispatch${i}`] = c;
  });
  return calls;
};

const booleanCheck = (c)=>(c) ? 'toBeTruthy' : 'toBeFalsey';

function CheckSpy(spy_data, attr = ['some data'], state = ['some state']){
  let spy;
  let attrs = state;
  if (_.isArray(spy_data)){
    spy = spy_data[0];
    attrs = attrs.concat(spy_data[1]);
  } else {
    spy = spy_data;
    attrs = attrs.concat(attr);
  }
  return {spy, attrs};
}
// Helpers end

export const actionTypes = (types, actions)=>{
  describe('Action Types', function(){
    actions.forEach((action)=>{
      it(`should have action type of ${action}`, function(){
        expect(typeof action).toEqual('string');
        expect(types).toContain(action);
      });
    });
  });
};

export const actionMethod = (title, mod)=>{
  return (expectedData, ip)=>{
    describe(title, function(){
      let action, value;
      beforeEach(function(){
        action = mod();
        value = action.apply(this, ip);
      });

      _.forIn(expectedData, (v, k)=>{
        if (_.isPlainObject(v) && _.has(v, 'check')){
          it(`should have ${k} that ${v.check} & returns ${v.boolean}`, function(){
            let exp = value[k];
            expect(_.has(value, k)).toBeTruthy();
            expect(_[v.check](exp))[booleanCheck(v.boolean)]();
          });
        } else {
          it(`should have ${k} that equals ${v}`, function(){
            let exp = value[k];
            expect(_.has(value, k)).toBeTruthy();
            expect(exp).toEqual(v);
          });
        }
      });
    });
  };
};

export const MultiDispatchAction = (title, mainAction, stubs, sp)=>{
  return (actions, state, args)=>{
    describe(`${title} action`, function(){
      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function(){
        spyManager.addReturn('getState')('returnValue', state);
        spyManager.add('dispatch');
        createWithReturns(actions, stubs);
        let Action = mainAction();
        let action = Action.apply(this, args);
        action(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      let calls = Object.assign(
        {
          getState: ()=>spyManager.get('getState')
        }
        , constructCalls(actions, stubs, spyManager)
      );
      checkMulti(calls);
    });
  };
};

// Fetch Actions
export const getDataActions = (title, stubs, GetMethod)=>{
  return (urlFn, actions)=>{
    let url;

    describe(`Get ${title}`, function(){
      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function(){
        spyManager.add([
          'fetcher'
          , 'getState'
          , 'dispatch'
        ]);
        stubs.return('FetchAction')('returnValue', spyManager.get('fetcher'));
        stubs.return(urlFn)('returnValue', 'some/api/call');

        spyManager.addReturn('getState')('returnValue', 'some state');
        spyManager.addReturn('fetcher')('returnValue', 'fetching');
        GetMethod()(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      let calls = {
        getState: ()=>spyManager.get('getState')
        , dispatch: [()=>{
          return spyManager.get('dispatch');
        }, ()=>['fetching']
        ]
        , FetchAction: [()=>stubs.get('FetchAction')
          , ()=>actions
        ]
        , fetcher: [()=>{
          return spyManager.get('fetcher');
        }, ()=>['some/api/call']
        ]
      };

      calls[urlFn] = [()=>{
        return stubs.get(urlFn);
      }, ()=>['some state']
      ];

      checkMulti(calls);
    });
  };
};

export const processDataActions = (title, stubs, ProcessMethod)=>{
  return (returnData, dispatchs, data)=>{
    describe(`Process ${title}`, function(){
      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function(){
        createWithReturns(returnData, stubs);
        spyManager.add('dispatch');
        ProcessMethod(data)(spyManager.get('dispatch'));
      });
      let calls = constructCalls(returnData, stubs);
      calls = Object.assign({}, calls, constructDispatch(dispatchs));
      checkMulti(calls);
    });
  };
};

const DispatchCounter = ()=>{
  let counter = -1;
  return ()=>{
    counter++;
    return counter;
  };
};

const TestMethods = (type, promises)=>(list)=>{
  list.forEach((li)=>{
    it(`Called once saved ${li[0]}`, function(done){
      let [promise, resolve] = promises();
      promise.then(()=>{
        let spy = type.get(li[0]);
        expect(spy).toHaveBeenCalled();

        let attrs = li[1]();
        let calls = spy.calls.argsFor(li[2] || 0);
        attrs.forEach((attr)=>{
          expect(calls).toContain(attr);
        });
      });

      resolve('success');

      setTimeout(function(){
        done();
      }, 10);
    });
  });
};

// Creating tests
export const createDataActions = (title, stubs, CreateMethod)=>{
  return (fns, CreateBlock, actions, state = {foo: 'bar'})=>{
    describe(`Create ${title}`, function(){
      let [
        processFn, readyData, urlFn, StopEditing
      ] = fns;

      readyData = CheckSpy(readyData);
      urlFn = CheckSpy(urlFn);

      let creator, insert, promise, reject, resolve;

      let stubs_spies = StubsSpyHelper(stubs, spyManager);
      let makeSpyCalls = MakeCalls(spyManager);
      let makeStubCalls = MakeCalls(stubs);

      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function(){
        promise = new Promise((res, rej)=>{
          resolve = res;
          reject  = rej;
        });

        insert = {
          snippet_draft_key: 'aaa'
          , entity_mappable_offset: 1
        };

        state = Object.assign(state
          , {snippets: {editorState: 'some-editor-state'}});

        let stsp = [
          {
            stub: 'CreateAction'
            , spy: 'creator'
          }
          , {
            spy:'creator'
            , callback: 'creating'
          }
          , {
            stub: processFn
            , callback: processFn
          }
          , {
            stub: 'InsertPosition'
            , callback: insert
          }
          , {
            stub: 'Save'
            , callback: promise
          }
          , {
            stub: urlFn.spy
            , callback: 'some/api/call'
          }
          , {
            stub: readyData.spy
            , callback: (st, d)=>d
          }
          , {
            spy: 'dispatch'
            , callback: (rv)=>rv
          }
          , {spy: 'getState'
            , callback: ()=>state
          }
        ];

        if (CreateBlock){
          stsp = stsp.concat([
            {stub: 'CreateBlock'
              , callback: CreateBlock
            }
          ]);
        }

        if (StopEditing){
          stsp = stsp.concat([
            {stub:  StopEditing
            , callback: 'stop-editing'
            }
          ]);
        }

        stubs_spies(stsp);

        creator = CreateMethod({data: 'some data'});
        creator(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      it('should return function', function(){
        expect(_.isFunction(creator)).toBeTruthy();
      });

      let dispatch_call = DispatchCounter();

      let create_action_stubs = [
        ['CreateAction', ()=>actions.concat([stubs.get(processFn)])]
      ];

      let create_block_stubs, create_block_spies, stop_editing_stubs, stop_editing_spies;

      if (StopEditing){
        stop_editing_stubs = [
          [StopEditing, ()=>[]]
        ];

        stop_editing_spies = [
          ['dispatch', ()=>['stop-editing'], dispatch_call()]
        ];
      }

      if (CreateBlock){
        create_block_stubs = [
          ['CreateBlock', ()=>[CreateBlock]]
        ];

        create_block_spies = [
          ['dispatch', ()=>[CreateBlock], dispatch_call()]
        ];
      }



      let save_stubs = [
        ['Save', ()=>[]]
      ];

      let save_spies = [
        ['dispatch', ()=>[promise], dispatch_call()]
      ];

      let create_spies = [
        ['getState', ()=>[]]
        , ['dispatch', ()=>['creating'], dispatch_call()]
        , ['creator', ()=>['some/api/call', Object.assign({data: 'some data'}, insert)]]
      ];

      let create_stubs = [
        ['InsertPosition', ()=>['some-editor-state']]
        , [urlFn.spy, ()=>[state, Object.assign({data: 'some data'}, insert)]]
        , [readyData.spy, ()=>[state, Object.assign({data: 'some data'}, insert)]]
      ];

      let calls = makeStubCalls(create_action_stubs);

      if (StopEditing){
        calls = makeStubCalls(stop_editing_stubs, calls);
        calls = makeSpyCalls(stop_editing_spies, calls);
      }

      if (CreateBlock){
        calls = makeStubCalls(create_block_stubs, calls);
        calls = makeSpyCalls(create_block_spies, calls);
      }

      calls = makeStubCalls(save_stubs, calls);
      calls = makeSpyCalls(save_spies, calls);
      checkMulti(calls);

      let testSpy = TestMethods(spyManager, ()=>[promise, resolve]);
      let testStub = TestMethods(stubs, ()=>[promise, resolve]);
      testSpy(create_spies);
      testStub(create_stubs);
    });
  };
};

// Update Test
export const updateDataActions = (title, stubs, UpdateMethod)=>{
  return (processFn, readyData, urlFn, actions, data)=>{
    readyData = CheckSpy(readyData);
    urlFn = CheckSpy(urlFn);
    describe(`Update ${title}`, function(){
      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function(){
        spyManager.add([
          'updater'
          , 'getState'
          , 'dispatch'
        ]);
        stubs.add(processFn);
        stubs.return('UpdateAction')('returnValue', spyManager.get('updater'));
        stubs.return(urlFn.spy)('returnValue', 'some/api/call');
        stubs.return(readyData.spy)('returnValue', 'some data');

        spyManager.addReturn('getState')('returnValue', 'some state');
        spyManager.addReturn('updater')('returnValue', 'updating');
        UpdateMethod(data)(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      let calls = {
        getState: ()=>spyManager.get('getState')
        , dispatch: [()=>{
          return spyManager.get('dispatch');
        }, ()=>['updating']
        ]
        , UpdateAction: [()=>stubs.get('UpdateAction')
          , ()=>actions.concat([stubs.get(processFn)])
        ]
        , updater: [()=>{
          return spyManager.get('updater');
        }, ()=>['some/api/call', 'some data']
        ]
      };

      calls[urlFn.spy] = [()=>{
        return stubs.get(urlFn.spy);
      }, ()=>urlFn.attrs
      ];
      calls[readyData.spy] = [()=>{
        return stubs.get(readyData.spy);
      }, ()=>readyData.attrs
      ];

      checkMulti(calls);
    });
  };
};

// Destroy Tests
export const destroyDataActions = (title, stubs, DestroyMethod)=>{
  return (processFn, readyData, urlFn, actions, data)=>{
    readyData = CheckSpy(readyData);
    urlFn = CheckSpy(urlFn);

    describe(`Destroy ${title}`, function(){
      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(function(){
        spyManager.add([
          'destroyer'
          , 'getState'
          , 'dispatch'
        ]);
        stubs.add(processFn);
        stubs.return('DestroyAction')('returnValue', spyManager.get('destroyer'));
        stubs.return(urlFn.spy)('returnValue', 'some/api/call');
        stubs.return(readyData.spy)('callFake', ()=>data);

        spyManager.addReturn('getState')('returnValue', 'some state');
        spyManager.addReturn('destroyer')('returnValue', 'destroying');
        DestroyMethod(data)(spyManager.get('dispatch'), spyManager.get('getState'));
      });

      let calls = {
        getState: ()=>spyManager.get('getState')
        , dispatch: [()=>{
          return spyManager.get('dispatch');
        }, ()=>['destroying']
        ]
        , DestroyAction: [()=>stubs.get('DestroyAction')
          , ()=>actions.concat([stubs.get(processFn)])
        ]
        , destroyer: [()=>{
          return spyManager.get('destroyer');
        }, ()=>['some/api/call', data]
        ]
      };

      calls[urlFn.spy] = [()=>{
        let spy = stubs.get(urlFn.spy);
        return stubs.get(urlFn.spy);
      }, ()=>urlFn.attrs
      ];

      calls[readyData.spy] = [()=>{
        return stubs.get(readyData.spy);
      }, ()=>readyData.attrs
      ];

      checkMulti(calls);
    });
  };
};

// GetUrl tests
export const testGetUrl = (title, mod, stubs)=>{
  return (state_path, with_id = false)=>{
    describe(title, function(){
      let getUrl, data, state;

      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });

      beforeEach(()=>{
        getUrl = mod();
        spyManager.addReturn('create_url')('returnValue', 'my/api');
        data = {data_key: 'aaa'};

        state = {};
      });

      describe('If a fail', function(){
        let url;
        beforeEach(function(){
          stubs.return('CreateUrl')('returnValue', null);
          url = getUrl(null, data);
        });

        it('should return null', function(){
          expect(url).toBeNull();
        });

        let calls = {
          CreateUrl: [()=>{
            return stubs.get('CreateUrl');
          }, ()=>[null, state_path]
          ]
        };
        checkMulti(calls);
      });

      describe('If a success', function(){
        let attrs, url;
        beforeEach(function(){
          stubs.return('CreateUrl')('returnValue', spyManager.get('create_url'));
          url = getUrl(state, data);

          attrs = [data];
          if (with_id) attrs.push(1);
        });

        it('should return api url', function(){
          expect(url).toEqual('my/api');
        });

        let calls = {
          CreateUrl: [()=>{
            return stubs.get('CreateUrl');
          }, ()=>[state, state_path]
          ]
          , create_url: [()=>{
            return spyManager.get('create_url');
          }, ()=>attrs
          ]
        };
        checkMulti(calls);
      });
    });
  };
};

export const checkDefaultValues = (title, defaultValues, expected, state)=>{
  describe(`Should return the default value of ${title}`, ()=>{
    let default_value = defaultValues(state);

    _.forIn(default_value, (v, k)=>{
      it(`${k} should equal ${v}`, function() {
        expect(_.has(default_value, k)).toBeTruthy();
        expect(expected[k]).toEqual(default_value[k]);
      });
    });
  });
};

