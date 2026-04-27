import { useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  done: boolean;
};

type Filter = "all" | "open" | "done";

const initialTasks: Task[] = [
  { id: 1, title: "Explore this repo", done: true },
  { id: 2, title: "Build a simple dynamic page", done: true },
  { id: 3, title: "Add one more task", done: false }
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "done") return task.done;
      if (filter === "open") return !task.done;
      return true;
    });
  }, [tasks, filter]);

  function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title: trimmed,
        done: false
      }
    ]);
    setTitle("");
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  return (
    <main className="app">
      <h1>Simple Dynamic Page</h1>
      <p className="sub">No database used. All data is in memory in this page session.</p>

      <section className="controls">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addTask();
          }}
          type="text"
          placeholder="Add a task..."
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>

        <button type="button" onClick={addTask}>
          Add
        </button>
      </section>

      <p className="meta">{`${filteredTasks.length} shown / ${tasks.length} total`}</p>
      <ul>
        {filteredTasks.map((task) => (
          <li key={task.id}>
            <span className={`task-title ${task.done ? "done" : ""}`}>{task.title}</span>
            <div>
              <span className="status">{task.done ? "Done" : "Open"}</span>{" "}
              <button type="button" onClick={() => toggleTask(task.id)}>
                {task.done ? "Reopen" : "Complete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
