import { filtersSlice, setStatus, setPriority, setCategory, setDeadlinePreset, setSortBy, setSearchQuery, resetFilters } from '../src/store/slices/filtersSlice';

const reducer = filtersSlice.reducer;

const defaultState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  deadlinePreset: 'all',
  sortBy: 'deadline',
  searchQuery: '',
};

describe('filtersSlice', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(defaultState);
  });

  describe('setStatus', () => {
    it('should set status to completed', () => {
      const state = reducer(undefined, setStatus('completed'));
      expect(state.status).toBe('completed');
    });

    it('should set status to uncompleted', () => {
      const state = reducer(undefined, setStatus('uncompleted'));
      expect(state.status).toBe('uncompleted');
    });

    it('should set status back to all', () => {
      const preloaded = reducer(undefined, setStatus('completed'));
      const state = reducer(preloaded, setStatus('all'));
      expect(state.status).toBe('all');
    });
  });

  describe('setPriority', () => {
    it('should set priority to high', () => {
      const state = reducer(undefined, setPriority('high'));
      expect(state.priority).toBe('high');
    });

    it('should set priority to low', () => {
      const state = reducer(undefined, setPriority('low'));
      expect(state.priority).toBe('low');
    });
  });

  describe('setCategory', () => {
    it('should set category to a custom value', () => {
      const state = reducer(undefined, setCategory('work'));
      expect(state.category).toBe('work');
    });

    it('should set category back to all', () => {
      const preloaded = reducer(undefined, setCategory('work'));
      const state = reducer(preloaded, setCategory('all'));
      expect(state.category).toBe('all');
    });
  });

  describe('setDeadlinePreset', () => {
    it('should set deadlinePreset', () => {
      const state = reducer(undefined, setDeadlinePreset('today'));
      expect(state.deadlinePreset).toBe('today');
    });
  });

  describe('setSortBy', () => {
    it('should set sortBy to priority', () => {
      const state = reducer(undefined, setSortBy('priority'));
      expect(state.sortBy).toBe('priority');
    });

    it('should set sortBy to status', () => {
      const state = reducer(undefined, setSortBy('status'));
      expect(state.sortBy).toBe('status');
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      const state = reducer(undefined, setSearchQuery('buy milk'));
      expect(state.searchQuery).toBe('buy milk');
    });

    it('should set empty search query', () => {
      const preloaded = reducer(undefined, setSearchQuery('buy milk'));
      const state = reducer(preloaded, setSearchQuery(''));
      expect(state.searchQuery).toBe('');
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to defaults', () => {
      let state = reducer(undefined, setStatus('completed'));
      state = reducer(state, setPriority('high'));
      state = reducer(state, setCategory('work'));
      state = reducer(state, setSearchQuery('some query'));
      state = reducer(state, setSortBy('status'));
      state = reducer(state, resetFilters());
      expect(state).toEqual(defaultState);
    });
  });
});
