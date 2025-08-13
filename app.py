from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import datetime
import base64
import json
import os

app = Flask(__name__)
CORS(app)  # 启用跨域支持

# 确保logs目录存在
if not os.path.exists('logs'):
    os.makedirs('logs')

# 模拟数据库存储
training_data = {
    'sessions': {},
    'steps': [],
    'forms': [],
    'completions': [],
    'closures': []
}

# 工具函数：验证API Key
def verify_api_key():
    api_key = request.headers.get('X-API-Key')
    # 在实际应用中，应该验证API Key的有效性
    # 这里简化处理，只要存在即可
    return api_key is not None

# 工具函数：验证请求数据
def validate_request_data(required_fields):
    data = request.get_json()
    if not data:
        return False, "缺少JSON数据"
    
    for field in required_fields:
        if field not in data:
            return False, f"缺少必需字段: {field}"
    
    return True, data

# 工具函数：将记录写入文件
def write_record_to_file(record_type, data):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d")
    filename = f"logs/training_{record_type}_{timestamp}.log"
    
    # 添加写入时间
    data['write_time'] = datetime.datetime.now().isoformat()
    
    with open(filename, 'a', encoding='utf-8') as f:
        f.write(json.dumps(data, ensure_ascii=False) + '\n')

# API 1: 记录用户开始演练
@app.route('/api/training/start', methods=['POST'])
def record_start():
    if not verify_api_key():
        return jsonify({'status': 'error', 'message': '无效的API Key'}), 401
    
    is_valid, data = validate_request_data(['employee_id'])
    if not is_valid:
        return jsonify({'status': 'error', 'message': data}), 400
    
    # 创建新的会话ID
    session_id = str(uuid.uuid4())
    
    # 存储会话信息
    training_data['sessions'][session_id] = {
        'employee_id': data['employee_id'],
        'start_time': data.get('timestamp', datetime.datetime.now().isoformat())
    }
    
    # 写入文件
    write_record_to_file('start', {
        'session_id': session_id,
        'employee_id': data['employee_id'],
        'timestamp': data.get('timestamp', datetime.datetime.now().isoformat())
    })
    
    print(f"开始演练: 员工ID={data['employee_id']}, 会话ID={session_id}")
    
    return jsonify({
        'status': 'success',
        'message': '记录成功',
        'session_id': session_id
    })

# API 2: 记录用户进入步骤
@app.route('/api/training/step', methods=['POST'])
def record_step():
    if not verify_api_key():
        return jsonify({'status': 'error', 'message': '无效的API Key'}), 401
    
    is_valid, data = validate_request_data(['session_id', 'employee_id', 'step_number', 'step_name'])
    if not is_valid:
        return jsonify({'status': 'error', 'message': data}), 400
    
    # 检查会话是否存在
    if data['session_id'] not in training_data['sessions']:
        return jsonify({'status': 'error', 'message': '无效的会话ID'}), 400
    
    # 记录步骤信息
    step_record = {
        'session_id': data['session_id'],
        'employee_id': data['employee_id'],
        'step_number': data['step_number'],
        'step_name': data['step_name'],
        'timestamp': data.get('timestamp', datetime.datetime.now().isoformat())
    }
    
    training_data['steps'].append(step_record)
    
    print(f"进入步骤: 员工ID={data['employee_id']}, 步骤={data['step_name']}")
    
    return jsonify({
        'status': 'success',
        'message': '记录成功'
    })

# API 3: 记录用户填写表单数据
@app.route('/api/training/form', methods=['POST'])
def record_form_input():
    if not verify_api_key():
        return jsonify({'status': 'error', 'message': '无效的API Key'}), 401
    
    is_valid, data = validate_request_data(['session_id', 'employee_id', 'step_number', 'field_name', 'field_value'])
    if not is_valid:
        return jsonify({'status': 'error', 'message': data}), 400
    
    # 检查会话是否存在
    if data['session_id'] not in training_data['sessions']:
        return jsonify({'status': 'error', 'message': '无效的会话ID'}), 400
    
    # 记录表单数据
    form_record = {
        'session_id': data['session_id'],
        'employee_id': data['employee_id'],
        'step_number': data['step_number'],
        'field_name': data['field_name'],
        'field_value': data['field_value'],  # 不进行脱敏处理
        'timestamp': data.get('timestamp', datetime.datetime.now().isoformat())
    }
    
    training_data['forms'].append(form_record)
    
    print(f"表单输入: 员工ID={data['employee_id']}, 字段={data['field_name']}, 值={data['field_value']}")
    
    return jsonify({
        'status': 'success',
        'message': '记录成功'
    })

# API 4: 记录用户完成演练
@app.route('/api/training/complete', methods=['POST'])
def record_completion():
    if not verify_api_key():
        return jsonify({'status': 'error', 'message': '无效的API Key'}), 401
    
    is_valid, data = validate_request_data(['session_id', 'employee_id', 'verification_code'])
    if not is_valid:
        return jsonify({'status': 'error', 'message': data}), 400
    
    # 检查会话是否存在
    if data['session_id'] not in training_data['sessions']:
        return jsonify({'status': 'error', 'message': '无效的会话ID'}), 400
    
    # 解码验证码（示例性处理）
    try:
        decoded_code = base64.b64decode(data['verification_code']).decode('utf-8')
    except Exception:
        decoded_code = data['verification_code']  # 如果解码失败，使用原始值
    
    # 记录完成信息
    completion_record = {
        'session_id': data['session_id'],
        'employee_id': data['employee_id'],
        'verification_code': decoded_code,
        'timestamp': data.get('timestamp', datetime.datetime.now().isoformat())
    }
    
    training_data['completions'].append(completion_record)
    
    print(f"完成演练: 员工ID={data['employee_id']}, 验证码={decoded_code}")
    
    return jsonify({
        'status': 'success',
        'message': '演练完成，记录成功'
    })

# API 5: 记录用户关闭弹窗
@app.route('/api/training/close', methods=['POST'])
def record_close():
    if not verify_api_key():
        return jsonify({'status': 'error', 'message': '无效的API Key'}), 401
    
    is_valid, data = validate_request_data(['session_id', 'employee_id', 'step_number'])
    if not is_valid:
        return jsonify({'status': 'error', 'message': data}), 400
    
    # 检查会话是否存在
    if data['session_id'] not in training_data['sessions']:
        return jsonify({'status': 'error', 'message': '无效的会话ID'}), 400
    
    # 记录关闭信息
    close_record = {
        'session_id': data['session_id'],
        'employee_id': data['employee_id'],
        'step_number': data['step_number'],
        'timestamp': data.get('timestamp', datetime.datetime.now().isoformat())
    }
    
    training_data['closures'].append(close_record)
    
    print(f"关闭弹窗: 员工ID={data['employee_id']}, 步骤={data['step_number']}")
    
    return jsonify({
        'status': 'success',
        'message': '记录成功'
    })

# 用于查看收集到的数据（仅用于测试）
@app.route('/api/training/data', methods=['GET'])
def get_training_data():
    return jsonify(training_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)