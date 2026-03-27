import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# Configure robust logging instead of raw prints
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Security: Limit maximum payload size to prevent DOS (e.g., 10MB)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# Security: Specific CORS policy
CORS(app, resources={r"/api/*": {"origins": "*"}}) # In production, restrict origins

# Security Headers Middleware
@app.after_request
def set_security_headers(response):
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# ─── MongoDB (optional) ──────────────────────────────────────────
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
    logger.info("✅ MongoDB connected: " + mongo_uri.split('@')[-1] if '@' in mongo_uri else mongo_uri)
except Exception as e:
    logger.error(f"⚠️  MongoDB unavailable — running without persistence: {str(e)}")

# ─── Agents ─────────────────────────────────────────────────────
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
            # 1. State for the user (latest results)
            db["users_state"].update_one(
                {"user_id": user_id},
                {"$set": {
                    f"latest_{tool_name}": result_data,
                    f"inputs_{tool_name}": request_data,
                    "last_active": now
                }},
                upsert=True
            )
            
            # 2. Immutable logs for the admin to see and control
            db["admin_logs"].insert_one({
                "user_id": user_id,
                "tool_used": tool_name,
                "timestamp": now,
                "inputs": request_data,
                "outputs": result_data
            })
        except Exception as e:
            print(f"DB write error: {e}")


# ─── Routes ─────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "db_connected": db is not None}), 200


def get_user_id(data):
    return request.headers.get("X-User-Id", data.get("user_id", "anonymous"))

# ─── Auth Routes ────────────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    if db is None:
        return jsonify({"error": "Database service unavailable"}), 503
    try:
        data = request.json
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON payload"}), 400
            
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        
        # Security: Prevent NoSQL Injection by enforcing string types
        if not all(isinstance(x, str) for x in [username, email, password]):
            return jsonify({"error": "Invalid field types provided"}), 400
            
        if not username or not email or not password:
            return jsonify({"error": "Missing fields"}), 400
            
        if db.users.find_one({"email": email}):
            return jsonify({"error": "Email already exists"}), 400
            
        hashed_password = generate_password_hash(password)
        import uuid
        user_id = f"usr_{uuid.uuid4().hex[:12]}" # Avoid leaking email parts in ID
        
        db.users.insert_one({
            "user_id": user_id,
            "username": username,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.datetime.utcnow()
        })
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        logger.error(f"Signup error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/auth/signin", methods=["POST"])
def signin():
    if db is None:
        return jsonify({"error": "Database service unavailable"}), 503
    try:
        data = request.json
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON payload"}), 400
            
        email = data.get("email")
        password = data.get("password")
        
        # Security: Prevent NoSQL Injection
        if not isinstance(email, str) or not isinstance(password, str):
            return jsonify({"error": "Invalid credentials format"}), 400
            
        if not email or not password:
            return jsonify({"error": "Missing credentials"}), 400
            
        user = db.users.find_one({"email": email})
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401
            
        return jsonify({
            "message": "Login successful", 
            "user": {
                "user_id": user["user_id"],
                "username": user["username"],
                "email": user["email"],
                "profile_pic": user.get("profile_pic", None)
            }
        }), 200
    except Exception as e:
        logger.error(f"Signin error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/auth/profile-pic", methods=["POST"])
def upload_profile_pic():
    if db is None:
        return jsonify({"error": "Database not configured"}), 500
    try:
        data = request.json
        user_id = data.get("user_id")
        profile_pic = data.get("profile_pic")
        
        if not user_id or not profile_pic:
            return jsonify({"error": "Missing user_id or image data"}), 400
            
        db.users.update_one(
            {"user_id": user_id},
            {"$set": {"profile_pic": profile_pic}}
        )
        return jsonify({"message": "Profile picture updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Full orchestrated analysis
@app.route("/api/analyze", methods=["POST"])
def analyze_finances():
    try:
        user_data = request.get_json(force=True, silent=True)
        if not user_data:
            return jsonify({"error": "No JSON data provided"}), 400
        result = orchestrator.process(user_data)
        log_interaction("orchestrator_full_analysis", get_user_id(user_data), user_data, result)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Analyze error: {e}", exc_info=True)
        return jsonify({"error": "Processing failed due to internal error"}), 500


# Money Health Score only
@app.route("/api/health-score", methods=["POST"])
def health_score():
    try:
        data = request.get_json(force=True, silent=True) or {}
        result = fin_agent.analyze(data)
        log_interaction("health_score", get_user_id(data), data, result)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Health score error: {e}", exc_info=True)
        return jsonify({"error": "Processing failed due to internal error"}), 500


# FIRE / SIP planner only
@app.route("/api/fire-plan", methods=["POST"])
def fire_plan():
    try:
        data = request.get_json(force=True, silent=True) or {}
        fin   = fin_agent.analyze(data)
        tax   = tax_agent.optimize(data)
        plan  = plan_agent.plan(data, fin, tax)
        log_interaction("fire_planner", get_user_id(data), data, plan)
        return jsonify({"financial_health": fin, "fire_plan": plan}), 200
    except Exception as e:
        logger.error(f"Fire plan error: {e}", exc_info=True)
        return jsonify({"error": "Processing failed due to internal error"}), 500


# Tax Wizard only
@app.route("/api/tax", methods=["POST"])
def tax_wizard():
    try:
        data   = request.get_json(force=True, silent=True) or {}
        result = tax_agent.optimize(data)
        log_interaction("tax_wizard", get_user_id(data), data, result)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Tax wizard error: {e}", exc_info=True)
        return jsonify({"error": "Processing failed due to internal error"}), 500


# Life Event Advisor
@app.route("/api/life-event", methods=["POST"])
def life_event():
    try:
        data  = request.get_json(force=True, silent=True) or {}
        fin   = fin_agent.analyze(data)
        tax   = tax_agent.optimize(data)
        recs  = rec_agent.generate(fin, tax, plan_agent.plan(data, fin, tax))
        event = data.get("event", "general")
        # Customize recommendations based on life event
        event_tip = {
            "bonus":       "Use 50% of your bonus to pay high-interest debt or invest in ELSS for tax saving.",
            "marriage":    "Combine finances carefully. Open a joint account for household expenses while keeping personal investments separate.",
            "new_baby":    "Start a child plan SIP immediately. Also review your term insurance cover — increase by at least ₹50L.",
            "inheritance": "Don't rush to invest. Park in liquid funds for 3-6 months and plan with tax implications in mind.",
            "retirement":  "Shift 20-30% of equity to debt/hybrid funds. Ensure 25x annual expenses as corpus."
        }.get(event, "Consult the full plan for general financial guidance.")
        recs["event_tip"] = event_tip
        recs["event"]     = event
        result = {"financial_health": fin, "tax_optimization": tax, "recommendations": recs}
        log_interaction("life_event_" + event, get_user_id(data), data, result)
        return jsonify(result), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Assuming these agents are imported and instantiated elsewhere, e.g., from agents import CouplesAgent, PortfolioAgent
# couples_agent = CouplesAgent()
# portfolio_agent = PortfolioAgent()

@app.route("/api/couples-plan", methods=["POST"])
def optimize_couples():
    try:
        data = request.get_json(force=True, silent=True) or {}
        partner_a = data.get("partner_a", {})
        partner_b = data.get("partner_b", {})
        result = couples_agent.optimize(partner_a, partner_b)
        log_interaction("couples_planner", get_user_id(data), data, result)
        return jsonify(result), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/portfolio-xray", methods=["POST"])
def analyze_portfolio():
    try:
        data = request.get_json(force=True, silent=True) or {}
        result = portfolio_agent.analyze_statement(data.get("statement_base64"))
        log_interaction("portfolio_xray", get_user_id(data), data, result)
        return jsonify(result), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# AI Chat
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data    = request.get_json(force=True, silent=True) or {}
        message = data.get("message", "").strip()
        context = data.get("context", {})
        if not message:
            return jsonify({"error": "message field is required"}), 400
        response_text = chat_agent.respond(message, context)
        log_interaction("ai_chat", get_user_id(data), {"message": message}, {"response": response_text})
        return jsonify({"response": response_text}), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
