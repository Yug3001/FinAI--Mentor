import os
import logging
from flask import Flask, request, jsonify, send_file
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
from pdf_generator import FinAIPDFGenerator
from werkzeug.security import generate_password_hash, check_password_hash

orchestrator  = OrchestratorAgent()
chat_agent    = ChatAgent()
fin_agent     = FinancialAnalysisAgent()
plan_agent    = PlanningAgent()
tax_agent     = TaxAgent()
rec_agent     = RecommendationAgent()
couples_agent = CouplesAgent()
portfolio_agent = PortfolioAgent()
pdf_generator = FinAIPDFGenerator()

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
    return jsonify({"financial_health": fin, "tax_optimization": tax, "fire_plan": plan})


@app.route("/api/tax", methods=["POST"])
def tax():
    data = request.json
    return jsonify(tax_agent.optimize(data))


@app.route("/api/couples-plan", methods=["POST"])
def couples_plan():
    try:
        data = request.json
        partner_a = data.get("partner_a", {})
        partner_b = data.get("partner_b", {})
        
        logger.info(f"Couples plan request: {partner_a}, {partner_b}")
        result = couples_agent.optimize(partner_a, partner_b)
        logger.info(f"Couples plan result: {result}")
        
        user_id = get_user_id(data)
        log_interaction("couples_plan", user_id, data, result)
        return jsonify({
            "recommendations": result.get("tax_strategy", []),
            "insurance": result.get("insurance_suggestion", ""),
            "metrics": result
        })
    except Exception as e:
        logger.error(f"Couples plan error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route("/api/life-event", methods=["POST"])
def life_event():
    data = request.json
    # Adapt life event data to recommendation agent format
    financial_status = {
        "health_score": 70,
        "savings_rate_percent": 30,
        "debt_ratio_percent": 20,
        "emergency_preparedness_months": 6,
        "monthly_emf_gap": 0
    }
    tax_status = {"effective_tax_rate": 20}
    planning_status = {"years_to_retire": 20}
    
    result = rec_agent.generate(financial_status, tax_status, planning_status)
    user_id = get_user_id(data)
    log_interaction("life_event", user_id, data, result)
    return jsonify({"recommendations": result})


@app.route("/api/portfolio-xray", methods=["POST"])
def portfolio_xray():
    try:
        data = request.json
        file_content = data.get("statement_base64")
        file_name = data.get("file_name")
        
        # Validate input
        if not file_content:
            logger.warning("Portfolio upload: missing file content")
            return jsonify({
                "status": "error",
                "message": "No file content provided"
            }), 400
        
        if not file_name:
            logger.warning("Portfolio upload: missing file name")
            return jsonify({
                "status": "error",
                "message": "File name is required"
            }), 400
        
        logger.info(f"🔍 Processing portfolio file: {file_name}")
        
        # Validate file and process
        result = portfolio_agent.analyze_statement(file_content, file_name)
        
        # Log successful interaction
        user_id = get_user_id(data)
        log_interaction("portfolio_xray", user_id, data, result)
        
        logger.info(f"✅ Portfolio analysis successful for {file_name}")
        return jsonify(result), 200
        
    except ValueError as e:
        # File validation error (user error)
        error_msg = str(e)
        logger.warning(f"📋 Portfolio validation error: {error_msg}")
        return jsonify({
            "status": "error",
            "message": error_msg
        }), 400
        
    except Exception as e:
        # Unexpected server error
        logger.error(f"🔴 Portfolio analysis error: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "Portfolio analysis failed. Please check your file and try again."
        }), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    # Get context from request or use empty dict as fallback
    context = data.get("context", "")
    return jsonify({"response": chat_agent.respond(data.get("message", ""), context)})


# ─── PDF Download Endpoints ──────────────────────────────────────────

@app.route("/api/download/health-score-pdf", methods=["POST"])
def download_health_score_pdf():
    try:
        data = request.json
        result = data.get("result")
        input_data = data.get("input_data")
        
        if not result or not input_data:
            logger.warning(f"Health Score PDF: Missing data - result: {bool(result)}, input_data: {bool(input_data)}")
            return jsonify({"error": "Missing result or input data"}), 400
        
        logger.info(f"Generating Health Score PDF with result keys: {list(result.keys())}")
        pdf_buffer = pdf_generator.generate_health_score_pdf(result, input_data)
        
        if not pdf_buffer or pdf_buffer.getbuffer().nbytes == 0:
            logger.error("Health Score PDF: Buffer is empty after generation")
            return jsonify({"error": "Failed to generate PDF - empty buffer"}), 500
        
        pdf_buffer.seek(0)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='FinAI_Health_Score_Report.pdf'
        )
    except Exception as e:
        logger.error(f"Health Score PDF error: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500


@app.route("/api/download/fire-plan-pdf", methods=["POST"])
def download_fire_plan_pdf():
    try:
        data = request.json
        result = data.get("result")
        input_data = data.get("input_data")
        
        if not result or not input_data:
            return jsonify({"error": "Missing result or input data"}), 400
        
        pdf_buffer = pdf_generator.generate_fire_plan_pdf(result, input_data)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='FinAI_FIRE_Plan_Report.pdf'
        )
    except Exception as e:
        logger.error(f"FIRE Plan PDF error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate PDF"}), 500


@app.route("/api/download/tax-plan-pdf", methods=["POST"])
def download_tax_plan_pdf():
    try:
        data = request.json
        result = data.get("result")
        input_data = data.get("input_data")
        
        if not result or not input_data:
            return jsonify({"error": "Missing result or input data"}), 400
        
        pdf_buffer = pdf_generator.generate_tax_plan_pdf(result, input_data)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='FinAI_Tax_Plan_Report.pdf'
        )
    except Exception as e:
        logger.error(f"Tax Plan PDF error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate PDF"}), 500


@app.route("/api/download/couples-plan-pdf", methods=["POST"])
def download_couples_plan_pdf():
    try:
        data = request.json
        result = data.get("result")
        partner_a = data.get("partner_a")
        partner_b = data.get("partner_b")
        
        if not result or not partner_a or not partner_b:
            return jsonify({"error": "Missing result or partner data"}), 400
        
        pdf_buffer = pdf_generator.generate_couples_plan_pdf(result, partner_a, partner_b)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='FinAI_Couples_Plan_Report.pdf'
        )
    except Exception as e:
        logger.error(f"Couples Plan PDF error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate PDF"}), 500


@app.route("/api/download/full-analysis-pdf", methods=["POST"])
def download_full_analysis_pdf():
    try:
        data = request.json
        analysis_data = data.get("data")
        
        if not analysis_data:
            return jsonify({"error": "Missing analysis data"}), 400
        
        pdf_buffer = pdf_generator.generate_full_analysis_pdf(analysis_data)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='FinAI_Complete_Analysis_Report.pdf'
        )
    except Exception as e:
        logger.error(f"Full Analysis PDF error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate PDF"}), 500


@app.route("/api/download/life-event-pdf", methods=["POST"])
def download_life_event_pdf():
    try:
        data = request.json
        result = data.get("result")
        
        if not result:
            return jsonify({"error": "Missing result data"}), 400
        
        # Generate a simple document for life event
        pdf_buffer = pdf_generator.generate_health_score_pdf(result, {})
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='FinAI_Life_Event_Report.pdf'
        )
    except Exception as e:
        logger.error(f"Life Event PDF error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate PDF"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)