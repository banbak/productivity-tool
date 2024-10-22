document.addEventListener('DOMContentLoaded', () => {
    let editMode = false;
    let currentItemEditing = null; 

    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const taskSubmitButton = taskForm.querySelector('button');
   
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goal-input');
    const goalList = document.getElementById('goal-list');
    const goalSubmitButton = goalForm.querySelector('button'); 

    const projectForm = document.getElementById('project-form');
    const projectInput = document.getElementById('project-input');
    const projectList = document.getElementById('project-list');
    const projectSubmitButton = projectForm.querySelector('button');

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            sections.forEach(section => {
                section.classList.add('section-hidden');
                section.classList.remove('section-active');
            });
            document.getElementById(sectionId).classList.add('section-active');
        });
    });

    loadTasksFromLocalStorage();
    loadGoalsFromLocalStorage();
    loadProjectsFromLocalStorage();

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (editMode && currentItemEditing) {
            saveEditedItem(taskInput, taskSubmitButton, 'tasks');
        } else {
            addTask(taskInput.value);
            taskInput.value = '';
        }
    });

    goalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (editMode && currentItemEditing) {
            saveEditedItem(goalInput, goalSubmitButton, 'goals');
        } else {
            addGoal(goalInput.value);
            goalInput.value = '';
        }
    });

    projectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (editMode && currentItemEditing) {
            saveEditedItem(projectInput, projectSubmitButton, 'projects');
        } else {
            addProject(projectInput.value);
            projectInput.value = '';
        }
    });

    function addTask(task, isFromStorage = false) {
        if (task) {
            const li = createListItem(task, 'tasks');
            taskList.appendChild(li);
            if (!isFromStorage) saveTasksToLocalStorage();
            updateProductivityReport();
        }
    }

    function addGoal(goal, isFromStorage = false) {
        if (goal) {
            const li = createListItem(goal, 'goals');
            goalList.appendChild(li);
            if (!isFromStorage) saveGoalsToLocalStorage();
            updateProductivityReport();
        }
    }

    function addProject(project, isFromStorage = false) {
        if (project) {
            const li = createListItem(project, 'projects');
            projectList.appendChild(li);
            if (!isFromStorage) saveProjectsToLocalStorage();
            updateProductivityReport();
        }
    }

    function createListItem(text, type) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${text}</span>
            <button class="complete-item">Completar</button>
            <button class="edit-item">Editar</button>
            <button class="delete-item">Eliminar</button>
        `;
        li.querySelector('.complete-item').addEventListener('click', () => completeItem(li, type));
        li.querySelector('.edit-item').addEventListener('click', () => editItem(li, type));
        li.querySelector('.delete-item').addEventListener('click', () => deleteItem(li, type));
        return li;
    }

    function completeItem(item, type) {
        item.classList.toggle('completed');
        if (type === 'tasks') saveTasksToLocalStorage();
        if (type === 'goals') saveGoalsToLocalStorage();
        if (type === 'projects') saveProjectsToLocalStorage();
        updateProductivityReport();
    }

    function editItem(item, type) {
        const itemText = item.querySelector('span').textContent;
        currentItemEditing = item;
        editMode = true;
        if (type === 'tasks') {
            taskInput.value = itemText;
            taskSubmitButton.textContent = 'Guardar Cambios';
        } else if (type === 'goals') {
            goalInput.value = itemText;
            goalSubmitButton.textContent = 'Guardar Cambios';
        } else if (type === 'projects') {
            projectInput.value = itemText;
            projectSubmitButton.textContent = 'Guardar Cambios';
        }
    }

    function saveEditedItem(inputField, submitButton, type) {
        currentItemEditing.querySelector('span').textContent = inputField.value;
        resetEditState(inputField, submitButton);
        if (type === 'tasks') saveTasksToLocalStorage();
        if (type === 'goals') saveGoalsToLocalStorage();
        if (type === 'projects') saveProjectsToLocalStorage();
        updateProductivityReport();
    }

    function resetEditState(inputField, submitButton) {
        editMode = false;
        currentItemEditing = null;
        inputField.value = '';
        submitButton.textContent = 'Añadir';
    }

    function deleteItem(item, type) {
        item.remove();
        if (type === 'tasks') saveTasksToLocalStorage();
        if (type === 'goals') saveGoalsToLocalStorage();
        if (type === 'projects') saveProjectsToLocalStorage();
        updateProductivityReport();
    }

    function updateProductivityReport() {
        const tasks = document.querySelectorAll('#task-list li');
        const completedTasks = document.querySelectorAll('#task-list li.completed');

        const goals = document.querySelectorAll('#goal-list li');
        const completedGoals = document.querySelectorAll('#goal-list li.completed');

        const projects = document.querySelectorAll('#project-list li');
        const completedProjects = document.querySelectorAll('#project-list li.completed');

        const report = document.getElementById('productivity-report');
        report.innerHTML = `
            <p>Total de tareas: ${tasks.length}</p>
            <p>Tareas completadas: ${completedTasks.length}</p>
            <p>% Productividad en tareas: ${(tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(2) : 0)}%</p><br>
            <p>Total de metas: ${goals.length}</p>
            <p>Metas completadas: ${completedGoals.length}</p>
            <p>% Productividad en metas: ${(goals.length > 0 ? (completedGoals.length / goals.length * 100).toFixed(2) : 0)}%</p><br>
            <p>Total de proyectos: ${projects.length}</p>
            <p>Proyectos completados: ${completedProjects.length}</p>
            <p>% Productividad en proyectos: ${(projects.length > 0 ? (completedProjects.length / projects.length * 100).toFixed(2) : 0)}%</p>
        `;
    }

    function saveTasksToLocalStorage() {
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(task => {
            tasks.push({
                text: task.querySelector('span').textContent,
                completed: task.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task.text, true));
        tasks.forEach(task => {
            if (task.completed) {
                document.querySelectorAll('#task-list li').forEach(li => {
                    if (li.querySelector('span').textContent === task.text) {
                        li.classList.add('completed');
                    }
                });
            }
        });
    }

    function saveGoalsToLocalStorage() {
        const goals = [];
        document.querySelectorAll('#goal-list li').forEach(goal => {
            goals.push({
                text: goal.querySelector('span').textContent,
                completed: goal.classList.contains('completed')
            });
        });
        localStorage.setItem('goals', JSON.stringify(goals));
    }

    function loadGoalsFromLocalStorage() {
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        goals.forEach(goal => addGoal(goal.text, true));
        goals.forEach(goal => {
            if (goal.completed) {
                document.querySelectorAll('#goal-list li').forEach(li => {
                    if (li.querySelector('span').textContent === goal.text) {
                        li.classList.add('completed');
                    }
                });
            }
        });
    }

    function saveProjectsToLocalStorage() {
        const projects = [];
        document.querySelectorAll('#project-list li').forEach(project => {
            projects.push({
                text: project.querySelector('span').textContent,
                completed: project.classList.contains('completed')
            });
        });
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function loadProjectsFromLocalStorage() {
        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        projects.forEach(project => addProject(project.text, true));
        projects.forEach(project => {
            if (project.completed) {
                document.querySelectorAll('#project-list li').forEach(li => {
                    if (li.querySelector('span').textContent === project.text) {
                        li.classList.add('completed');
                    }
                });
            }
        });
    }
});
