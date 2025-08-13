# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# 替换 apt 源为阿里云镜像并安装系统依赖
RUN sed -i 's@deb.debian.org@mirrors.aliyun.com@g' /etc/apt/sources.list \
 && sed -i 's@security.debian.org@mirrors.aliyun.com@g' /etc/apt/sources.list \
 && apt-get update -y \
 && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt \
 && pip install --no-cache-dir gunicorn==21.2.0

# 复制应用代码
COPY app.py /app/app.py
COPY api.js /app/api.js
COPY api.md /app/api.md
COPY services_singlefile_online_flow_responsive.html /app/services_singlefile_online_flow_responsive.html
COPY img /app/img

# 创建日志目录
RUN mkdir -p /app/logs

EXPOSE 5000

# 使用 Gunicorn 启动 Flask 应用
CMD ["gunicorn", "--bind=0.0.0.0:5000", "--workers=2", "--threads=4", "--timeout=60", "app:app"]
