import { tasksSlice, setTasks, addTask, updateTask, deleteTask } from '../src//store/slices/tasksSlice';
import { Task } from '../src/entities/task/types';

const reducer = tasksSlice.reducer;

const mockTask: Task = {
  id: '1',
  title: 'Buy groceries',
  completed: false,
  priority: 'medium',
  category: 'personal',
  deadline: '2026-06-01',
};

const mockTask2: Task = {
  id: '2',
  title: 'Fix bug',
  completed: true,
  priority: 'high',
  category: 'work',
  deadline: '2026-05-20',
};

describe('tasksSlice', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({ tasks: [] });
  });

  describe('setTasks', () => {
    it('should replace tasks with provided array', () => {
      const state = reducer(undefined, setTasks([mockTask, mockTask2]));
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks[0].id).toBe('1');
    });

    it('should clear tasks when empty array provided', () => {
      const preloaded = reducer(undefined, setTasks([mockTask]));
      const state = reducer(preloaded, setTasks([]));
      expect(state.tasks).toHaveLength(0);
    });
  });

  describe('addTask', () => {
    it('should add a task to empty list', () => {
      const state = reducer(undefined, addTask(mockTask));
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0]).toEqual(mockTask);
    });

    it('should append task to existing list', () => {
      const preloaded = reducer(undefined, setTasks([mockTask]));
      const state = reducer(preloaded, addTask(mockTask2));
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks[1].id).toBe('2');
    });
  });

  describe('updateTask', () => {
    it('should update existing task by id', () => {
      const preloaded = reducer(undefined, setTasks([mockTask]));
      const updated = { ...mockTask, title: 'Updated title', completed: true };
      const state = reducer(preloaded, updateTask(updated));
      expect(state.tasks[0].title).toBe('Updated title');
      expect(state.tasks[0].completed).toBe(true);
    });

    it('should not change tasks if id not found', () => {
      const preloaded = reducer(undefined, setTasks([mockTask]));
      const ghost = { ...mockTask2, id: '999' };
      const state = reducer(preloaded, updateTask(ghost));
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('1');
    });
  });

  describe('deleteTask', () => {
    it('should remove task by id', () => {
      const preloaded = reducer(undefined, setTasks([mockTask, mockTask2]));
      const state = reducer(preloaded, deleteTask('1'));
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('2');
    });

    it('should not change tasks if id not found', () => {
      const preloaded = reducer(undefined, setTasks([mockTask]));
      const state = reducer(preloaded, deleteTask('999'));
      expect(state.tasks).toHaveLength(1);
    });

    it('should handle deleting from empty list', () => {
      const state = reducer(undefined, deleteTask('1'));
      expect(state.tasks).toHaveLength(0);
    });
  });
});
