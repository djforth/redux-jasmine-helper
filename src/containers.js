
import _ from 'lodash';

import {
  check_multiple_calls as checkMulti
} from '@djforth/jasmine-call-helpers';

import {
  spies as SpyManager
} from '@djforth/stubs-spy-manager';
const spyManager = SpyManager();

export const testStateToProps = (mod, title='')=>{
  return (state, expectedData, calls, props)=>{
    describe(`${title} map state to props`, function(){
      let results, stateToProps;
      beforeEach(function(){
        props = (_.isFunction(props)) ? props() : props;

        stateToProps = mod();
        results = stateToProps(state, props);
      });

      _.forIn(expectedData, (v, k)=>{
        it(`should have ${k} to equal ${v}`, function(){
          expect(_.has(results, k)).toBeTruthy();
          expect(results[k]).toEqual(v);
        });
      });

      checkMulti(calls);
    });
  };
};

export const testDispatchToProps = (title, getMod,  stubs)=>{
  return (actions)=>{
    describe(`${title} map state to props`, function(){
      let dispatchToProps, dipatchers;
      afterEach(()=>{
        spyManager.removeAll();
      });

      describe('check actions are function', function(){
        actions.forEach((act)=>{
          it(`Action ${act.actionMethod || act.action} should be a function`, function(){
            let action = getMod(act.actionMethod || act.action);
            expect(_.isFunction(action)).toBeTruthy();
          });
        });
      });

      describe('check dispatches', function(){
        let calls = actions.reduce((prev, curr, i)=>{
          let action = curr.actionMethod || curr.action;
          if (_.has(curr.attributes)){
            let attrs = (_.isArray(curr.attributes)) ? curr.attributes : [curr.attributes];
            prev[curr.action] = [()=>stubs.get(action)
            , ()=>attrs
            ];
          } else {
            prev[curr.action] = ()=>stubs.get(action);
          }

          prev[`dispatch${i}`] = [()=>spyManager.get('dispatch')
          , ()=>[`${action}-value`], i
          ];

          return prev;
        }, {});

        beforeEach(function(){
          spyManager.add('dispatch');

          dispatchToProps = getMod('mapDispatchToProps');
          dipatchers = dispatchToProps(spyManager.get('dispatch'));
          actions.forEach((act)=>{
            let action = act.actionMethod || act.action;
            let attrs = (_.isArray(act.attributes)) ? act.attributes : [act.attributes];
            stubs.return(action)('returnValue', `${action}-value`);
            dipatchers[act.action].apply(this, attrs);
          });
        });

        checkMulti(calls);
      });
    });
  };
};

export const FormStubs = (item)=>{
  return [
    {
      stub: {
        title: 'DataHelper'
        , callback: item
      }
    }
    , {
      stub: {
        title: 'Selected'
        , callback: (c, type)=>type
        , returnType: 'callFake'
      }
    }
    , {
      stub: {
        title: 'SelectedValue'
        , callback: false
      }
    }
    , {
      stub: {
        title: 'CreateOpts'
        , callback: (opts)=>opts
        , returnType: 'callFake'
      }
    }
    , {
      stub: {
        title: 'CreateCheckbox'
        , callback: (id)=>id
        , returnType: 'callFake'
      }
    }
    , {
      stub: {
        title: 'CreateTitle'
        , callback: 'Title'
      }
    }
    , {
      stub: {
        title: 'GetAssociatedItem'
        , spy: {
          title: 'selected_item'
          , callback: (items, name)=>name
          , returnType: 'callFake'
        }
      }
    }
    , {
      stub: {
        title: 'InsertPosition'
        , callback: {draft_key: 'aaa', position: 222}
      }
    }
  ];
};
