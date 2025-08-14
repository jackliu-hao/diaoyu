/**
 * 钓鱼演练数据记录 API 客户端
 */

// API 配置
const API_BASE_URL = 'http://127.0.0.1:5000';
const API_KEY = 'TEST'; // 本地开发使用


// 工具函数：获取URL中的employee_id参数
function getEmployeeIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('employee_id');
}

// 工具函数：获取当前时间戳
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// 简单请求队列，避免瞬时高并发丢失
const requestQueue = [];
let isSending = false;
async function sendQueued() {
    if (isSending) return;
    isSending = true;
    while (requestQueue.length) {
        const { endpoint, data, resolve } = requestQueue.shift();
        try {
            const res = await sendApiRequest(endpoint, data);
            resolve(res);
        } catch (e) {
            resolve({ status: 'error', message: '网络错误' });
        }
    }
    isSending = false;
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

function enqueue(endpoint, data) {
    return new Promise((resolve) => {
        requestQueue.push({ endpoint, data, resolve });
        sendQueued();
    });
}

// 文件上传（multipart/form-data）
async function uploadFile(sessionId, stepNumber, fieldName, file) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }
    const form = new FormData();
    form.append('session_id', sessionId);
    form.append('employee_id', employeeId);
    form.append('step_number', stepNumber);
    form.append('field_name', fieldName);
    form.append('file', file);

    try {
        const res = await fetch(`${API_BASE_URL}/api/training/upload`, {
            method: 'POST',
            headers: {
                'X-API-Key': API_KEY
            },
            body: form
        });
        if (!res.ok) {
            return { status: 'error', message: '上传失败' };
        }
        return await res.json();
    } catch (err) {
        return { status: 'error', message: '网络错误' };
    }
}

// API 1: 记录用户开始演练
async function recordStart() {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    const data = {
        employee_id: employeeId,
        timestamp: getCurrentTimestamp()
    };

    return await enqueue('/api/training/start', data);
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

    return await enqueue('/api/training/step', data);
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

    return await enqueue('/api/training/form', data);
}

// API 4: 记录用户完成演练
async function recordCompletion(sessionId, verificationCode) {
    const employeeId = getEmployeeIdFromURL();
    if (!employeeId) {
        console.error('未找到employee_id参数');
        return { status: 'error', message: '缺少员工ID' };
    }

    // 验证码加密处理（示例：Base64）
    const encryptedCode = btoa(verificationCode);

    const data = {
        session_id: sessionId,
        employee_id: employeeId,
        verification_code: encryptedCode,
        timestamp: getCurrentTimestamp()
    };

    return await enqueue('/api/training/complete', data);
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

    return await enqueue('/api/training/close', data);
}

// 导出公共接口
window.PhishingTrainingAPI = {
    recordStart,
    recordStep,
    recordFormInput,
    recordCompletion,
    recordClose,
    getEmployeeIdFromURL,
    uploadFile
};