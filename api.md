# 钓鱼演练数据记录 API 文档

## 概述

本文档描述了用于记录内部员工钓鱼演练数据的 API 接口。这些接口用于收集员工在模拟补贴申领流程中的行为数据，以评估安全意识水平。

## 基础信息

- Base URL: `https://api.phishing-training.internal`
- Content-Type: `application/json`
- 认证方式: API Key (在请求头中添加 `X-API-Key`)

## 接口列表

### 1. 记录用户开始演练

**接口地址**: `/api/training/start`

**请求方法**: POST

**请求参数**:
```json
{
  "employee_id": "员工ID（从URL中获取）",
  "timestamp": "时间戳"
}
```

**响应结果**:
```json
{
  "status": "success",
  "message": "记录成功",
  "session_id": "本次演练的会话ID"
}
```

### 2. 记录用户进入步骤

**接口地址**: `/api/training/step`

**请求方法**: POST

**请求参数**:
```json
{
  "session_id": "会话ID",
  "employee_id": "员工ID",
  "step_number": "步骤编号(1-5)",
  "step_name": "步骤名称",
  "timestamp": "时间戳"
}
```

**响应结果**:
```json
{
  "status": "success",
  "message": "记录成功"
}
```

### 3. 记录用户填写表单数据

**接口地址**: `/api/training/form`

**请求方法**: POST

**请求参数**:
```json
{
  "session_id": "会话ID",
  "employee_id": "员工ID",
  "step_number": "步骤编号",
  "field_name": "字段名称",
  "field_value": "字段值(敏感信息需加密或脱敏处理)",
  "timestamp": "时间戳"
}
```

**响应结果**:
```json
{
  "status": "success",
  "message": "记录成功"
}
```

### 4. 记录用户完成演练

**接口地址**: `/api/training/complete`

**请求方法**: POST

**请求参数**:
```json
{
  "session_id": "会话ID",
  "employee_id": "员工ID",
  "verification_code": "验证码(需加密处理)",
  "timestamp": "时间戳"
}
```

**响应结果**:
```json
{
  "status": "success",
  "message": "演练完成，记录成功"
}
```

### 5. 记录用户关闭弹窗

**接口地址**: `/api/training/close`

**请求方法**: POST

**请求参数**:
```json
{
  "session_id": "会话ID",
  "employee_id": "员工ID",
  "step_number": "关闭时所在的步骤编号",
  "timestamp": "时间戳"
}
```

**响应结果**:
```json
{
  "status": "success",
  "message": "记录成功"
}
```

## 数据字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| employee_id | String | 员工唯一标识（从URL中获取） |
| session_id | String | 演练会话ID |
| step_number | Integer | 步骤编号(1-5) |
| step_name | String | 步骤名称 |
| field_name | String | 表单字段名称 |
| field_value | String | 表单字段值 |
| timestamp | String | ISO 8601 格式时间戳 |

## 安全说明

1. 所有请求必须通过 HTTPS 进行传输
2. 敏感信息(如身份证号、银行卡号、验证码等)需要加密或脱敏处理
3. 每个请求必须包含有效的 API Key 认证
4. 服务器端需要对数据进行验证和过滤，防止注入攻击