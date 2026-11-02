# OperitForge
Operit publish-only artifact repository for release assets.

---

## 源码工程
Mika 手机 Agent 的 Operit 沙盒桥接包源码位于 [`source/mika_mcp/`](source/mika_mcp/)：

- `src/main.ts` — 11 个工具的桥接实现（10 个上游 mika_* 一对一桥接 + 自研 check_config）
- `types/` — Operit 沙盒类型声明（25 个 .d.ts）
- `tsconfig.json` / `build.sh` / `package.json` — 构建工程
- `dist/mika_mcp.js` — 构建产物（供参考）

构建：`cd source/mika_mcp && bash build.sh`。发布产物以 Release 形式存放在本仓库（由 Operit 发布流程自动生成）。