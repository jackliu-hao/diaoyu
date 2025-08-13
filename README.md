# 部署与一键启动

## 先决条件
- 服务器已安装 Docker 与 docker-compose

## 步骤
1. 生成用户名/密码（基本认证）：
   - 使用 Makefile（推荐）：
     ```bash
     make htpasswd USER=admin PASS=secret
     ```
   - 或者手动生成 `.htpasswd` 并放置到 `nginx/.htpasswd`。

2. 构建并启动：
   ```bash
   make all
   # 或
   make build && make up
   ```

3. 访问：
   - 浏览器打开 `http://<你的服务器IP>/?employee_id=E123`
   - 输入第 1 步设置的用户名/密码

4. 日志与数据：
   - 后端写入容器卷 `app_logs`，对应 Flask 容器内 `/app/logs/training_records.xlsx`

## 常用命令
- 查看日志：`make logs`
- 重启：`make restart`
- 关闭：`make down`
- 清理（会删除 `.htpasswd` 与数据卷）：`make clean`

## 说明
- Nginx 作为反向代理，所有请求通过基本认证保护。
- Flask 使用 Gunicorn 在 5000 端口提供服务，Nginx 暴露 80 端口。
- 如需要 HTTPS，可在 `nginx/nginx.conf` 中添加证书配置，或使用反向代理/负载均衡器终止 TLS。