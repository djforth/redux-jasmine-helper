/* eslint-env jasmine, browser */
import _ from 'lodash';

import {
  check_multiple_calls as checkMulti
} from '@djforth/jasmine-call-helpers';

import {
  spies as SpyManager
} from '@djforth/stubs-spy-manager';
const spyManager = SpyManager();

function SetStubs(stubs, reducer, returnValue){
  stubs.return(reducer)('returnValue', returnValue || reducer);
  return stubs.get(reducer);
}

// function SetSpy(sm, spy){
//   sm.add(spy);
//   sm.addReturn(spy)('returnValue', spy);
// }

function checkReducer(data, rtn){
  describe('Reducer check', function(){
    let spy, state;
    beforeEach(function(){
      [spy, state] = data();
    });

    it('should call the reducer', function(){
      expect(spy).toHaveBeenCalled();
    });

    it('should return reducer value', function(){
      expect(state).toEqual(rtn);
    });
  });
}

function getMessage(arg){
  let msg = 'should have correct argument';
  if (!_.isFunction(arg)){
    msg += `of ${arg}`;
  }

  return msg;
}

function checkArgs(data, exp, call = 0){
  describe('check arguments', function(){
    let spy;
    beforeEach(function(){
      spy = data();
    });

    it('should have the correct number of argument', function(){
      let count = spy.calls.argsFor(call).length;
      expect(count).toEqual(exp.length);
    });

    exp.forEach((arg)=>{
      it(getMessage(arg), function(){
        if (_.isFunction(arg)){
          arg = arg();
        }
        expect(spy.calls.argsFor(call)).toContain(arg);
      });
    });
  });
}

export const testDefaults = (setDefaults, expected_defaults)=>{
  describe('setDefaults', function(){
    let defaults;
    beforeEach(function(){
      let set_defaults = setDefaults();
      defaults = set_defaults();
    });

    _.forIn(expected_defaults, (value, key)=>{
      it(`It should have ${key} that equals ${value}`, function(){
        expect(_.has(defaults, key)).toBeTruthy();
        expect(defaults[key]).toEqual(value);
      });
    });
  });
};

export const simpleReducerTest = (method, get_reducer)=>{
  return (attrs = [], exp_args = [])=>{
    describe(`${method} changes state`, function(){
      let new_state, update_state, reducer;
      beforeEach(function(){
        reducer = get_reducer();
        spyManager.add('update_state');
        spyManager.addReturn('update_state')('returnValue', 'new_state');
        update_state = spyManager.get('update_state');
        let args = [update_state].concat(attrs);
        new_state = reducer.apply(this, args);
      });

      afterEach(()=>{
        spyManager.removeAll();
      });

      let calls = {
        update_state: [()=>update_state
        , ()=>exp_args
        ]
      };

      checkMulti(calls);
    });
  };
};

export const rootReducer = (stubs, mainReducer)=>{
  return (reducer, action, exp, call = 0, state = null)=>{
    describe(`${reducer} called on ${action.type}`, function(){
      let fn, newState;
      afterEach(()=>{
        stubs.revertAll(); // Reverts All stubs
      });
      beforeEach(function(){
        fn = SetStubs(stubs, reducer);
        newState = mainReducer(state, action);
      });

      checkReducer(()=>[fn, newState], reducer);
      checkArgs(()=>fn, exp, call);
    });
  };
};

export const rootReducerWithReturn = (stubs, mainReducer)=>{
  return (reducer, action, exp, spy_args)=>{
    describe(`${reducer} called on ${action.type}`, function(){
      let fn, newState;
      afterEach(()=>{
        spyManager.removeAll();
        stubs.revertAll(); // Reverts All stubs
      });
      beforeEach(function(){
        spyManager.addReturn(`${reducer}_spy`)('returnValue', `${reducer}_spy`);
        fn = SetStubs(stubs, reducer, spyManager.get(`${reducer}_spy`));
        newState = mainReducer(null, action);
      });

      checkReducer(()=>[fn, `${reducer}_spy`], `${reducer}_spy`);
      checkArgs(()=>fn, exp);

      describe('return function', function(){
        checkReducer(()=>[spyManager.get(`${reducer}_spy`), newState], `${reducer}_spy`);
        checkArgs(()=>spyManager.get(`${reducer}_spy`), spy_args);
      });
    });
  };
};
