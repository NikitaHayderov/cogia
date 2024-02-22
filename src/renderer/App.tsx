import  React, { useState, useEffect } from 'react';


import { Todo } from './types';

const { ipcRenderer } = window.require('electron');

const App: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState<string>('');

    useEffect(() => {
        ipcRenderer.send('get-todos');
        const handleTodosUpdate = (_: any, arg: Todo[]) => setTodos(arg);
        ipcRenderer.on('todos', handleTodosUpdate);

        return () => {
            ipcRenderer.removeListener('todos', handleTodosUpdate);
        };
    }, []);

    const addTodo = (): void => {
        const newTodo: Todo = {
            id: Math.random(),
            title: newTodoTitle,
            status: 'In Progress',
        };

        const updatedTodos = [...todos, newTodo];
        setTodos(updatedTodos);
        ipcRenderer.send('save-todos', updatedTodos);
        setNewTodoTitle('');
    };

    const deleteTodo = (id: number): void => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const toggleTodoStatus = (id: number): void => {
        setTodos(todos.map(todo => ({
            ...todo,
            status: todo.id === id ? (todo.status === 'In Progress' ? 'Done' : 'In Progress') : todo.status
        })).sort((a, b) => a.status === 'Done' ? 1 : -1));
    };

    return (
        <div>
            <h1>Plan List</h1>
            <div>
                <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="Add a new task"
                />
                <button onClick={addTodo}>Add Task</button>
            </div>
            <ul>
                {todos.map(({ id, title, status }) => (
                    <li key={id}>
                        {title} [{status}]
                        <button onClick={() => toggleTodoStatus(id)}>Change Status</button>
                        <button onClick={() => deleteTodo(id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;