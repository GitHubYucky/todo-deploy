import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  tags?: string[] | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Filters = {
  search: string;
  status: "all" | "completed" | "pending";
  tag: string;
  sort: "createdAt" | "dueDate";
};

type NewTask = {
  title: string;
  description: string;
  dueDate: string;
  tags: string;
};

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:4000";

const parseTags = (tags: string) =>
  tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

async function fetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString();
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    tag: "",
    sort: "createdAt",
  });

  const [form, setForm] = useState<NewTask>({
    title: "",
    description: "",
    dueDate: "",
    tags: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.sort === "dueDate") params.set("sort", filters.sort);
    return params.toString();
  }, [filters]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<Task[]>(
        `/tasks${queryString ? `?${queryString}` : ""}`
      );
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("タイトルは必須です");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await fetchJson<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          dueDate: form.dueDate
            ? new Date(form.dueDate).toISOString()
            : undefined,
          tags: parseTags(form.tags),
        }),
      });
      setForm({ title: "", description: "", dueDate: "", tags: "" });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    setActionId(task.id);
    setError(null);
    try {
      await fetchJson<Task>(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setActionId(null);
    }
  };

  const deleteTask = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setActionId(task.id);
    setError(null);
    try {
      await fetchJson(`/tasks/${task.id}`, { method: "DELETE" });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">TODOアプリ</p>
          <h1>タスク管理ダッシュボード</h1>
          <p className="subtitle">
            CRUD + 検索/フィルタ/ソートに対応した最小フロント。
          </p>
        </div>
        <div className="badge">
          API: <span className="mono">{API_BASE}</span>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">フィルタ & ソート</p>
            <h2>タスク一覧</h2>
          </div>
          <button
            className="ghost"
            onClick={loadTasks}
            disabled={loading || creating}
          >
            {loading ? "更新中..." : "再読込"}
          </button>
        </div>
        <div className="filters">
          <input
            type="search"
            placeholder="検索（タイトル・説明）"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as Filters["status"],
              }))
            }
          >
            <option value="all">すべて</option>
            <option value="pending">未完了</option>
            <option value="completed">完了</option>
          </select>
          <input
            type="text"
            placeholder="タグで絞り込み (例: work)"
            value={filters.tag}
            onChange={(e) =>
              setFilters((f) => ({ ...f, tag: e.target.value }))
            }
          />
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                sort: e.target.value as Filters["sort"],
              }))
            }
          >
            <option value="createdAt">作成日(新しい順)</option>
            <option value="dueDate">期限日(昇順)</option>
          </select>
        </div>

        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="muted">読み込み中...</div>
        ) : tasks.length === 0 ? (
          <div className="muted">タスクはまだありません。</div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`task ${task.completed ? "done" : ""}`}
              >
                <div className="task-main">
                  <div className="task-title">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task)}
                      disabled={actionId === task.id}
                    />
                    <div>
                      <p>{task.title}</p>
                      {task.description && (
                        <span className="muted">{task.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="meta">
                    <span>
                      期限: <strong>{formatDate(task.dueDate)}</strong>
                    </span>
                    <span>
                      作成: <strong>{formatDate(task.createdAt)}</strong>
                    </span>
                    {task.tags && task.tags.length > 0 && (
                      <span className="tags">
                        {task.tags.map((tag) => (
                          <code key={tag}>{tag}</code>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    onClick={() => toggleComplete(task)}
                    disabled={actionId === task.id}
                  >
                    {task.completed ? "未完了に戻す" : "完了にする"}
                  </button>
                  <button
                    className="danger"
                    onClick={() => deleteTask(task)}
                    disabled={actionId === task.id}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">作成フォーム</p>
            <h2>新規タスク</h2>
          </div>
          <span className="muted small">タイトルは必須</span>
        </div>
        <form className="form" onSubmit={handleCreate}>
          <label>
            タイトル
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="例: API ルート実装"
            />
          </label>
          <label>
            説明
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="例: CRUD エンドポイントとバリデーション"
              rows={3}
            />
          </label>
          <div className="two-col">
            <label>
              期限
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </label>
            <label>
              タグ（カンマ区切り）
              <input
                type="text"
                value={form.tags}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="work, urgent"
              />
            </label>
          </div>
          <div className="actions">
            <button type="submit" disabled={creating}>
              {creating ? "作成中..." : "タスクを追加"}
            </button>
            <span className="muted small">
              保存後、自動で一覧をリロードします。
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;
