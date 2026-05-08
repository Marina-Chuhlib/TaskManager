
import { appSlice ,setOnline} from '../src/store/slices/appSlice';
import { categoriesSlice, setCustomCategories, addCustomCategory } from '../src/store/slices/categoriesSlice';

// ─── appSlice ───────────────────────────────────────────────────────────────

const appReducer = appSlice.reducer;

describe('appSlice', () => {
  it('should return initial state with online: true', () => {
    expect(appReducer(undefined, { type: '' })).toEqual({ online: true });
  });

  it('should set online to false', () => {
    const state = appReducer(undefined, setOnline(false));
    expect(state.online).toBe(false);
  });

  it('should set online back to true', () => {
    const preloaded = appReducer(undefined, setOnline(false));
    const state = appReducer(preloaded, setOnline(true));
    expect(state.online).toBe(true);
  });
});

// ─── categoriesSlice ────────────────────────────────────────────────────────

const categoriesReducer = categoriesSlice.reducer;

describe('categoriesSlice', () => {
  it('should return initial state with empty custom categories', () => {
    expect(categoriesReducer(undefined, { type: '' })).toEqual({ custom: [] });
  });

  describe('setCustomCategories', () => {
    it('should replace custom categories', () => {
      const state = categoriesReducer(undefined, setCustomCategories(['work', 'personal']));
      expect(state.custom).toEqual(['work', 'personal']);
    });

    it('should clear categories when empty array provided', () => {
      const preloaded = categoriesReducer(undefined, setCustomCategories(['work']));
      const state = categoriesReducer(preloaded, setCustomCategories([]));
      expect(state.custom).toHaveLength(0);
    });
  });

  describe('addCustomCategory', () => {
    it('should add a new category', () => {
      const state = categoriesReducer(undefined, addCustomCategory('health'));
      expect(state.custom).toContain('health');
    });

    it('should not add duplicate category', () => {
      let state = categoriesReducer(undefined, addCustomCategory('work'));
      state = categoriesReducer(state, addCustomCategory('work'));
      expect(state.custom.filter(c => c === 'work')).toHaveLength(1);
    });

    it('should trim whitespace before adding', () => {
      const state = categoriesReducer(undefined, addCustomCategory('  health  '));
      expect(state.custom).toContain('health');
    });

    it('should not add empty or whitespace-only string', () => {
      let state = categoriesReducer(undefined, addCustomCategory(''));
      expect(state.custom).toHaveLength(0);
      state = categoriesReducer(undefined, addCustomCategory('   '));
      expect(state.custom).toHaveLength(0);
    });
  });
});
