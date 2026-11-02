/* METADATA
{
    "name": "mika_mcp",
    "version": "1.0.0",
    "display_name": {
        "zh": "Mika 手机 Agent",
        "en": "Mika Phone Agent"
    },
    "description": {
        "zh": "把 Mika 手机的 AI Agent 能力接入 Operit。Mika 在手机后台虚拟屏上运行 Agent，本包通过 MCP（Streamable HTTP / JSON-RPC）向其下发任务并管理生命周期：运行任务、查询/等待/引导/取消任务、回答 Agent 提问、列出任务、查看设备状态、唤醒与解锁设备。需先在环境配置中填写 MIKA_MCP_URL 与 MIKA_MCP_TOKEN。",
        "en": "Bridge Mika phone AI Agent into Operit via MCP (Streamable HTTP / JSON-RPC). Run tasks on Mika's background virtual display, track/steer/cancel tasks, answer Agent questions, list tasks, check device state, wake and unlock the device. Requires MIKA_MCP_URL and MIKA_MCP_TOKEN env config."
    },
    "author": ["lanjumaovr"],
    "category": "Automatic",
    "env": [
        {
            "name": "MIKA_MCP_URL",
            "description": { "zh": "Mika MCP 服务地址，例如 http://192.168.130.49:8765/mcp", "en": "Mika MCP endpoint, e.g. http://192.168.130.49:8765/mcp" },
            "required": true
        },
        {
            "name": "MIKA_MCP_TOKEN",
            "description": { "zh": "Mika MCP Bearer 令牌（Authorization: Bearer <token>）", "en": "Mika MCP bearer token" },
            "required": true
        }
    ],
    "enabledByDefault": false,
    "tools": [
        {
            "name": "run_task",
            "description": {
                "zh": "向 Mika 下发一个自然语言目标，Agent 会在手机后台虚拟屏上自动执行。返回任务 task_id 与初始状态，之后可用 task_status / wait_task 跟踪。可选传入 conversation（接续已有对话的上下文 ID）。",
                "en": "Send a natural-language goal to Mika. The Agent runs it on the phone's background virtual display. Returns task_id; track with task_status / wait_task. Optional conversation id to continue an existing thread."
            },
            "parameters": [
                { "name": "goal", "description": { "zh": "要让 Agent 完成的目标（自然语言）", "en": "Goal for the Agent (natural language)." }, "type": "string", "required": true },
                { "name": "conversation", "description": { "zh": "接续已有对话的上下文 ID（可选）", "en": "Conversation id to continue (optional)." }, "type": "string", "required": false }
            ]
        },
        {
            "name": "task_status",
            "description": {
                "zh": "查询某个 Mika 任务的当前状态与结果。状态机：starting → running/queued/paused/waiting_for_answer/waiting_on_phone → done/failed/cancelled。",
                "en": "Query current status and result of a Mika task. State machine: starting → running/queued/paused/waiting_for_answer/waiting_on_phone → done/failed/cancelled."
            },
            "parameters": [
                { "name": "task_id", "description": { "zh": "任务 ID", "en": "Task id." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "wait_task",
            "description": {
                "zh": "阻塞等待某个 Mika 任务到达终态（done/failed/cancelled）或超时。timeout_s 最大 50 秒（MCP 服务端限制），需要更长请轮询 task_status 或多次调用。",
                "en": "Block until a Mika task reaches a terminal state (done/failed/cancelled) or times out. timeout_s is capped at 50s by the MCP server; poll task_status for longer waits."
            },
            "parameters": [
                { "name": "task_id", "description": { "zh": "任务 ID", "en": "Task id." }, "type": "string", "required": true },
                { "name": "timeout_s", "description": { "zh": "等待超时秒数，最大 50", "en": "Timeout in seconds, max 50." }, "type": "number", "required": false }
            ]
        },
        {
            "name": "answer",
            "description": {
                "zh": "当任务处于 waiting_for_answer 状态时，回答 Agent 提出的问题，任务将继续执行。",
                "en": "Answer an Agent question when a task is in waiting_for_answer state; the task then resumes."
            },
            "parameters": [
                { "name": "task_id", "description": { "zh": "任务 ID", "en": "Task id." }, "type": "string", "required": true },
                { "name": "text", "description": { "zh": "回答内容", "en": "Answer text." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "steer_task",
            "description": {
                "zh": "在任务运行过程中追加/修改指令，对正在执行的任务进行引导（语义因服务端实现而异，通常是向当前任务注入新意图）。",
                "en": "Steer a running task by injecting new intent mid-flight (semantics follow the server implementation)."
            },
            "parameters": [
                { "name": "task_id", "description": { "zh": "任务 ID", "en": "Task id." }, "type": "string", "required": true },
                { "name": "goal", "description": { "zh": "新的目标/指令", "en": "New goal / instruction." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "cancel_task",
            "description": {
                "zh": "取消某个 Mika 任务，使其进入 cancelled 终态。",
                "en": "Cancel a Mika task; it transitions to the cancelled terminal state."
            },
            "parameters": [
                { "name": "task_id", "description": { "zh": "任务 ID", "en": "Task id." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "list_tasks",
            "description": {
                "zh": "列出 Mika 服务上的任务记录（具体过滤参数以服务端实现为准）。",
                "en": "List tasks known to the Mika server (filter params follow the server implementation)."
            },
            "parameters": []
        },
        {
            "name": "device_state",
            "description": {
                "zh": "查看 Mika 设备侧就绪情况：enabled（MCP 使能）、credential_configured（凭据已配置）、helper_available（辅助服务可用）、device_locked（设备是否锁屏）、ready（是否可派任务）。ready 为 false 时常因 device_locked，可先 wake_device 再 unlock_device。",
                "en": "Check Mika device readiness: enabled, credential_configured, helper_available, device_locked, ready. When ready=false due to device_locked, call wake_device then unlock_device first."
            },
            "parameters": []
        },
        {
            "name": "wake_device",
            "description": {
                "zh": "唤醒 Mika 所在手机的屏幕（通常配合 unlock_device 使用）。",
                "en": "Wake the Mika phone screen (usually followed by unlock_device)."
            },
            "parameters": []
        },
        {
            "name": "unlock_device",
            "description": {
                "zh": "解锁 Mika 所在手机的屏幕（需设备已配置凭据）。解锁后设备进入 ready，才能下发任务。",
                "en": "Unlock the Mika phone screen (credentials must be configured). After unlock the device becomes ready for tasks."
            },
            "parameters": []
        },
        {
            "name": "check_config",
            "description": {
                "zh": "检查本包的环境配置（MIKA_MCP_URL / MIKA_MCP_TOKEN 是否填写）并尝试连接 Mika MCP 服务（initialize 握手），返回连接诊断结果。",
                "en": "Check this package's env config (MIKA_MCP_URL / MIKA_MCP_TOKEN) and probe the Mika MCP server with an initialize handshake; returns connection diagnostics."
            },
            "parameters": []
        }
    ]
}
*/

// src/main.ts
function ok(message, data) {
  return { success: true, message, data };
}
function fail(message, data) {
  return { success: false, message, data };
}
function env(key) {
  try {
    if (typeof getEnv === "function") return getEnv(key);
  } catch (e) {
  }
  return void 0;
}
function requireEnv(key) {
  const v = env(key);
  if (!v || !String(v).trim()) throw new MikaConfigError("\u73AF\u5883\u53D8\u91CF " + key + " \u672A\u914D\u7F6E\u3002\u8BF7\u5728\u300C\u73AF\u5883\u914D\u7F6E\u300D\u4E2D\u586B\u5199\u540E\u518D\u4F7F\u7528\u672C\u5305\u3002");
  return String(v).trim();
}
var MikaConfigError = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "MikaConfigError";
  }
};
var PROTOCOL_VERSION = "2025-06-18";
var CLIENT_NAME = "operit-mika-bridge";
var rpcSeq = 1;
function mcpUrl() {
  return requireEnv("MIKA_MCP_URL");
}
function authHeaders() {
  const token = env("MIKA_MCP_TOKEN");
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
  };
  if (token && String(token).trim()) headers["Authorization"] = "Bearer " + String(token).trim();
  return headers;
}
function parseRpcBody(body, id) {
  const trimmed = (body || "").trim();
  if (!trimmed) throw new Error("MCP \u8FD4\u56DE\u7A7A\u54CD\u5E94\u4F53");
  if (trimmed.startsWith("{")) {
    const obj = JSON.parse(trimmed);
    if (obj.jsonrpc && typeof obj.result !== "undefined") return obj.result;
    if (obj.jsonrpc && obj.error) throw new Error("MCP \u9519\u8BEF " + (obj.error.code || "") + ": " + (obj.error.message || JSON.stringify(obj.error)));
    return obj;
  }
  const dataLines = [];
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    else if (line.startsWith("event:")) continue;
    else if (line.trim() && !dataLines.length) dataLines.push(line.trim());
  }
  if (!dataLines.length) throw new Error("MCP \u54CD\u5E94\u4F53\u65E0\u6CD5\u89E3\u6790: " + trimmed.slice(0, 200));
  for (const raw of dataLines) {
    if (!raw || raw === "[DONE]") continue;
    try {
      const obj = JSON.parse(raw);
      if (obj.id === id) {
        if (obj.error) throw new Error("MCP \u9519\u8BEF " + (obj.error.code || "") + ": " + (obj.error.message || JSON.stringify(obj.error)));
        return obj.result;
      }
    } catch (e) {
      if (e instanceof SyntaxError) continue;
      throw e;
    }
  }
  throw new Error("MCP \u54CD\u5E94\u4E2D\u672A\u627E\u5230 id=" + id + " \u7684\u7ED3\u679C");
}
async function rpc(method, params) {
  const id = rpcSeq++;
  const payload = JSON.stringify({ jsonrpc: "2.0", id, method, params: params || {} });
  let resp;
  try {
    resp = await Tools.Net.http({
      url: mcpUrl(),
      method: "POST",
      headers: authHeaders(),
      body: payload,
      responseType: "text",
      connect_timeout: 15e3,
      read_timeout: 3e4,
      ignore_ssl: true
    });
  } catch (e) {
    throw new Error("\u8C03\u7528 Mika MCP \u7F51\u7EDC\u5931\u8D25: " + errMessage(e));
  }
  if (!resp || resp.statusCode === void 0) throw new Error("Mika MCP \u65E0\u54CD\u5E94\uFF08statusCode \u7F3A\u5931\uFF09");
  if (resp.statusCode !== 200) {
    const snippet = typeof resp.content === "string" ? String(resp.content).slice(0, 300) : "";
    throw new Error("Mika MCP HTTP " + resp.statusCode + (resp.statusMessage ? " " + resp.statusMessage : "") + (snippet ? " | " + snippet : ""));
  }
  return parseRpcBody(typeof resp.content === "string" ? resp.content : "", id);
}
function errMessage(e) {
  if (!e) return "unknown error";
  if (typeof e === "string") return e;
  if (e.message) return e.message;
  try {
    return JSON.stringify(e);
  } catch (_) {
    return String(e);
  }
}
async function initialize() {
  return await rpc("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: CLIENT_NAME, version: "1.0.0" }
  });
}
async function callMcpTool(name, args) {
  const result = await rpc("tools/call", { name, arguments: args || {} });
  return unwrapToolResult(result);
}
function unwrapToolResult(result) {
  if (!result) return void 0;
  if (typeof result === "string") return result;
  if (Array.isArray(result.content)) {
    const texts = [];
    for (const item of result.content) {
      if (item && item.type === "text" && typeof item.text === "string") texts.push(item.text);
    }
    const joined = texts.join("\n");
    if (result.isError) throw new Error("Mika \u5DE5\u5177\u8FD4\u56DE\u9519\u8BEF: " + joined);
    if (joined) {
      const trimmed = joined.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          return JSON.parse(trimmed);
        } catch (_) {
        }
      }
      return joined;
    }
  }
  return result;
}
function extractTaskId(raw) {
  if (!raw) return void 0;
  if (typeof raw === "string") {
    const m = raw.match(/"task_id"\s*:\s*"([^"]+)"/);
    if (m) return m[1];
    return void 0;
  }
  if (raw.task_id) return String(raw.task_id);
  if (raw.data && raw.data.task_id) return String(raw.data.task_id);
  if (raw.result && raw.result.task_id) return String(raw.result.task_id);
  if (raw.taskId) return String(raw.taskId);
  return void 0;
}
async function runTask(params) {
  const goal = strParam(params, "goal", true);
  const args = { goal };
  const conversation = strParam(params, "conversation", false);
  if (conversation) args.conversation = conversation;
  const raw = await callMcpTool("mika_run_task", args);
  const taskId = extractTaskId(raw);
  if (!taskId) {
    return fail("Mika \u5DF2\u53D7\u7406\u4F46\u672A\u8FD4\u56DE task_id\uFF0C\u65E0\u6CD5\u8DDF\u8E2A\u3002\u539F\u59CB\u8FD4\u56DE: " + summarize(raw), { raw });
  }
  return ok("\u5DF2\u4E0B\u53D1\u4EFB\u52A1\uFF08task_id=" + taskId + "\uFF09\u3002\u53EF\u7528 task_status / wait_task \u8DDF\u8E2A\u8FDB\u5EA6\u3002", {
    task_id: taskId,
    goal,
    raw
  });
}
async function taskStatus(params) {
  const taskId = strParam(params, "task_id", true);
  const raw = await callMcpTool("mika_task_status", { task_id: taskId });
  return ok("\u4EFB\u52A1 " + taskId + " \u72B6\u6001\u67E5\u8BE2\u6210\u529F\u3002", { task_id: taskId, raw });
}
async function waitTask(params) {
  const taskId = strParam(params, "task_id", true);
  let timeoutS = numParam(params, "timeout_s", false);
  if (timeoutS === void 0) timeoutS = 50;
  if (timeoutS < 1) timeoutS = 1;
  if (timeoutS > 50) timeoutS = 50;
  const raw = await callMcpTool("mika_wait_task", { task_id: taskId, timeout_s: timeoutS });
  return ok("\u7B49\u5F85\u4EFB\u52A1 " + taskId + " \u8FD4\u56DE\uFF08timeout_s=" + timeoutS + "\uFF09\u3002", { task_id: taskId, raw });
}
async function answerTask(params) {
  const taskId = strParam(params, "task_id", true);
  const text = strParam(params, "text", true);
  const raw = await callMcpTool("mika_answer", { task_id: taskId, text });
  return ok("\u5DF2\u5411\u4EFB\u52A1 " + taskId + " \u63D0\u4EA4\u56DE\u7B54\u3002", { task_id: taskId, raw });
}
async function steerTask(params) {
  const taskId = strParam(params, "task_id", true);
  const goal = strParam(params, "goal", true);
  const raw = await callMcpTool("mika_steer_task", { task_id: taskId, goal });
  return ok("\u5DF2\u5411\u4EFB\u52A1 " + taskId + " \u6CE8\u5165\u65B0\u6307\u4EE4\u3002", { task_id: taskId, raw });
}
async function cancelTask(params) {
  const taskId = strParam(params, "task_id", true);
  const raw = await callMcpTool("mika_cancel_task", { task_id: taskId });
  return ok("\u5DF2\u53D6\u6D88\u4EFB\u52A1 " + taskId + "\u3002", { task_id: taskId, raw });
}
async function listTasks(params) {
  const raw = await callMcpTool("mika_list_tasks", {});
  return ok("\u4EFB\u52A1\u5217\u8868\u67E5\u8BE2\u6210\u529F\u3002", { raw });
}
async function deviceState(params) {
  const raw = await callMcpTool("mika_device_state", {});
  const ready = raw && typeof raw.ready === "boolean" ? raw.ready : void 0;
  let hint = "";
  if (ready === false) {
    const locked = raw && raw.device_locked;
    hint = locked ? "\u8BBE\u5907\u672A\u5C31\u7EEA\uFF1Adevice_locked=true\u3002\u5EFA\u8BAE\u5148 wake_device \u518D unlock_device\uFF0C\u7136\u540E\u91CD\u65B0\u67E5\u8BE2\u3002" : "\u8BBE\u5907\u672A\u5C31\u7EEA\uFF08ready=false\uFF09\u3002\u8BF7\u68C0\u67E5 enabled / credential_configured / helper_available\u3002";
  } else if (ready === true) {
    hint = "\u8BBE\u5907\u5DF2\u5C31\u7EEA\uFF0C\u53EF\u4EE5\u76F4\u63A5 run_task \u4E0B\u53D1\u4EFB\u52A1\u3002";
  }
  return ok("\u8BBE\u5907\u72B6\u6001\u67E5\u8BE2\u6210\u529F\u3002" + hint, { ready, raw });
}
async function wakeDevice(params) {
  const raw = await callMcpTool("mika_wake_device", {});
  return ok("\u5DF2\u53D1\u9001\u5524\u9192\u6307\u4EE4\u3002", { raw });
}
async function unlockDevice(params) {
  const raw = await callMcpTool("mika_unlock_device", {});
  return ok("\u5DF2\u53D1\u9001\u89E3\u9501\u6307\u4EE4\u3002\u89E3\u9501\u540E\u5EFA\u8BAE\u7528 device_state \u786E\u8BA4 ready=true \u518D\u4E0B\u53D1\u4EFB\u52A1\u3002", { raw });
}
async function checkConfig(params) {
  const url = env("MIKA_MCP_URL");
  const token = env("MIKA_MCP_TOKEN");
  const rows = [];
  rows.push("MIKA_MCP_URL   : " + (url ? url : "(\u672A\u914D\u7F6E)"));
  rows.push("MIKA_MCP_TOKEN : " + (token ? "\u5DF2\u914D\u7F6E(" + String(token).length + " \u5B57\u7B26\uFF0CBearer)" : "(\u672A\u914D\u7F6E)"));
  if (!url || !String(url).trim()) return fail("\u914D\u7F6E\u4E0D\u5B8C\u6574\uFF1A\n" + rows.join("\n"), { configured: false });
  if (!token || !String(token).trim()) return fail("\u914D\u7F6E\u4E0D\u5B8C\u6574\uFF1A\n" + rows.join("\n"), { configured: false });
  let init = void 0;
  try {
    init = await initialize();
  } catch (e) {
    return fail("\u914D\u7F6E\u5DF2\u586B\u5199\u4F46\u8FDE\u63A5 Mika MCP \u5931\u8D25: " + errMessage(e), {
      configured: true,
      url,
      server_info: void 0
    });
  }
  const serverName = init && init.serverInfo ? init.serverInfo.name : void 0;
  const serverVer = init && init.serverInfo ? init.serverInfo.version : void 0;
  const proto = init && init.protocolVersion ? init.protocolVersion : void 0;
  rows.push("");
  rows.push("\u8FDE\u63A5\u6210\u529F\uFF1Aserver=" + (serverName || "?") + " version=" + (serverVer || "?") + " protocol=" + (proto || "?"));
  let toolCount = void 0;
  try {
    const list = await rpc("tools/list", {});
    toolCount = list && Array.isArray(list.tools) ? list.tools.length : void 0;
    rows.push("\u670D\u52A1\u7AEF\u5DE5\u5177\u6570: " + (toolCount !== void 0 ? toolCount : "?"));
  } catch (_) {
  }
  return ok(rows.join("\n"), {
    configured: true,
    url,
    server_info: init && init.serverInfo,
    protocol_version: proto,
    server_tool_count: toolCount
  });
}
function strParam(params, key, required) {
  const v = params ? params[key] : void 0;
  if (v === void 0 || v === null || String(v) === "") {
    if (required) throw new Error("\u7F3A\u5C11\u5FC5\u586B\u53C2\u6570: " + key);
    return "";
  }
  return String(v);
}
function numParam(params, key, required) {
  const v = params ? params[key] : void 0;
  if (v === void 0 || v === null || v === "") {
    if (required) throw new Error("\u7F3A\u5C11\u5FC5\u586B\u53C2\u6570: " + key);
    return void 0;
  }
  const n = Number(v);
  if (isNaN(n)) throw new Error("\u53C2\u6570 " + key + " \u4E0D\u662F\u6570\u5B57: " + v);
  return n;
}
function summarize(v) {
  if (v === void 0) return "(undefined)";
  if (typeof v === "string") return v.slice(0, 300);
  try {
    return JSON.stringify(v).slice(0, 300);
  } catch (_) {
    return String(v);
  }
}
async function wrapToolExecution(func, params) {
  try {
    const result = await func(params || {});
    complete(result);
  } catch (error) {
    console.error("mika_mcp \u5DE5\u5177\u6267\u884C\u5931\u8D25", error);
    const isConfig = error instanceof MikaConfigError;
    complete({
      success: false,
      message: (isConfig ? "" : "\u5DE5\u5177\u6267\u884C\u65F6\u53D1\u751F\u610F\u5916\u9519\u8BEF: ") + errMessage(error),
      data: isConfig ? { error_type: "config" } : void 0
    });
  }
}
exports.run_task = (params) => wrapToolExecution(runTask, params);
exports.task_status = (params) => wrapToolExecution(taskStatus, params);
exports.wait_task = (params) => wrapToolExecution(waitTask, params);
exports.answer = (params) => wrapToolExecution(answerTask, params);
exports.steer_task = (params) => wrapToolExecution(steerTask, params);
exports.cancel_task = (params) => wrapToolExecution(cancelTask, params);
exports.list_tasks = (params) => wrapToolExecution(listTasks, params);
exports.device_state = (params) => wrapToolExecution(deviceState, params);
exports.wake_device = (params) => wrapToolExecution(wakeDevice, params);
exports.unlock_device = (params) => wrapToolExecution(unlockDevice, params);
exports.check_config = (params) => wrapToolExecution(checkConfig, params);
