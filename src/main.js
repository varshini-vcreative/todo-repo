// Simple CLI To-Do List in Node.js
// Usage: node main.js

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

const FILE = path.join(__dirname, 'todos.json');
let undoStack = [];
let redoStack = [];

function loadTodos() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveTodos(todos) {
    fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

function pushUndo(todos) {
    undoStack.push(JSON.stringify(todos));
    if (undoStack.length > 20) undoStack.shift();
    redoStack = [];
}

function printTasks(todos) {
    if (todos.length === 0) {
        console.log(chalk.yellow('No tasks found.'));
    } else {
        todos.forEach((t, i) => {
            let status = t.done ? chalk.green('[x]') : chalk.red('[ ]');
            let prio = t.priority ? chalk.bold({High: chalk.red, Medium: chalk.yellow, Low: chalk.green}[t.priority](t.priority[0])) : '';
            let due = t.dueDate ? (new Date(t.dueDate) < new Date() && !t.done ? chalk.bgRed('OVERDUE') : chalk.cyan(t.dueDate)) : '';
            console.log(`${i + 1}. ${status} ${chalk.bold(t.task)} ${prio ? '[' + prio + ']' : ''} ${due ? '[' + due + ']' : ''}`);
        });
    }
}

async function mainMenu() {
    let todos = loadTodos();
    const choices = [
        { name: 'Add a new task', value: 'add' },
        { name: 'List all tasks', value: 'list' },
        { name: 'Mark task as done', value: 'done' },
        { name: 'Mark task as undone', value: 'undone' },
        { name: 'Edit a task', value: 'edit' },
        { name: 'Move a task', value: 'move' },
        { name: 'Delete a task', value: 'delete' },
        { name: 'Clear all tasks', value: 'clear' },
        { name: 'Search/filter tasks', value: 'search' },
        { name: 'Export tasks', value: 'export' },
        { name: 'Import tasks', value: 'import' },
        { name: 'Undo', value: 'undo' },
        { name: 'Redo', value: 'redo' },
        { name: 'Help', value: 'help' },
        { name: 'Quit', value: 'quit' }
    ];
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Choose an action:',
        choices
    });
    todos = loadTodos();
    switch (action) {
        case 'add':
            const { desc, priority, dueDate } = await inquirer.prompt([
                { type: 'input', name: 'desc', message: 'Task description:' },
                { type: 'list', name: 'priority', message: 'Priority:', choices: ['High', 'Medium', 'Low'], default: 'Medium' },
                { type: 'input', name: 'dueDate', message: 'Due date (YYYY-MM-DD, optional):', validate: d => !d || !isNaN(Date.parse(d)) || 'Invalid date' }
            ]);
            pushUndo(todos);
            todos.push({ task: desc, done: false, priority, dueDate: dueDate || null });
            saveTodos(todos);
            console.log(chalk.green('Task added.'));
            break;
        case 'list':
            printTasks(todos);
            // Progress bar
            const doneCount = todos.filter(t => t.done).length;
            const percent = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
            console.log(chalk.blue(`Progress: ${doneCount}/${todos.length} completed (${percent}%)`));
            break;
        case 'done':
            if (todos.length === 0) break;
            const { doneIdx } = await inquirer.prompt({
                type: 'list',
                name: 'doneIdx',
                message: 'Select task to mark as done:',
                choices: todos.map((t, i) => ({ name: t.task, value: i }))
            });
            pushUndo(todos);
            todos[doneIdx].done = true;
            saveTodos(todos);
            console.log(chalk.green('Task marked as done.'));
            break;
        case 'undone':
            if (todos.length === 0) break;
            const { undoneIdx } = await inquirer.prompt({
                type: 'list',
                name: 'undoneIdx',
                message: 'Select task to mark as undone:',
                choices: todos.map((t, i) => ({ name: t.task, value: i }))
            });
            pushUndo(todos);
            todos[undoneIdx].done = false;
            saveTodos(todos);
            console.log(chalk.yellow('Task marked as undone.'));
            break;
        case 'edit':
            if (todos.length === 0) break;
            const { editIdx } = await inquirer.prompt({
                type: 'list',
                name: 'editIdx',
                message: 'Select task to edit:',
                choices: todos.map((t, i) => ({ name: t.task, value: i }))
            });
            const { newDesc, newPriority, newDueDate } = await inquirer.prompt([
                { type: 'input', name: 'newDesc', message: 'New description:', default: todos[editIdx].task },
                { type: 'list', name: 'newPriority', message: 'Priority:', choices: ['High', 'Medium', 'Low'], default: todos[editIdx].priority || 'Medium' },
                { type: 'input', name: 'newDueDate', message: 'Due date (YYYY-MM-DD, optional):', default: todos[editIdx].dueDate || '', validate: d => !d || !isNaN(Date.parse(d)) || 'Invalid date' }
            ]);
            pushUndo(todos);
            todos[editIdx] = { ...todos[editIdx], task: newDesc, priority: newPriority, dueDate: newDueDate || null };
            saveTodos(todos);
            console.log(chalk.green('Task updated.'));
            break;
        case 'move':
            if (todos.length < 2) break;
            const { fromIdx } = await inquirer.prompt({
                type: 'list',
                name: 'fromIdx',
                message: 'Move from:',
                choices: todos.map((t, i) => ({ name: t.task, value: i }))
            });
            const { toIdx } = await inquirer.prompt({
                type: 'list',
                name: 'toIdx',
                message: 'Move to:',
                choices: todos.map((t, i) => ({ name: t.task, value: i }))
            });
            pushUndo(todos);
            const [moved] = todos.splice(fromIdx, 1);
            todos.splice(toIdx, 0, moved);
            saveTodos(todos);
            console.log(chalk.green('Task moved.'));
            break;
        case 'delete':
            if (todos.length === 0) break;
            const { delIdx } = await inquirer.prompt({
                type: 'list',
                name: 'delIdx',
                message: 'Select task to delete:',
                choices: todos.map((t, i) => ({ name: t.task, value: i }))
            });
            const { confirmDel } = await inquirer.prompt({
                type: 'confirm',
                name: 'confirmDel',
                message: `Are you sure you want to delete: "${todos[delIdx].task}"?`
            });
            if (confirmDel) {
                pushUndo(todos);
                todos.splice(delIdx, 1);
                saveTodos(todos);
                console.log(chalk.red('Task deleted.'));
            }
            break;
        case 'clear':
            const { confirmClear } = await inquirer.prompt({ type: 'confirm', name: 'confirmClear', message: 'Are you sure you want to clear all tasks?' });
            if (confirmClear) {
                pushUndo(todos);
                saveTodos([]);
                console.log(chalk.red('All tasks cleared.'));
            }
            break;
        case 'search':
            const { searchTerm, filterStatus, filterPriority } = await inquirer.prompt([
                { type: 'input', name: 'searchTerm', message: 'Search keyword (leave blank for all):' },
                { type: 'list', name: 'filterStatus', message: 'Filter by status:', choices: ['All', 'Done', 'Undone'], default: 'All' },
                { type: 'list', name: 'filterPriority', message: 'Filter by priority:', choices: ['All', 'High', 'Medium', 'Low'], default: 'All' }
            ]);
            let filtered = todos;
            if (searchTerm) filtered = filtered.filter(t => t.task.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filterStatus !== 'All') filtered = filtered.filter(t => (filterStatus === 'Done' ? t.done : !t.done));
            if (filterPriority !== 'All') filtered = filtered.filter(t => t.priority === filterPriority);
            printTasks(filtered);
            break;
        case 'export':
            const { exportType, exportPath } = await inquirer.prompt([
                { type: 'list', name: 'exportType', message: 'Export as:', choices: ['JSON', 'CSV'] },
                { type: 'input', name: 'exportPath', message: 'Export file path:', default: 'exported_tasks' }
            ]);
            if (exportType === 'JSON') {
                fs.writeFileSync(exportPath + '.json', JSON.stringify(todos, null, 2));
                console.log(chalk.green('Tasks exported as JSON.'));
            } else {
                const csv = ['Task,Done,Priority,DueDate'].concat(
                    todos.map(t => `"${t.task.replace(/"/g, '""')}",${t.done},${t.priority || ''},${t.dueDate || ''}`)
                ).join('\n');
                fs.writeFileSync(exportPath + '.csv', csv);
                console.log(chalk.green('Tasks exported as CSV.'));
            }
            break;
        case 'import':
            const { importPath } = await inquirer.prompt({ type: 'input', name: 'importPath', message: 'Import file path:' });
            if (importPath.endsWith('.json')) {
                const imported = JSON.parse(fs.readFileSync(importPath, 'utf8'));
                pushUndo(todos);
                saveTodos(imported);
                console.log(chalk.green('Tasks imported from JSON.'));
            } else if (importPath.endsWith('.csv')) {
                const csv = fs.readFileSync(importPath, 'utf8');
                const lines = csv.split(/\r?\n/).slice(1);
                const imported = lines.filter(Boolean).map(line => {
                    const [task, done, priority, dueDate] = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, ''));
                    return { task, done: done === 'true', priority, dueDate: dueDate || null };
                });
                pushUndo(todos);
                saveTodos(imported);
                console.log(chalk.green('Tasks imported from CSV.'));
            } else {
                console.log(chalk.red('Unsupported file type. Use .json or .csv.'));
            }
            break;
        case 'help':
            console.log(chalk.bold('\nHelp - Available Commands:'));
            choices.forEach(c => console.log(`- ${c.name}`));
            break;
        case 'undo':
            if (undoStack.length === 0) {
                console.log(chalk.yellow('Nothing to undo.'));
                break;
            }
            redoStack.push(JSON.stringify(todos));
            const prev = JSON.parse(undoStack.pop());
            saveTodos(prev);
            console.log(chalk.green('Undo successful.'));
            break;
        case 'redo':
            if (redoStack.length === 0) {
                console.log(chalk.yellow('Nothing to redo.'));
                break;
            }
            undoStack.push(JSON.stringify(todos));
            const next = JSON.parse(redoStack.pop());
            saveTodos(next);
            console.log(chalk.green('Redo successful.'));
            break;
        case 'quit':
            console.log(chalk.blue('Goodbye!'));
            process.exit(0);
    }
    await mainMenu();
}

// Add --help flag support
if (process.argv.includes('--help')) {
    console.log('\nHelp - Available Commands:');
    [
        'Add a new task',
        'List all tasks',
        'Mark task as done',
        'Mark task as undone',
        'Edit a task',
        'Move a task',
        'Delete a task',
        'Clear all tasks',
        'Search/filter tasks',
        'Export tasks',
        'Import tasks',
        'Undo',
        'Redo',
        'Help',
        'Quit'
    ].forEach(c => console.log('- ' + c));
    process.exit(0);
}

if (require.main === module) {
    mainMenu();
}
