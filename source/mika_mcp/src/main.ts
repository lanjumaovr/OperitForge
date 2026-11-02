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

/* ------------------------------------------------------------------ */
/* 基础设施                                                            */
/* ------------------------------------------------------------------ */

interface ToolResult {
    success: boolean;
    message: string;
    data?: any;
}

function ok(message: string, data?: any): ToolResult {
    return { success: true, message: message, data: data };
}

function fail(message: string, data?: any): ToolResult {
    return { success: false, message: message, data: data };
}

/** 读取环境变量（沙盒脚本通过全局 getEnv 提供） */
function env(key: string): string | undefined {
    try {
        if (typeof getEnv === 'function') return getEnv(key);
    } catch (e) { /* 全局不存在时忽略 */ }
    return undefined;
}

function requireEnv(key: string): string {
    const v = env(key);
    if (!v || !String(v).trim()) throw new MikaConfigError('环境变量 ' + key + ' 未配置。请在「环境配置」中填写后再使用本包。');
    return String(v).trim();
}

class MikaConfigError extends Error {
    constructor(msg: string) { super(msg); this.name = 'MikaConfigError'; }
}

/* ------------------------------------------------------------------ */
/* MCP 客户端（Streamable HTTP / JSON-RPC 2025-06-18）                 */
/* ------------------------------------------------------------------ */

const PROTOCOL_VERSION = '2025-06-18';
const CLIENT_NAME = 'operit-mika-bridge';
let rpcSeq = 1;

function mcpUrl(): string {
    return requireEnv('MIKA_MCP_URL');
}

function authHeaders(): Record<string, string> {
    const token = env('MIKA_MCP_TOKEN');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
    };
    if (token && String(token).trim()) headers['Authorization'] = 'Bearer ' + String(token).trim();
    return headers;
}

/** 解析 SSE / JSON 响应体，提取出 JSON-RPC result */
function parseRpcBody(body: string, id: number): any {
    const trimmed = (body || '').trim();
    if (!trimmed) throw new Error('MCP 返回空响应体');

    // 情况 1：直接是 JSON 对象
    if (trimmed.startsWith('{')) {
        const obj = JSON.parse(trimmed);
        if (obj.jsonrpc && typeof obj.result !== 'undefined') return obj.result;
        if (obj.jsonrpc && obj.error) throw new Error('MCP 错误 ' + (obj.error.code || '') + ': ' + (obj.error.message || JSON.stringify(obj.error)));
        return obj; // 容错：非标准 JSON-RPC 包装时直接返回
    }

    // 情况 2：SSE 事件流（data: 行）
    const dataLines: string[] = [];
    for (const line of trimmed.split(/\r?\n/)) {
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        else if (line.startsWith('event:')) continue;
        else if (line.trim() && !dataLines.length) dataLines.push(line.trim());
    }
    if (!dataLines.length) throw new Error('MCP 响应体无法解析: ' + trimmed.slice(0, 200));

    for (const raw of dataLines) {
        if (!raw || raw === '[DONE]') continue;
        try {
            const obj = JSON.parse(raw);
            if (obj.id === id) {
                if (obj.error) throw new Error('MCP 错误 ' + (obj.error.code || '') + ': ' + (obj.error.message || JSON.stringify(obj.error)));
                return obj.result;
            }
        } catch (e) {
            if (e instanceof SyntaxError) continue; // 非 JSON 的 data 行跳过
            throw e;
        }
    }
    throw new Error('MCP 响应中未找到 id=' + id + ' 的结果');
}

/** 发起一次 JSON-RPC 调用并返回 result */
async function rpc(method: string, params?: any): Promise<any> {
    const id = rpcSeq++;
    const payload = JSON.stringify({ jsonrpc: '2.0', id: id, method: method, params: params || {} });
    let resp: any;
    try {
        resp = await Tools.Net.http({
            url: mcpUrl(),
            method: 'POST',
            headers: authHeaders(),
            body: payload,
            responseType: 'text',
            connect_timeout: 15000,
            read_timeout: 30000,
            ignore_ssl: true
        });
    } catch (e: any) {
        throw new Error('调用 Mika MCP 网络失败: ' + errMessage(e));
    }
    if (!resp || resp.statusCode === undefined) throw new Error('Mika MCP 无响应（statusCode 缺失）');
    if (resp.statusCode !== 200) {
        const snippet = typeof resp.content === 'string' ? String(resp.content).slice(0, 300) : '';
        throw new Error('Mika MCP HTTP ' + resp.statusCode + (resp.statusMessage ? ' ' + resp.statusMessage : '') + (snippet ? ' | ' + snippet : ''));
    }
    return parseRpcBody(typeof resp.content === 'string' ? resp.content : '', id);
}

function errMessage(e: any): string {
    if (!e) return 'unknown error';
    if (typeof e === 'string') return e;
    if (e.message) return e.message;
    try { return JSON.stringify(e); } catch (_) { return String(e); }
}

/** 握手并返回服务端能力 */
async function initialize(): Promise<any> {
    return await rpc('initialize', {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: CLIENT_NAME, version: '1.0.0' }
    });
}

/** 调用一个 MCP tool（服务端工具名带 mika_ 前缀） */
async function callMcpTool(name: string, args?: any): Promise<any> {
    const result = await rpc('tools/call', { name: name, arguments: args || {} });
    return unwrapToolResult(result);
}

/** MCP tool 结果（content 数组）解包为文本/对象 */
function unwrapToolResult(result: any): any {
    if (!result) return undefined;
    if (typeof result === 'string') return result;
    if (Array.isArray(result.content)) {
        const texts: string[] = [];
        for (const item of result.content) {
            if (item && item.type === 'text' && typeof item.text === 'string') texts.push(item.text);
        }
        const joined = texts.join('\n');
        if (result.isError) throw new Error('Mika 工具返回错误: ' + joined);
        if (joined) {
            // 尝试把内容当 JSON 解析（Mika 的工具普遍返回 JSON 文本）
            const trimmed = joined.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try { return JSON.parse(trimmed); } catch (_) { /* 非 JSON 就返回原文 */ }
            }
            return joined;
        }
    }
    return result;
}

/** 从 MCP tool 结果中稳健地取出 task_id */
function extractTaskId(raw: any): string | undefined {
    if (!raw) return undefined;
    if (typeof raw === 'string') {
        const m = raw.match(/"task_id"\s*:\s*"([^"]+)"/);
        if (m) return m[1];
        return undefined;
    }
    if (raw.task_id) return String(raw.task_id);
    if (raw.data && raw.data.task_id) return String(raw.data.task_id);
    if (raw.result && raw.result.task_id) return String(raw.result.task_id);
    if (raw.taskId) return String(raw.taskId);
    return undefined;
}

/* ------------------------------------------------------------------ */
/* 工具实现                                                            */
/* ------------------------------------------------------------------ */

/** 运行任务 */
async function runTask(params: any): Promise<ToolResult> {
    const goal = strParam(params, 'goal', true);
    const args: any = { goal: goal };
    const conversation = strParam(params, 'conversation', false);
    if (conversation) args.conversation = conversation;

    const raw = await callMcpTool('mika_run_task', args);
    const taskId = extractTaskId(raw);
    if (!taskId) {
        return fail('Mika 已受理但未返回 task_id，无法跟踪。原始返回: ' + summarize(raw), { raw: raw });
    }
    return ok('已下发任务（task_id=' + taskId + '）。可用 task_status / wait_task 跟踪进度。', {
        task_id: taskId,
        goal: goal,
        raw: raw
    });
}

/** 查询任务状态 */
async function taskStatus(params: any): Promise<ToolResult> {
    const taskId = strParam(params, 'task_id', true);
    const raw = await callMcpTool('mika_task_status', { task_id: taskId });
    return ok('任务 ' + taskId + ' 状态查询成功。', { task_id: taskId, raw: raw });
}

/** 等待任务 */
async function waitTask(params: any): Promise<ToolResult> {
    const taskId = strParam(params, 'task_id', true);
    let timeoutS = numParam(params, 'timeout_s', false);
    if (timeoutS === undefined) timeoutS = 50;
    if (timeoutS < 1) timeoutS = 1;
    if (timeoutS > 50) timeoutS = 50; // 服务端上限
    const raw = await callMcpTool('mika_wait_task', { task_id: taskId, timeout_s: timeoutS });
    return ok('等待任务 ' + taskId + ' 返回（timeout_s=' + timeoutS + '）。', { task_id: taskId, raw: raw });
}

/** 回答 Agent 提问 */
async function answerTask(params: any): Promise<ToolResult> {
    const taskId = strParam(params, 'task_id', true);
    const text = strParam(params, 'text', true);
    const raw = await callMcpTool('mika_answer', { task_id: taskId, text: text });
    return ok('已向任务 ' + taskId + ' 提交回答。', { task_id: taskId, raw: raw });
}

/** 引导任务 */
async function steerTask(params: any): Promise<ToolResult> {
    const taskId = strParam(params, 'task_id', true);
    const goal = strParam(params, 'goal', true);
    const raw = await callMcpTool('mika_steer_task', { task_id: taskId, goal: goal });
    return ok('已向任务 ' + taskId + ' 注入新指令。', { task_id: taskId, raw: raw });
}

/** 取消任务 */
async function cancelTask(params: any): Promise<ToolResult> {
    const taskId = strParam(params, 'task_id', true);
    const raw = await callMcpTool('mika_cancel_task', { task_id: taskId });
    return ok('已取消任务 ' + taskId + '。', { task_id: taskId, raw: raw });
}

/** 列出任务 */
async function listTasks(params: any): Promise<ToolResult> {
    const raw = await callMcpTool('mika_list_tasks', {});
    return ok('任务列表查询成功。', { raw: raw });
}

/** 设备状态 */
async function deviceState(params: any): Promise<ToolResult> {
    const raw = await callMcpTool('mika_device_state', {});
    const ready = raw && typeof raw.ready === 'boolean' ? raw.ready : undefined;
    let hint = '';
    if (ready === false) {
        const locked = raw && raw.device_locked;
        hint = locked
            ? '设备未就绪：device_locked=true。建议先 wake_device 再 unlock_device，然后重新查询。'
            : '设备未就绪（ready=false）。请检查 enabled / credential_configured / helper_available。';
    } else if (ready === true) {
        hint = '设备已就绪，可以直接 run_task 下发任务。';
    }
    return ok('设备状态查询成功。' + hint, { ready: ready, raw: raw });
}

/** 唤醒设备 */
async function wakeDevice(params: any): Promise<ToolResult> {
    const raw = await callMcpTool('mika_wake_device', {});
    return ok('已发送唤醒指令。', { raw: raw });
}

/** 解锁设备 */
async function unlockDevice(params: any): Promise<ToolResult> {
    const raw = await callMcpTool('mika_unlock_device', {});
    return ok('已发送解锁指令。解锁后建议用 device_state 确认 ready=true 再下发任务。', { raw: raw });
}

/** 配置与连接诊断 */
async function checkConfig(params: any): Promise<ToolResult> {
    const url = env('MIKA_MCP_URL');
    const token = env('MIKA_MCP_TOKEN');
    const rows: string[] = [];
    rows.push('MIKA_MCP_URL   : ' + (url ? url : '(未配置)'));
    rows.push('MIKA_MCP_TOKEN : ' + (token ? '已配置(' + String(token).length + ' 字符，Bearer)' : '(未配置)'));

    if (!url || !String(url).trim()) return fail('配置不完整：\n' + rows.join('\n'), { configured: false });
    if (!token || !String(token).trim()) return fail('配置不完整：\n' + rows.join('\n'), { configured: false });

    let init: any = undefined;
    try {
        init = await initialize();
    } catch (e: any) {
        return fail('配置已填写但连接 Mika MCP 失败: ' + errMessage(e), {
            configured: true,
            url: url,
            server_info: undefined
        });
    }
    const serverName = init && init.serverInfo ? init.serverInfo.name : undefined;
    const serverVer = init && init.serverInfo ? init.serverInfo.version : undefined;
    const proto = init && init.protocolVersion ? init.protocolVersion : undefined;
    rows.push('');
    rows.push('连接成功：server=' + (serverName || '?') + ' version=' + (serverVer || '?') + ' protocol=' + (proto || '?'));

    // 顺带拉一次工具列表，便于诊断
    let toolCount: number | undefined = undefined;
    try {
        const list: any = await rpc('tools/list', {});
        toolCount = list && Array.isArray(list.tools) ? list.tools.length : undefined;
        rows.push('服务端工具数: ' + (toolCount !== undefined ? toolCount : '?'));
    } catch (_) { /* 非关键路径 */ }

    return ok(rows.join('\n'), {
        configured: true,
        url: url,
        server_info: init && init.serverInfo,
        protocol_version: proto,
        server_tool_count: toolCount
    });
}

/* ------------------------------------------------------------------ */
/* 参数工具                                                            */
/* ------------------------------------------------------------------ */

function strParam(params: any, key: string, required: boolean): string {
    const v = params ? params[key] : undefined;
    if (v === undefined || v === null || String(v) === '') {
        if (required) throw new Error('缺少必填参数: ' + key);
        return '';
    }
    return String(v);
}

function numParam(params: any, key: string, required: boolean): number | undefined {
    const v = params ? params[key] : undefined;
    if (v === undefined || v === null || v === '') {
        if (required) throw new Error('缺少必填参数: ' + key);
        return undefined;
    }
    const n = Number(v);
    if (isNaN(n)) throw new Error('参数 ' + key + ' 不是数字: ' + v);
    return n;
}

function summarize(v: any): string {
    if (v === undefined) return '(undefined)';
    if (typeof v === 'string') return v.slice(0, 300);
    try { return JSON.stringify(v).slice(0, 300); } catch (_) { return String(v); }
}

/* ------------------------------------------------------------------ */
/* 导出                                                                */
/* ------------------------------------------------------------------ */

/** 统一工具执行包装 */
async function wrapToolExecution(func: (params: any) => Promise<ToolResult>, params: any): Promise<void> {
    try {
        const result = await func(params || {});
        complete(result);
    } catch (error: any) {
        console.error('mika_mcp 工具执行失败', error);
        const isConfig = error instanceof MikaConfigError;
        complete({
            success: false,
            message: (isConfig ? '' : '工具执行时发生意外错误: ') + errMessage(error),
            data: isConfig ? { error_type: 'config' } : undefined
        });
    }
}

exports.run_task = (params: any) => wrapToolExecution(runTask, params);
exports.task_status = (params: any) => wrapToolExecution(taskStatus, params);
exports.wait_task = (params: any) => wrapToolExecution(waitTask, params);
exports.answer = (params: any) => wrapToolExecution(answerTask, params);
exports.steer_task = (params: any) => wrapToolExecution(steerTask, params);
exports.cancel_task = (params: any) => wrapToolExecution(cancelTask, params);
exports.list_tasks = (params: any) => wrapToolExecution(listTasks, params);
exports.device_state = (params: any) => wrapToolExecution(deviceState, params);
exports.wake_device = (params: any) => wrapToolExecution(wakeDevice, params);
exports.unlock_device = (params: any) => wrapToolExecution(unlockDevice, params);
exports.check_config = (params: any) => wrapToolExecution(checkConfig, params);
