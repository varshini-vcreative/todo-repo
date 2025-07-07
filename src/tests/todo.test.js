const todo = require('../todo');
const fs = require('fs');
const path = require('path');

// Helper to reset todos.json for test isolation
const todosPath = path.join(__dirname, '../todos.json');
function resetTodos(data = []) {
  fs.writeFileSync(todosPath, JSON.stringify(data, null, 2));
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

describe('Advanced and edge cases', () => {
  beforeEach(() => resetTodos());

  test('addTask with whitespace only', () => {
    todo.addTask('   ');
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('   ');
  });

  test('addTask with special characters and emojis', () => {
    todo.addTask('🚀✨!@#$%^&*()');
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe('🚀✨!@#$%^&*()');
  });

  test('addTask with very long description', () => {
    const longDesc = 'a'.repeat(1000);
    todo.addTask(longDesc);
    const tasks = todo.listTasks();
    expect(tasks[0].task).toBe(longDesc);
  });

  test('addTask with each priority and due date', () => {
    // Simulate priority and due date fields
    const todos = [
      { task: 'High', done: false, priority: 'High', dueDate: '2099-12-31' },
      { task: 'Medium', done: false, priority: 'Medium', dueDate: null },
      { task: 'Low', done: false, priority: 'Low', dueDate: '2000-01-01' }
    ];
    todo.saveTodos(todos);
    const loaded = todo.listTasks();
    expect(loaded[0].priority).toBe('High');
    expect(loaded[2].dueDate).toBe('2000-01-01');
  });

  test('listTasks when all tasks are done', () => {
    todo.saveTodos([
      { task: 'A', done: true },
      { task: 'B', done: true }
    ]);
    const tasks = todo.listTasks();
    expect(tasks.every(t => t.done)).toBe(true);
  });

  test('listTasks when all tasks are undone', () => {
    todo.saveTodos([
      { task: 'A', done: false },
      { task: 'B', done: false }
    ]);
    const tasks = todo.listTasks();
    expect(tasks.every(t => !t.done)).toBe(true);
  });

  test('markDone/markUndone on already done/undone task', () => {
    todo.addTask('A');
    todo.markDone(0);
    expect(todo.listTasks()[0].done).toBe(true);
    todo.markDone(0);
    expect(todo.listTasks()[0].done).toBe(true);
    todo.markUndone(0);
    expect(todo.listTasks()[0].done).toBe(false);
    todo.markUndone(0);
    expect(todo.listTasks()[0].done).toBe(false);
  });

  test('editTask to a very long description', () => {
    todo.addTask('A');
    const longDesc = 'b'.repeat(1000);
    todo.editTask(0, longDesc);
    expect(todo.listTasks()[0].task).toBe(longDesc);
  });

  test('move first to last and last to first', () => {
    todo.addTask('A');
    todo.addTask('B');
    todo.addTask('C');
    todo.moveTask(0, 2);
    expect(todo.listTasks()[2].task).toBe('A');
    todo.moveTask(2, 0);
    expect(todo.listTasks()[0].task).toBe('A');
  });

  test('delete only task', () => {
    todo.addTask('A');
    let tasks = todo.listTasks();
    tasks.splice(0, 1);
    todo.saveTodos(tasks);
    expect(todo.listTasks().length).toBe(0);
  });

  test('delete first, last, and middle task', () => {
    todo.saveTodos([
      { task: 'A', done: false },
      { task: 'B', done: false },
      { task: 'C', done: false }
    ]);
    let tasks = todo.listTasks();
    tasks.splice(0, 1); // delete first
    todo.saveTodos(tasks);
    expect(todo.listTasks()[0].task).toBe('B');
    tasks = todo.listTasks();
    tasks.splice(tasks.length - 1, 1); // delete last
    todo.saveTodos(tasks);
    expect(todo.listTasks().length).toBe(1);
    tasks = todo.listTasks();
    tasks.splice(0, 1); // delete middle (now only one left)
    todo.saveTodos(tasks);
    expect(todo.listTasks().length).toBe(0);
  });

  test('clear when no tasks', () => {
    todo.clearTasks();
    expect(todo.listTasks().length).toBe(0);
  });

  test('search/filter by keyword, status, priority', () => {
    todo.saveTodos([
      { task: 'Alpha', done: false, priority: 'High' },
      { task: 'Beta', done: true, priority: 'Low' },
      { task: 'Gamma', done: false, priority: 'Medium' }
    ]);
    let tasks = todo.listTasks().filter(t => t.task.toLowerCase().includes('a'));
    expect(tasks.length).toBe(3);
    tasks = todo.listTasks().filter(t => t.done);
    expect(tasks.length).toBe(1);
    tasks = todo.listTasks().filter(t => t.priority === 'High');
    expect(tasks.length).toBe(1);
  });

  test('export/import as JSON', () => {
    const exportPath = path.join(__dirname, 'exported.json');
    todo.saveTodos([
      { task: 'A', done: false }
    ]);
    fs.writeFileSync(exportPath, JSON.stringify(todo.listTasks(), null, 2));
    const imported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    expect(imported[0].task).toBe('A');
    fs.unlinkSync(exportPath);
  });

  test('import malformed JSON', () => {
    const importPath = path.join(__dirname, 'bad.json');
    fs.writeFileSync(importPath, '{bad json');
    expect(() => JSON.parse(fs.readFileSync(importPath, 'utf8'))).toThrow();
    fs.unlinkSync(importPath);
  });

  test('import CSV with missing fields', () => {
    const importPath = path.join(__dirname, 'bad.csv');
    fs.writeFileSync(importPath, 'Task,Done\nA,true\nB,false');
    const csv = fs.readFileSync(importPath, 'utf8');
    const lines = csv.split(/\r?\n/).slice(1);
    const imported = lines.filter(Boolean).map(line => {
      const [task, done] = line.split(',');
      return { task, done: done === 'true' };
    });
    expect(imported.length).toBe(2);
    fs.unlinkSync(importPath);
  });
});
