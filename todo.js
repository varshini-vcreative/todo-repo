const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'todos.json');

function loadTodos() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveTodos(todos) {
    fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

function addTask(desc) {
    const todos = loadTodos();
    todos.push({ task: desc, done: false });
    saveTodos(todos);
    return todos;
}

function listTasks() {
    return loadTodos();
}

function markDone(idx) {
    const todos = loadTodos();
    if (idx < 0 || idx >= todos.length) throw new Error('Invalid index');
    todos[idx].done = true;
    saveTodos(todos);
    return todos;
}

function markUndone(idx) {
    const todos = loadTodos();
    if (idx < 0 || idx >= todos.length) throw new Error('Invalid index');
    todos[idx].done = false;
    saveTodos(todos);
    return todos;
}

function editTask(idx, desc) {
    const todos = loadTodos();
    if (idx < 0 || idx >= todos.length) throw new Error('Invalid index');
    todos[idx].task = desc;
    saveTodos(todos);
    return todos;
}

function moveTask(fromIdx, toIdx) {
    const todos = loadTodos();
    if (fromIdx < 0 || fromIdx >= todos.length || toIdx < 0 || toIdx >= todos.length) throw new Error('Invalid index');
    const [moved] = todos.splice(fromIdx, 1);
    todos.splice(toIdx, 0, moved);
    saveTodos(todos);
    return todos;
}

function clearTasks() {
    saveTodos([]);
    return [];
}

module.exports = {
    loadTodos,
    saveTodos,
    addTask,
    listTasks,
    markDone,
    markUndone,
    editTask,
    moveTask,
    clearTasks
};
