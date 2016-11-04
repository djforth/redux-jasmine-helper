import {
  check_multiple_calls as checkMulti
} from '@djforth/jasmine-call-helpers';

import {
  helper as StubsSpyHelper
} from '@djforth/stubs-spy-manager';

let stub_helper = (type)=>(state, action)=>{
  if (action.type === type) return type;
  return false;
};

let MakesCalls = (stubs)=>(state, action, current, fn)=>{
  let calls = fn.reduce((prev, curr)=>{
    let call = {};
    call[curr] = [()=>stubs.get(curr)
      , ()=>[state, action]
    ];
    return Object.assign(prev, call);
  }, {});

  return Object.assign({
    setDefaults: [()=>stubs.get('setDefaults')
      , ()=>[current]
    ]
  }, calls);
};

export default (title, stubs, spyManager)=>(reducer, default_state)=>{
  let stubs_spies = StubsSpyHelper(stubs, spyManager);

  let make_calls = MakesCalls(stubs);

  describe(`${title} reducer`, function() {
    beforeEach(function(){
      stubs_spies([
        {
          stub: 'updateState'
          , spy:  'update_state'
        }
        , {
          spy:  'update_state'
          , callback: 'new-state'
        }
        , {
          stub: 'setDefaults'
          , callback: (state)=>{
            return Object.assign({}, default_state, state);
          }
        }
        , {
          stub: 'fetcher'
          , callback: stub_helper('FETCH')
        }
        , {
          stub: 'creator'
          , callback: stub_helper('CREATE')

        }
        , {
          stub: 'destroyer'
          , callback: stub_helper('DESTROY')

        }
        , {
          stub:  'updater'
          , callback: stub_helper('UPDATE')
        }
        , {
          stub: 'modal'
          , callback: stub_helper('MODAL')
        }
      ]);
    });

    describe('when nothing matches', function(){
      let state;
      beforeEach(function(){
        state = reducer({}, {type: 'FOO'});
      });

      let calls = make_calls(
        default_state
        , {type: 'FOO'}
        , {}
        , ['fetcher', 'creator', 'destroyer', 'updater', 'modal']);

      checkMulti(calls);

      it('should return default state', function(){
        expect(state).toEqual(default_state);
      });
    });

    describe('when fetch matches', function(){
      let state;
      beforeEach(function(){
        state = reducer({}, {type: 'FETCH'});
      });

      let calls = make_calls(
        default_state
        , {type: 'FETCH'}
        , {}
        , ['fetcher']);

      checkMulti(calls);

      it('should return FETCH', function(){
        expect(state).toEqual('FETCH');
      });
    });

    describe('when create matches', function(){
      let state;
      beforeEach(function(){
        state = reducer({}, {type: 'CREATE'});
      });

      let calls = make_calls(
        default_state
        , {type: 'CREATE'}
        , {}
        , ['fetcher', 'creator']);

      checkMulti(calls);

      it('should return CREATE', function(){
        expect(state).toEqual('CREATE');
      });
    });

    describe('when destroy matches', function(){
      let state;
      beforeEach(function(){
        state = reducer({}, {type: 'DESTROY'});
      });

      let calls = make_calls(
        default_state
        , {type: 'DESTROY'}
        , {}
        , ['fetcher', 'creator', 'destroyer']);

      checkMulti(calls);

      it('should return DESTROY', function(){
        expect(state).toEqual('DESTROY');
      });
    });

    describe('when update matches', function(){
      let state;
      beforeEach(function(){
        state = reducer({}, {type: 'UPDATE'});
      });

      let calls = make_calls(
        default_state
        , {type: 'UPDATE'}
        , {}
        , ['fetcher', 'creator', 'destroyer', 'updater']);

      checkMulti(calls);

      it('should return UPDATE', function(){
        expect(state).toEqual('UPDATE');
      });
    });

    describe('when modal matches', function(){
      let state;
      beforeEach(function(){
        state = reducer({}, {type: 'MODAL'});
      });

      let calls = make_calls(
        default_state
        , {type: 'MODAL'}
        , {}
        , ['fetcher', 'creator', 'destroyer', 'updater', 'modal']);

      checkMulti(calls);

      it('should return MODAL', function(){
        expect(state).toEqual('MODAL');
      });
    });
  });
};