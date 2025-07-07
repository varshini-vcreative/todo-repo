/**
 * To-Do List Data Operations
 * Handles loading, saving, and manipulating tasks in todos.json
 */
const fs = require('fs');
const path = require('path');

// Path to the todos.json file
const FILE = path.join(__dirname, 'todos.json');

/**
 * Load all tasks from the JSON file.
 * @returns {Array} Array of task objects
 */
function loadTodos() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

/**
 * Save all tasks to the JSON file.
 * @param {Array} todos - Array of task objects
 */
function saveTodos(todos) {
    fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

/**
 * Add a new task.
 * @param {string} desc - Task description
 * @returns {Array} Updated array of tasks
 */
function addTask(desc) {
    const todos = loadTodos();
    todos.push({ task: desc, done: false });
    saveTodos(todos);
    return todos;
}

/**
 * List all tasks.
 * @returns {Array} Array of task objects
 */
function listTasks() {
    return loadTodos();
}

/**
 * Mark a task as done.
 * @param {number} idx - Task index
 * @returns {Array} Updated array of tasks
 */
function markDone(idx) {
    const todos = loadTodos();
    if (idx < 0 || idx >= todos.length) throw new Error('Invalid index');
    todos[idx].done = true;
    saveTodos(todos);
    return todos;
}

/**
 * Mark a task as undone.
 * @param {number} idx - Task index
 * @returns {Array} Updated array of tasks
 */
function markUndone(idx) {
    const todos = loadTodos();
    if (idx < 0 || idx >= todos.length) throw new Error('Invalid index');
    todos[idx].done = false;
    saveTodos(todos);
    return todos;
}

/**
 * Edit a task's description.
 * @param {number} idx - Task index
 * @param {string} desc - New description
 * @returns {Array} Updated array of tasks
 */
function editTask(idx, desc) {
    const todos = loadTodos();
    if (idx < 0 || idx >= todos.length) throw new Error('Invalid index');
    todos[idx].task = desc;
    saveTodos(todos);
    return todos;
}

/**
 * Move a task from one position to another.
 * @param {number} fromIdx - Source index
 * @param {number} toIdx - Destination index
 * @returns {Array} Updated array of tasks
 */
function moveTask(fromIdx, toIdx) {
    const todos = loadTodos();
    if (fromIdx < 0 || fromIdx >= todos.length || toIdx < 0 || toIdx >= todos.length) throw new Error('Invalid index');
    const [moved] = todos.splice(fromIdx, 1);
    todos.splice(toIdx, 0, moved);
    saveTodos(todos);
    return todos;
}

/**
 * Clear all tasks.
 * @returns {Array} Empty array
 */
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
