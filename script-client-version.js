let todos = [];
let expandedTodos = new Set();

// Configuration
const API_BASE_URL = 'http://localhost:8080/api'; // Change port if needed

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
});

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (response.ok) {
            todos = await response.json();
            updateDisplay();
            console.log('✅ Tasks loaded from server');
        } else {
            console.error('Failed to load tasks from server');
            showNotification('Failed to load tasks from server', 'error');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Server connection failed. Working offline.', 'warning');
    }
}

async function addTodo() {
    const theme = document.getElementById('themeInput').value || 'No theme';
    const text = document.getElementById('todoTextInput').value.trim();
    const priority = parseInt(document.getElementById('priorityInput').value);

    if (!text) {
        alert('Please enter task text!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        theme: theme,
        text: text,
        priority: priority
    };

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo)
        });

        if (response.ok) {
            const savedTodo = await response.json();
            todos.push(savedTodo);

            // Clear form
            document.getElementById('themeInput').value = '';
            document.getElementById('todoTextInput').value = '';
            document.getElementById('priorityInput').value = '1';

            updateDisplay();
            showNotification('Task added successfully!', 'success');
            console.log('✅ Task added to server');
        } else {
            throw new Error('Failed to save task');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Failed to save task to server', 'error');

        // Fallback: add to local array
        todos.push(newTodo);
        updateDisplay();
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            todos = todos.filter(todo => todo.id !== id);
            expandedTodos.delete(id);
            updateDisplay();
            showNotification('Task deleted successfully!', 'success');
            console.log('✅ Task deleted from server');
        } else {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task from server', 'error');

        // Fallback: remove from local array
        todos = todos.filter(todo => todo.id !== id);
        expandedTodos.delete(id);
        updateDisplay();
    }
}

function toggleExpanded(id) {
    if (expandedTodos.has(id)) {
        expandedTodos.delete(id);
    } else {
        expandedTodos.add(id);
    }
    renderTodos();
}

function getFilteredTodos() {
    const priorityFilter = document.getElementById('priorityFilter').value;

    return todos.filter(todo => {
        return !priorityFilter || todo.priority.toString() === priorityFilter;
    });
}

function createTodoItem(todo) {
    const isExpanded = expandedTodos.has(todo.id);

    // Create main todo item container
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';

    // Create todo header
    const todoHeader = document.createElement('div');
    todoHeader.className = 'todo-header';
    todoHeader.onclick = () => toggleExpanded(todo.id);

    // Create expand button
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    expandBtn.textContent = isExpanded ? '▼' : '▶';

    // Create todo info container
    const todoInfo = document.createElement('div');
    todoInfo.className = 'todo-info';

    // Create todo title
    const todoTitle = document.createElement('div');
    todoTitle.className = 'todo-title';
    todoTitle.textContent = `Theme: ${todo.theme}`;

    // Create priority tag
    const priorityTag = document.createElement('span');
    priorityTag.className = `priority-tag priority-${todo.priority}`;
    priorityTag.textContent = `Priority ${todo.priority}`;

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent expanding when clicking delete
        deleteTodo(todo.id);
    };

    // Append elements to todo info
    todoInfo.append(todoTitle);
    todoInfo.append(priorityTag);

    // Append elements to todo header
    todoHeader.append(expandBtn);
    todoHeader.append(todoInfo);
    todoHeader.append(deleteBtn);

    // Append header to todo item
    todoItem.append(todoHeader);

    // Create and append details if expanded
    if (isExpanded) {
        const todoDetails = document.createElement('div');
        todoDetails.className = 'todo-details';

        const detailRow = document.createElement('div');
        detailRow.className = 'detail-row';

        const strongText = document.createElement('strong');
        strongText.textContent = 'Text:';

        const detailText = document.createElement('div');
        detailText.className = 'detail-text';
        detailText.textContent = todo.text;

        detailRow.append(strongText);
        detailRow.append(detailText);
        todoDetails.append(detailRow);
        todoItem.append(todoDetails);
    }

    return todoItem;
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    const todoList = document.getElementById('todoList');
    const itemCount = document.getElementById('itemCount');

    itemCount.textContent = `${filteredTodos.length} items shown`;

    // Clear existing content
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No tasks found';
        todoList.append(emptyState);
        return;
    }

    // Create and append each todo item
    filteredTodos.forEach(todo => {
        const todoElement = createTodoItem(todo);
        todoList.append(todoElement);
    });
}

function updateStats() {
    document.getElementById('totalItems').textContent = todos.length;
    document.getElementById('priority1Count').textContent = todos.filter(t => t.priority === 1).length;
    document.getElementById('priority2Count').textContent = todos.filter(t => t.priority === 2).length;
    document.getElementById('priority3Count').textContent = todos.filter(t => t.priority === 3).length;
}

function updateDisplay() {
    renderTodos();
    updateStats();
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Refresh button to reload tasks from server
function refreshTasks() {
    loadTasks();
    showNotification('Tasks refreshed from server', 'info');
}

// Add refresh button to the UI (you can add this to your HTML)
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh';
    refreshBtn.className = 'btn';
    refreshBtn.style.marginTop = '10px';
    refreshBtn.onclick = refreshTasks;

    // Add to the create panel
    const createPanel = document.querySelector('.panel');
    if (createPanel) {
        createPanel.appendChild(refreshBtn);
    }
});

// Initialize display
updateDisplay();