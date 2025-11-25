import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { z } from "zod";
import crypto from "crypto";

const app = express();

const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  tags: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

// In-memory store (Prisma の代替)
const tasks = new Map<string, Task>();

// Schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  completed: z.boolean().optional(),
});

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["completed", "pending"]).optional(),
  tag: z.string().optional(),
  sort: z.enum(["dueDate", "createdAt"]).optional(),
});

const filterTasks = (query: z.infer<typeof querySchema>) => {
  let list = Array.from(tasks.values());

  if (query.status === "completed") list = list.filter((t) => t.completed);
  if (query.status === "pending") list = list.filter((t) => !t.completed);
  const tag = query.tag;
  if (tag) list = list.filter((t) => t.tags.includes(tag));
  if (query.search) {
    const term = query.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        (t.description ?? "").toLowerCase().includes(term)
    );
  }

  if (query.sort === "dueDate") {
    list.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  } else {
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return list;
};

// Routes
app.get("/tasks", (req: Request, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const list = filterTasks(parsed.data);
  res.json(list);
});

app.post("/tasks", (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    dueDate: parsed.data.dueDate,
    tags: parsed.data.tags ?? [],
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.set(task.id, task);
  res.status(201).json(task);
});

app.patch("/tasks/:id", (req: Request, res: Response) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = tasks.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const updated: Task = {
    ...existing,
    ...parsed.data,
    tags: parsed.data.tags ?? existing.tags,
    updatedAt: new Date().toISOString(),
  };

  tasks.set(updated.id, updated);
  res.json(updated);
});

app.delete("/tasks/:id", (req: Request, res: Response) => {
  if (!tasks.has(req.params.id)) return res.status(404).json({ error: "Task not found" });
  tasks.delete(req.params.id);
  res.status(204).send();
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
