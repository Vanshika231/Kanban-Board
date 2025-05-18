
    let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];

    document.addEventListener('DOMContentLoaded', () => {
        renderTasks();
        setupDragAndDrop();
    });

    function renderTasks() {
        document.querySelectorAll('.tasks').forEach(el => el.innerHTML = '');

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task ${task.status}`;
            taskEl.dataset.id = task.id;
            taskEl.draggable = true;
            taskEl.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'No description provided'}</p>
            `;
            document.getElementById(task.status).appendChild(taskEl);
        });
    }

    function showForm(status) {
        document.querySelectorAll('.task-form').forEach(f => f.style.display = 'none');
        document.getElementById(`${status}-form`).style.display = 'block';
        document.getElementById(`${status}-title`).focus();
    }

    function hideForm(status) {
        document.getElementById(`${status}-form`).style.display = 'none';
        document.getElementById(`${status}-title`).value = '';
        document.getElementById(`${status}-desc`).value = '';
    }

    // New function for form submission handling
    function submitForm(event, status) {
        event.preventDefault();
        addTask(status);
    }

    function addTask(status) {
        const titleInput = document.getElementById(`${status}-title`);
        const descInput = document.getElementById(`${status}-desc`);
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!title) {
            alert('Task title is required.');
            titleInput.focus();
            return;
        }

        tasks.push({
            id: Date.now().toString(),
            title,
            description,
            status,
            createdAt: new Date()
        });

        saveTasks();
        renderTasks();
        hideForm(status);
    }

    function setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task')) {
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task')) {
                e.target.classList.remove('dragging');
            }
        });

        document.querySelectorAll('.tasks').forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                const afterElement = getDragAfterElement(container, e.clientY);

                if (afterElement) {
                    container.insertBefore(draggable, afterElement);
                } else {
                    container.appendChild(draggable);
                }
            });

            container.addEventListener('drop', () => {
                updateTaskStatus();
            });
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateTaskStatus() {
        document.querySelectorAll('.tasks').forEach(container => {
            const status = container.parentElement.dataset.status;
            container.querySelectorAll('.task').forEach(taskEl => {
                const task = tasks.find(t => t.id === taskEl.dataset.id);
                if (task && task.status !== status) {
                    task.status = status;
                    taskEl.className = `task ${status}`;
                }
            });
        });
        saveTasks();
    }

    function saveTasks() {
        localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
    }

