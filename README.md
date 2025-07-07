# Interactive CLI To-Do List

A feature-rich, user-friendly command-line To-Do list application built with Node.js.

## Features
- Interactive menu with keyboard navigation (using Inquirer)
- Colorful output for better readability (using Chalk)
- Add, list, edit, move, delete, and clear tasks
- Task priorities (High, Medium, Low)
- Due dates and overdue highlighting
- Mark tasks as done/undone
- Search and filter tasks by keyword, status, or priority
- Undo/redo for all actions
- Export/import tasks as JSON or CSV
- Progress bar showing completion percentage
- Confirmation prompts for destructive actions
- Help command and `--help` flag
- 100% code coverage with comprehensive tests

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm

### Installation
1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd todo-repo
   ```
2. Install dependencies:
   ```
   npm install
   ```

### Usage
Run the interactive CLI:
```
node src/main.js
```

### Available Commands
- **Add a new task**: Add a task with description, priority, and optional due date
- **List all tasks**: View all tasks with status, priority, and due date
- **Mark task as done/undone**: Update completion status
- **Edit a task**: Change description, priority, or due date
- **Move a task**: Reorder tasks
- **Delete a task**: Remove a specific task (with confirmation)
- **Clear all tasks**: Remove all tasks (with confirmation)
- **Search/filter tasks**: Find tasks by keyword, status, or priority
- **Export/Import**: Save/load tasks as JSON or CSV
- **Undo/Redo**: Revert or reapply the last action
- **Help**: Show help menu
- **Quit**: Exit the application

You can also run:
```
node src/main.js --help
```
to see a quick reference of all commands.

### Testing
Run all tests and check code coverage:
```
npm test -- --coverage
```

## Project Structure
```
src/
  main.js        # CLI entry point
  todo.js        # Core task logic
  todos.json     # Task data storage
  tests/
    todo.test.js # Jest test suite
```

## License
MIT
