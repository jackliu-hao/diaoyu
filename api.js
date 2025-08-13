/**
 * 钓鱼演练数据记录 API 客户端
 */

// API 配置
const API_BASE_URL = 'http://127.0.0.1:5000';
const API_KEY = 'YOUR_API_KEY_HERE'; // 在实际部署时替换为有效的API密钥

// 工具函数：获取URL中的employee_id参数
function getEmployeeIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('employee_id');
}

// 工具函数：获取当前时间戳
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// 工具函数：发起API请求
async function sendApiRequest(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error(`API请求失败: ${endpoint}`, await response.text());
            return { status: 'error', message: '请求失败' };
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`API请求出错: ${endpoint}`, error);
        return { status: 'error', message: '网络错误' };
    }
}

// API 1: 记录用户开始演练
async function recordStart(sessionId) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    const data = {
        employee_id: employeeId,
        timestamp: getCurrentTimestamp()
    };

    return await sendApiRequest('/api/training/start', data);
}

// API 2: 记录用户进入步骤
async function recordStep(sessionId, stepNumber, stepName) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    const data = {
        session_id: sessionId,
        employee_id: employeeId,
        step_number: stepNumber,
        step_name: stepName,
        timestamp: getCurrentTimestamp()
    };

    return await sendApiRequest('/api/training/step', data);
}

// API 3: 记录用户填写表单数据
async function recordFormInput(sessionId, stepNumber, fieldName, fieldValue) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    const data = {
        session_id: sessionId,
        employee_id: employeeId,
        step_number: stepNumber,
        field_name: fieldName,
        field_value: fieldValue,
        timestamp: getCurrentTimestamp()
    };

    return await sendApiRequest('/api/training/form', data);
}

// API 4: 记录用户完成演练
async function recordCompletion(sessionId, verificationCode) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    // 验证码加密处理（示例：简单哈希，实际应使用更安全的方法）
    const encryptedCode = btoa(verificationCode); // base64编码作为示例

    const data = {
        session_id: sessionId,
        employee_id: employeeId,
        verification_code: encryptedCode,
        timestamp: getCurrentTimestamp()
    };

    return await sendApiRequest('/api/training/complete', data);
}

// API 5: 记录用户关闭弹窗
async function recordClose(sessionId, stepNumber) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    const data = {
        session_id: sessionId,
        employee_id: employeeId,
        step_number: stepNumber,
        timestamp: getCurrentTimestamp()
    };

    return await sendApiRequest('/api/training/close', data);
}

// 导出公共接口
window.PhishingTrainingAPI = {
    recordStart,
    recordStep,
    recordFormInput,
    recordCompletion,
    recordClose,
    getEmployeeIdFromURL
};