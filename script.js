let todos = [];
let expandedTodos = new Set();

function addTodo() {
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

    todos.push(newTodo);

    document.getElementById('themeInput').value = '';
    document.getElementById('todoTextInput').value = '';
    document.getElementById('priorityInput').value = '1';

    updateDisplay();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    expandedTodos.delete(id);
    updateDisplay();
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
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    const todoHeader = document.createElement('div');
    todoHeader.className = 'todo-header';
    todoHeader.onclick = () => toggleExpanded(todo.id);
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    // expandBtn.textContent = isExpanded ? '▼' : '▶';
    const expandImg1 = document.createElement('img');
    expandImg1.src = '/images/expand-closed.png';
    expandImg1.alt = 'Expand-closed';
    const expandImg2 = document.createElement('img');
    expandImg2.src = '/images/expand-opened.png';
    expandImg2.alt = 'Expand-opened';
    expandBtn.appendChild(isExpanded ?  expandImg2 : expandImg1);


    const todoInfo = document.createElement('div');
    todoInfo.className = 'todo-info';
    const todoTitle = document.createElement('div');
    todoTitle.className = 'todo-title';
    todoTitle.textContent = `Theme: ${todo.theme}`;
    const priorityTag = document.createElement('span');
    priorityTag.className = `priority-tag priority-${todo.priority}`;
    priorityTag.textContent = `Priority ${todo.priority}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    const removeImg = document.createElement('img');
    removeImg.src = 'images/remove-icon.png';
    removeImg.alt = 'Delete';
    deleteBtn.appendChild(removeImg);

    deleteBtn.onclick = () => deleteTodo(todo.id);
    todoInfo.append(todoTitle);
    todoInfo.append(priorityTag);
    todoHeader.append(expandBtn);
    todoHeader.append(todoInfo);
    todoHeader.append(deleteBtn);
    todoItem.append(todoHeader);

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

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No tasks found';
        todoList.append(emptyState);
        return;
    }

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

updateDisplay();