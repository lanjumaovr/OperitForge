#!/bin/bash
# Mika MCP 桥接工具 - 构建脚本
# 用法：bash build.sh
# 产物：dist/mika_mcp.js （单文件沙盒包，可直接烧录）

set -u

cd "$(dirname "$0")"

echo "==> 类型检查"
tsc --noEmit || exit 1

echo "==> 提取 METADATA"
mkdir -p dist
# 取出 main.ts 顶部的 /* METADATA ... }*/ 块。esbuild 会把它当注释剥掉，必须单独注入
awk '/^\/\* METADATA/{f=1} f{print} /^\*\//{if(f){f=0; exit}}' src/main.ts > /tmp/mika_metadata.txt
if [ ! -s /tmp/mika_metadata.txt ]; then
  echo "!! 未提取到 METADATA，中止"
  exit 1
fi
echo "   $(wc -l < /tmp/mika_metadata.txt) 行"

echo "==> esbuild 打包"
esbuild src/main.ts \
  --bundle \
  --format=cjs \
  --target=es2020 \
  --platform=neutral \
  --banner:js="$(cat /tmp/mika_metadata.txt)" \
  --outfile=dist/mika_mcp.js || exit 1

echo "==> 校验"
node --check dist/mika_mcp.js || exit 1
head -1 dist/mika_mcp.js | grep -q 'METADATA' || { echo "!! METADATA 未注入"; exit 1; }
for fn in run_task task_status wait_task answer steer_task cancel_task list_tasks device_state wake_device unlock_device check_config; do
  grep -q "exports.$fn" dist/mika_mcp.js || { echo "!! 导出缺失: $fn"; exit 1; }
done

echo "==> 完成"
ls -la dist/mika_mcp.js
echo "烧录：dist/mika_mcp.js"