// Simple CLI To-Do List in Node.js
// Usage: node main.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FILE = path.join(__dirname, 'todos.json');

function loadTodos() {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveTodos(todos) {
    fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

function printHelp() {
    console.log('\nAvailable commands:');
    console.log('  A   Add a new task');
    console.log('  L   List all tasks');
    console.log('  D   Mark task as done');
    console.log('  X   Mark task as undone');
    console.log('  E   Edit a task');
    console.log('  M   Move a task');
    console.log('  C   Clear all tasks');
    console.log('  Q   Quit');
}

function printTasks() {
    const todos = loadTodos();
    if (todos.length === 0) {
        console.log('No tasks found.');
    } else {
        todos.forEach((t, i) => {
            console.log(`${i + 1}. [${t.done ? 'x' : ' '}] ${t.task}`);
        });
    }
}

function mainMenu(rl) {
    printHelp();
    rl.question('\nChoose a command: ', (cmd) => {
        switch (cmd.trim().toUpperCase()) {
            case 'A':
                rl.question('Enter task description: ', (desc) => {
                    if (!desc) return mainMenu(rl);
                    const todos = loadTodos();
                    todos.push({ task: desc, done: false });
                    saveTodos(todos);
                    console.log('Task added.');
                    mainMenu(rl);
                });
                break;
            case 'L':
                printTasks();
                mainMenu(rl);
                break;
            case 'D':
                printTasks();
                function askDone() {
                    rl.question('Enter task number to mark as done: ', (num) => {
                        const idx = parseInt(num, 10) - 1;
                        const todos = loadTodos();
                        if (isNaN(idx) || idx < 0 || idx >= todos.length) {
                            console.log('Invalid task number.');
                            askDone();
                        } else {
                            todos[idx].done = true;
                            saveTodos(todos);
                            console.log('Task marked as done.');
                            mainMenu(rl);
                        }
                    });
                }
                askDone();
                break;
            case 'X':
                printTasks();
                function askUndone() {
                    rl.question('Enter task number to mark as undone: ', (num) => {
                        const idx = parseInt(num, 10) - 1;
                        const todos = loadTodos();
                        if (isNaN(idx) || idx < 0 || idx >= todos.length) {
                            console.log('Invalid task number.');
                            askUndone();
                        } else {
                            todos[idx].done = false;
                            saveTodos(todos);
                            console.log('Task marked as undone.');
                            mainMenu(rl);
                        }
                    });
                }
                askUndone();
                break;
            case 'E':
                printTasks();
                function askEdit() {
                    rl.question('Enter task number to edit: ', (num) => {
                        const idx = parseInt(num, 10) - 1;
                        const todos = loadTodos();
                        if (isNaN(idx) || idx < 0 || idx >= todos.length) {
                            console.log('Invalid task number.');
                            askEdit();
                        } else {
                            function askEditDesc() {
                                rl.question('Enter new description: ', (desc) => {
                                    if (!desc) {
                                        console.log('Description cannot be empty.');
                                        askEditDesc();
                                    } else {
                                        todos[idx].task = desc;
                                        saveTodos(todos);
                                        console.log('Task updated.');
                                        mainMenu(rl);
                                    }
                                });
                            }
                            askEditDesc();
                        }
                    });
                }
                askEdit();
                break;
            case 'M':
                printTasks();
                function askMoveFrom() {
                    rl.question('Move from (task number): ', (from) => {
                        const fromIdx = parseInt(from, 10) - 1;
                        const todos = loadTodos();
                        if (isNaN(fromIdx) || fromIdx < 0 || fromIdx >= todos.length) {
                            console.log('Invalid task number.');
                            askMoveFrom();
                        } else {
                            function askMoveTo() {
                                rl.question('Move to (task number): ', (to) => {
                                    const toIdx = parseInt(to, 10) - 1;
                                    if (isNaN(toIdx) || toIdx < 0 || toIdx >= todos.length) {
                                        console.log('Invalid task number.');
                                        askMoveTo();
                                    } else {
                                        const [moved] = todos.splice(fromIdx, 1);
                                        todos.splice(toIdx, 0, moved);
                                        saveTodos(todos);
                                        console.log('Task moved.');
                                        mainMenu(rl);
                                    }
                                });
                            }
                            askMoveTo();
                        }
                    });
                }
                askMoveFrom();
                break;
            case 'C':
                rl.question('Are you sure you want to clear all tasks? (y/n): ', (ans) => {
                    if (ans.trim().toLowerCase() === 'y') {
                        saveTodos([]);
                        console.log('All tasks cleared.');
                    }
                    mainMenu(rl);
                });
                break;
            case 'Q':
                rl.close();
                break;
            default:
                console.log('Unknown command.');
                mainMenu(rl);
        }
    });
}

if (require.main === module) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    mainMenu(rl);
}
