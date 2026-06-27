#!/bin/bash
# Future Career Bootcamp 启动器
# 自动启动服务器并打开浏览器

cd "$(dirname "$0")"

# 清理残留进程
lsof -ti:4173 | xargs kill 2>/dev/null
sleep 0.5

# 启动服务器
node server.js &
SERVER_PID=$!

# 等待服务器就绪
for i in $(seq 1 10); do
  if curl -s -o /dev/null http://localhost:4173/ 2>/dev/null; then
    break
  fi
  sleep 0.5
done

# 打开浏览器
open http://localhost:4173/

echo ""
echo "✅ 网站已启动！"
echo "   地址：http://localhost:4173"
echo "   按 Ctrl+C 关闭服务器"
echo ""

# 等待服务器进程
wait $SERVER_PID
