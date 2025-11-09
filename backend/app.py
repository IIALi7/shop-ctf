# backend/app.py
from flask import Flask, request, redirect, make_response, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)

# إعداد الـ CORS
ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', '')
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": ALLOWED_ORIGIN or "*"}})

# قراءة الفلاج من المتغير البيئي أو من ملف
FLAG = os.environ.get('FLAG') or (open('FLAG').read().strip() if os.path.exists('FLAG') else "CSC{example_flag}")

# المنتجات
ITEMS = {
    "1": {"name": "Sticker", "price": 10},
    "2": {"name": "T-Shirt", "price": 50},
    "99": {"name": "Secret Package", "price": 9999}
}

@app.route('/api/items')
def items():
    return jsonify(ITEMS)

@app.route('/api/login')
def login():
    user = request.args.get('user', 'player')
    resp = make_response(jsonify({"ok": True}))
    resp.set_cookie('user', user, httponly=False)
    resp.set_cookie('balance', '20', httponly=False)  # ثغرة مقصودة
    return resp

@app.route('/api/wallet', methods=['GET', 'POST'])
def wallet():
    if request.method == 'POST':
        bal = request.json.get('balance') if request.is_json else request.form.get('balance')
        resp = make_response(jsonify({"ok": True, "balance": bal}))
        # ثغرة: السيرفر يثق بقيمة الرصيد القادمة من العميل
        resp.set_cookie('balance', str(bal), httponly=False)
        return resp
    balance = request.cookies.get('balance', '0')
    return jsonify({"balance": balance})

@app.route('/api/buy', methods=['POST'])
def buy():
    item = request.json.get('item') if request.is_json else request.form.get('item')
    try:
        balance = int(request.cookies.get('balance', '0'))
    except:
        balance = 0
    price = ITEMS.get(str(item), {}).get('price', 999999)
    if balance >= price:
        if str(item) == "99":
            return jsonify({"ok": True, "flag": FLAG})
        return jsonify({"ok": True, "msg": f"Purchased {ITEMS[str(item)]['name']}"})
    return jsonify({"ok": False, "msg": "Not enough balance"}), 400

@app.route('/')
def home():
    return "Shop API running"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
