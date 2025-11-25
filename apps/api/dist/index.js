"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use((0, cors_1.default)({ origin: CORS_ORIGIN }));
app.use(express_1.default.json());
// In-memory store (Prisma の代替)
const tasks = new Map();
// Schemas
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "title is required"),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateTaskSchema = createTaskSchema.partial().extend({
    completed: zod_1.z.boolean().optional(),
});
const querySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["completed", "pending"]).optional(),
    tag: zod_1.z.string().optional(),
    sort: zod_1.z.enum(["dueDate", "createdAt"]).optional(),
});
const filterTasks = (query) => {
    let list = Array.from(tasks.values());
    if (query.status === "completed")
        list = list.filter((t) => t.completed);
    if (query.status === "pending")
        list = list.filter((t) => !t.completed);
    const tag = query.tag;
    if (tag)
        list = list.filter((t) => t.tags.includes(tag));
    if (query.search) {
        const term = query.search.toLowerCase();
        list = list.filter((t) => t.title.toLowerCase().includes(term) ||
            (t.description ?? "").toLowerCase().includes(term));
    }
    if (query.sort === "dueDate") {
        list.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
    }
    else {
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
};
// Routes
app.get("/tasks", (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const list = filterTasks(parsed.data);
    res.json(list);
});
app.post("/tasks", (req, res) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const now = new Date().toISOString();
    const task = {
        id: crypto_1.default.randomUUID(),
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
app.patch("/tasks/:id", (req, res) => {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const existing = tasks.get(req.params.id);
    if (!existing)
        return res.status(404).json({ error: "Task not found" });
    const updated = {
        ...existing,
        ...parsed.data,
        tags: parsed.data.tags ?? existing.tags,
        updatedAt: new Date().toISOString(),
    };
    tasks.set(updated.id, updated);
    res.json(updated);
});
app.delete("/tasks/:id", (req, res) => {
    if (!tasks.has(req.params.id))
        return res.status(404).json({ error: "Task not found" });
    tasks.delete(req.params.id);
    res.status(204).send();
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
