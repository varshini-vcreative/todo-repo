const todo = require('./todo');
const fs = require('fs');
const path = require('path');

// Helper to reset todos.json for test isolation
function resetTodos(data = []) {
  fs.writeFileSync(path.join(__dirname, 'todos.json'), JSON.stringify(data, null, 2));
}

describe('To-Do List Functions', () => {
  beforeEach(() => resetTodos());

  test('addTask adds a new task', () => {
    todo.addTask('Test task');
    const tasks = todo.listTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].task).toBe('Test task');
    expect(tasks[0].done).toBe(false);
  });

  test('listTasks returns all tasks', () => {
    todo.addTask('Task 1');
    todo.addTask('Task 2');
    const tasks = todo.listTasks();
    expect(tasks.length).toBe(2);
    expect(tasks[1].task).toBe('Task 2');
  });

  test('markDone marks a task as done', () => {
    todo.addTask('Task');
    todo.markDone(0);
    const tasks = todo.listTasks();
    expect(tasks[0].done).toBe(true);
  });

  test('markUndone marks a task as undone', () => {
    todo.addTask('Task');
    todo.markDone(0);
    todo.markUndone(0);
    const tasks = todo.listTasks();
    expect(tasks[0].done).toBe(false);
  });

  test('editTask edits a task description', () => {
    todo.addTask('Old');
    todo.editTask(0, 'New');
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('New');
  });

  test('moveTask moves a task', () => {
    todo.addTask('A');
    todo.addTask('B');
    todo.moveTask(0, 1);
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('B');
    expect(tasks[1].task).toBe('A');
  });

  test('clearTasks removes all tasks', () => {
    todo.addTask('A');
    todo.clearTasks();
    const tasks = todo.listTasks();
    expect(tasks.length).toBe(0);
  });

  test('throws on invalid index for markDone', () => {
    expect(() => todo.markDone(5)).toThrow('Invalid index');
  });

  test('throws on invalid index for markUndone', () => {
    expect(() => todo.markUndone(5)).toThrow('Invalid index');
  });

  test('throws on invalid index for editTask', () => {
    expect(() => todo.editTask(5, 'desc')).toThrow('Invalid index');
  });

  test('throws on invalid index for moveTask', () => {
    expect(() => todo.moveTask(0, 1)).toThrow('Invalid index');
  });
});

describe('Edge and file operation cases', () => {
  const todosPath = path.join(__dirname, 'todos.json');
  beforeEach(() => resetTodos());

  test('loadTodos returns [] if file does not exist', () => {
    if (fs.existsSync(todosPath)) fs.unlinkSync(todosPath);
    expect(todo.loadTodos()).toEqual([]);
  });

  test('saveTodos writes to file', () => {
    todo.saveTodos([{ task: 'Direct', done: false }]);
    const data = JSON.parse(fs.readFileSync(todosPath, 'utf8'));
    expect(data[0].task).toBe('Direct');
  });

  test('addTask allows empty string', () => {
    todo.addTask('');
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('');
  });

  test('editTask allows empty string as description', () => {
    todo.addTask('something');
    todo.editTask(0, '');
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('');
  });

  test('moveTask with same index does not throw', () => {
    todo.addTask('A');
    todo.moveTask(0, 0);
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('A');
  });
});
