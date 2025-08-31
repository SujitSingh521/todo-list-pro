import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoon, FaSun, FaPlus, FaTrashAlt, FaGripLines, FaEdit } from "react-icons/fa";

const STORAGE_KEY = "todo_advanced_tasks_v1";
const MODE_KEY = "todo_advanced_mode";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [dark, setDark] = useState(false);
  const dragSourceIndex = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setTasks(JSON.parse(raw));
      } catch {
        setTasks([]);
      }
    }
    const mode = localStorage.getItem(MODE_KEY);
    setDark(mode === "dark");
  }, []);

  // Save tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem(MODE_KEY, dark ? "dark" : "light");
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const addOrUpdate = () => {
    const text = input.trim();
    if (!text) return;
    if (editId) {
      setTasks((prev) => prev.map((t) => (t.id === editId ? { ...t, text } : t)));
      setEditId(null);
    } else {
      const newTask = { id: Date.now(), text, completed: false };
      setTasks((prev) => [newTask, ...prev]);
    }
    setInput("");
  };

  const remove = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const toggleComplete = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const startEdit = (task) => {
    setInput(task.text);
    setEditId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const clearCompleted = () => setTasks((prev) => prev.filter((t) => !t.completed));

  // Drag and Drop
  const onDragStart = (e, index) => {
    dragSourceIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };
  const onDrop = (e, index) => {
    e.preventDefault();
    const src = dragSourceIndex.current;
    if (src === null || src === index) return;
    setTasks((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(src, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    dragSourceIndex.current = null;
  };

  const filtered = tasks
    .filter((t) => {
      if (filter === "Active") return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 
      bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 
      dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">
              ✅ ToDo — Advanced
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Stylish • Local • Drag & Drop • Persistent
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-lg hover:scale-110 transition"
          >
            {dark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-600" />}
          </button>
        </header>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOrUpdate()}
              placeholder={editId ? "Update task..." : "Add a new task..."}
              className="flex-1 bg-transparent focus:outline-none px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={addOrUpdate}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 hover:scale-105 transition"
            >
              <FaPlus /> {editId ? "Update" : "Add"}
            </button>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900">
                {["All", "Active", "Completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-sm font-medium transition ${
                      filter === f
                        ? "bg-indigo-500 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={clearCompleted}
                className="text-sm text-red-500 hover:underline ml-3"
                title="Clear completed tasks"
              >
                Clear completed
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm"
              />
              <div className="text-sm text-gray-500 dark:text-gray-300">
                {filtered.length} / {tasks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
              >
                <p className="text-gray-500 dark:text-gray-300">No tasks found — add one!</p>
              </motion.div>
            ) : (
              filtered.map((task, idx) => (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 px-3 py-3 flex items-center gap-3 ${
                    task.completed ? "opacity-70" : ""
                  }`}
                  draggable
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDrop={(e) => onDrop(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Drag Handle */}
                  <div className="p-2 rounded-md cursor-grab">
                    <FaGripLines className="text-gray-400" />
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className={`w-full text-left ${
                        task.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate font-medium">{task.text}</span>
                        <span className="hidden sm:block text-xs text-gray-400">
                          {task.completed ? "✔ Done" : "⏳ Active"}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaEdit className="text-indigo-500" />
                    </button>
                    <button
                      onClick={() => remove(task.id)}
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaTrashAlt className="text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Built with ❤️ · Local only · {tasks.length} tasks saved
        </footer>
      </div>
    </div>
  );
}
