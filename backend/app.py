import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# ✅ FIXED CORS (IMPORTANT CHANGE)
CORS(app)

@app.after_request
def set_security_headers(response):
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# ─── MongoDB ──────────────────────────────────────────
db = None
try:
    from pymongo import MongoClient
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/finai_db")
    if "localhost" in mongo_uri or "127.0.0.1" in mongo_uri:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
    else:
        import certifi
        client = MongoClient(mongo_uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    db = client.get_database("finai_db")
    logger.info("✅ MongoDB connected")
except Exception as e:
    logger.error(f"⚠️ MongoDB unavailable: {str(e)}")

# ─── Agents ──────────────────────────────────────────
from agents.orchestrator import OrchestratorAgent
from agents.chat import ChatAgent
from agents.financial import FinancialAnalysisAgent
from agents.planning import PlanningAgent
from agents.tax import TaxAgent
from agents.recommendation import RecommendationAgent
from agents.couples import CouplesAgent
from agents.portfolio import PortfolioAgent
from werkzeug.security import generate_password_hash, check_password_hash

orchestrator  = OrchestratorAgent()
chat_agent    = ChatAgent()
fin_agent     = FinancialAnalysisAgent()
plan_agent    = PlanningAgent()
tax_agent     = TaxAgent()
rec_agent     = RecommendationAgent()
couples_agent = CouplesAgent()
portfolio_agent = PortfolioAgent()

import datetime

def log_interaction(tool_name, user_id, request_data, result_data):
    if db is not None:
        try:
            now = datetime.datetime.utcnow()
            db["users_state"].update_one(
                {"user_id": user_id},
                {"$set": {
                    f"latest_{tool_name}": result_data,
                    f"inputs_{tool_name}": request_data,
                    "last_active": now
                }},
                upsert=True
            )
            
            db["admin_logs"].insert_one({
                "user_id": user_id,
                "tool_used": tool_name,
                "timestamp": now,
                "inputs": request_data,
                "outputs": result_data
            })
        except Exception as e:
            print(f"DB write error: {e}")

# ─── Routes ──────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "db_connected": db is not None}), 200

def get_user_id(data):
    return request.headers.get("X-User-Id", data.get("user_id", "anonymous"))

# ─── Auth ──────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    if db is None:
        return jsonify({"error": "Database service unavailable"}), 503
    try:
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if db.users.find_one({"email": email}):
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = generate_password_hash(password)

        import uuid
        user_id = f"usr_{uuid.uuid4().hex[:12]}"

        db.users.insert_one({
            "user_id": user_id,
            "username": username,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.datetime.utcnow()
        })

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        logger.error(e)
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/auth/signin", methods=["POST"])
def signin():
    if db is None:
        return jsonify({"error": "Database service unavailable"}), 503

    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        user = db.users.find_one({"email": email})

        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:
        logger.error(e)
        return jsonify({"error": "Internal server error"}), 500


# ─── APIs ──────────────────────────────────────────

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.json
    result = orchestrator.process(data)
    return jsonify(result)


@app.route("/api/health-score", methods=["POST"])
def health_score():
    data = request.json
    return jsonify(fin_agent.analyze(data))


@app.route("/api/fire-plan", methods=["POST"])
def fire_plan():
    data = request.json
    fin = fin_agent.analyze(data)
    tax = tax_agent.optimize(data)
    plan = plan_agent.plan(data, fin, tax)
    return jsonify({"financial": fin, "plan": plan})


@app.route("/api/tax", methods=["POST"])
def tax():
    data = request.json
    return jsonify(tax_agent.optimize(data))


@app.route("/api/couples-plan", methods=["POST"])
def couples_plan():
    data = request.json
    result = couples_agent.plan(data)
    user_id = get_user_id(data)
    log_interaction("couples_plan", user_id, data, result)
    return jsonify(result)


@app.route("/api/life-event", methods=["POST"])
def life_event():
    data = request.json
    result = rec_agent.recommend(data)
    user_id = get_user_id(data)
    log_interaction("life_event", user_id, data, result)
    return jsonify({"recommendations": result})


@app.route("/api/portfolio-xray", methods=["POST"])
def portfolio_xray():
    data = request.json
    result = portfolio_agent.analyze(data)
    user_id = get_user_id(data)
    log_interaction("portfolio_xray", user_id, data, result)
    return jsonify(result)


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    return jsonify({"response": chat_agent.respond(data.get("message", ""))})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)