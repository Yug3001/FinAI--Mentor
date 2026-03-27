import os
import requests
import json
import logging

logger = logging.getLogger(__name__)

class CouplesAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            logger.info("✅ Gemini API key loaded")
        else:
            logger.warning("⚠️ Gemini API key not found - using fallback responses")

    def get_ai_insights(self, partner_a, partner_b, combined_net_worth, higher_earner):
        if not self.api_key:
            logger.warning("No API key, using fallback insights")
            return {
                "tax_strategy": [
                    f"Optimize 80C: Ensure both partners maximize their ₹1.5L limit. Currently {higher_earner} is better positioned to take joint home loan interest deductions (Sec 24b).",
                    f"HRA Optimization: If living in a rented house, {higher_earner} should ideally claim HRA to get the maximum tax bracket reduction."
                ],
                "insurance_suggestion": "Maintain separate pure Term Insurance policies. Joint policies often terminate on first death."
            }
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            prompt = f"""You are an Indian joint financial planner. 
Partner A: ₹{partner_a.get('income',0)} income, ₹{partner_a.get('savings',0)} savings.
Partner B: ₹{partner_b.get('income',0)} income, ₹{partner_b.get('savings',0)} savings.
Higher earner: {higher_earner}. Combined Net Worth: ₹{combined_net_worth}.

Return exactly this JSON structure (nothing else, no markdown formatting like ```json):
{{
  "tax_strategy": ["actionable indian tax strategy 1", "strategy 2", "strategy 3"],
  "insurance_suggestion": "1 clear sentence on term or health insurance for them."
}}"""
            payload = { "contents": [{"parts": [{"text": prompt}]}] }
            
            logger.info(f"Calling Gemini API with URL: {url[:50]}...")
            response = requests.post(url, json=payload, timeout=8)
            
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                raise Exception(f"API returned {response.status_code}")
            
            text = response.json()['candidates'][0]['content']['parts'][0]['text']
            logger.info(f"Gemini response received: {text[:100]}...")
            # Clean up potential markdown formatting that Gemini sometimes includes
            text = text.replace("```json", "").replace("```", "").strip()
            result = json.loads(text)
            logger.info(f"✅ Gemini parsed successfully")
            return result
        except Exception as e:
            logger.error(f"Gemini API failed: {str(e)}", exc_info=True)
            return {
                "tax_strategy": ["Focus on maximizing 80C for both partners.", "Consider NPS 80CCD(1B) for additional ₹50,000 deduction."],
                "insurance_suggestion": "Ensure both partners have independent term life insurance."
            }

    def optimize(self, partner_a, partner_b):
        # Convert string values to numbers
        income_a = float(partner_a.get('income', 0) or 0)
        income_b = float(partner_b.get('income', 0) or 0)
        savings_a = float(partner_a.get('savings', 0) or 0)
        savings_b = float(partner_b.get('savings', 0) or 0)
        net_worth_a = float(partner_a.get('net_worth', 0) or 0)
        net_worth_b = float(partner_b.get('net_worth', 0) or 0)
        sip_a = float(partner_a.get('sip_target', 0) or 0)
        sip_b = float(partner_b.get('sip_target', 0) or 0)
        
        combined_income = income_a + income_b
        combined_savings = savings_a + savings_b
        combined_net_worth = net_worth_a + net_worth_b
        
        higher_earner = "Partner A" if income_a > income_b else "Partner B"
        
        total_sip = sip_a + sip_b
        if combined_income > 0:
            a_share = (income_a / combined_income) * total_sip
            b_share = (income_b / combined_income) * total_sip
        else:
            a_share = b_share = total_sip / 2

        ai_insights = self.get_ai_insights(partner_a, partner_b, combined_net_worth, higher_earner)

        return {
            "combined_income": round(combined_income, 2),
            "combined_savings": round(combined_savings, 2),
            "combined_net_worth": round(combined_net_worth, 2),
            "higher_earner": higher_earner,
            "optimal_sip_split": {
                "partner_a": round(a_share, 2),
                "partner_b": round(b_share, 2)
            },
            "tax_strategy": ai_insights.get("tax_strategy", []),
            "insurance_suggestion": ai_insights.get("insurance_suggestion", "")
        }
