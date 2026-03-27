import requests
import os
import re

# Comprehensive structured FAQ Knowledge Base for fast, productive local answers
FAQ_DB = {
    # Investing
    "index fund": "Index funds track a market benchmark like NIFTY 50. They offer low expense ratios and usually beat actively managed funds over a 10+ year horizon.",
    "mutual fund": "Mutual Funds pool money from investors to buy stocks/bonds. For beginners, a Nifty 50 Index Fund and a Flexi-Cap fund are great starting points.",
    "where to invest": "1. Build a 6-month emergency fund (FD/Liquid Fund). 2. Buy Health & Term Insurance. 3. Invest in ELSS/PPF for tax limits. 4. Put the rest in Nifty 50 Index Funds.",
    "sip": "SIP (Systematic Investment Plan) allows you to invest a fixed amount monthly. It averages out market volatility (Rupee Cost Averaging) and builds discipline.",
    "fd": "Fixed Deposits give guaranteed returns but usually lose to inflation after tax. Best used for emergency funds or short-term goals (< 3 years).",
    "stock market": "Over the long term (10+ years), Indian equities average 10-12% post-tax returns. Never invest money you'll need in the next 3 years into stocks.",
    "crypto": "Cryptocurrencies are highly volatile and largely unregulated in India (taxed at 30% flat + 1% TDS). Keep exposure strictly under 5% of your total net worth.",
    "gold": "Gold is a hedge against inflation and currency depreciation. Consider Sovereign Gold Bonds (SGBs) for an extra 2.5% annual interest over physical gold.",
    "sgb": "Sovereign Gold Bonds (SGBs) pay 2.5% fixed interest annually. If held to maturity (8 years), capital gains are entirely tax-free.",
    
    # Real Estate & Loans
    "buy a house": "Use the 3/20/30/40 rule: Property value < 3x annual income, 20% down payment minimum, EMI < 30% of income, max 40% total debt obligations.",
    "buy a car": "Follow the 20/4/10 rule: 20% down payment, 4-year loan term max, and car EMI + insurance should not exceed 10% of your gross monthly income.",
    "home loan": "Home loan interest gives you up to ₹2 Lakh deduction under Section 24b, and ₹1.5L principal under 80C. Try prepaying 5% of loan principal annually to cut tenure drastically.",
    "credit card": "Credit cards are great for rewards IF paid in full every month. Never revolve credit card debt—interest rates are 36-45% annually! Pay the 'Total Due', not 'Minimum Due'.",
    "personal loan": "Personal loans usually charge 11-18% interest. Only take them for absolute emergencies, never for vacations or discretionary purchases.",
    
    # Tax Planning
    "tax saving": "Best tax savers under 80C (₹1.5L max): ELSS for high returns (3yr lock-in), PPF for safety (15yr lock-in), EPF for salaried. Add ₹50k NPS under 80CCD(1B).",
    "elss": "Equity Linked Savings Schemes (ELSS) have the shortest lock-in (3 years) among 80C options and offer high equity returns, but involve market risk.",
    "ppf": "Public Provident Fund (PPF) is an EEE (Exempt-Exempt-Exempt) scheme. Current rate is 7.1%. Lock-in is 15 years, great for long-term safe compounding.",
    "nps": "National Pension System (NPS) gives ₹50,000 extra tax deduction via 80CCD(1b). Money is locked until age 60, and 40% corpus must be annuitized.",
    "hra": "HRA exemption is the least of: 1) ActuaL HRA received, 2) 50% basic salary (metro) / 40% (non-metro), 3) Actual rent paid - 10% of basic salary.",
    "old vs new regime": "New regime is generally better if your total 80C, 80D, and HRA deductions are less than ₹3.75 Lakhs. If you have a Home Loan Interest (Sec 24b), Old Regime often wins.",
    "capital gains": "Long Term Capital Gains (LTCG) on stocks/equity MFs > ₹1.25L/year are taxed at 12.5%. Short term (STCG) is taxed at 20%.",
    
    # Insurance
    "health insurance": "Buy a base policy of at least ₹5L-₹10L early in career. Buy a Super Top-up (e.g., ₹50L with ₹5L deductible) to get massive coverage cheaply.",
    "term insurance": "Term life insurance is the only life insurance you need. Cover should be 15-20x your annual income. Do not mix insurance and investment (avoid ULIPs/Endowment plans).",
    "ulip": "ULIPs and Endowment plans usually offer poor returns (4-6%) and high fees. Buy pure Term Insurance for coverage, and mutual funds for investing.",
    
    # Retirement & Financial Independence (FIRE)
    "fire": "FIRE (Financial Independence, Retire Early). Rule of thumb: You need 25x-30x your annual expenses invested to safely withdraw 4% adjusted for inflation indefinitely.",
    "emergency fund": "Keep 6 months of absolute necessary expenses (rent, groceries, EMIs, insurance premiums) in a liquid mutual fund or separate savings account.",
    "budget": "Follow the 50/30/20 rule: 50% for Needs (rent, groceries), 30% for Wants (dining out, entertainment), 20% for Savings and Investing.",
    "epf": "Employees' Provident Fund gives ~8.15% return and is tax-free up to ₹2.5L annual contribution. Don't withdraw EPF when switching jobs; always transfer it.",
    "inflation": "Inflation is the silent wealth killer. At 6% inflation, ₹100 today will have the buying power of ₹54 in ten years. You MUST invest in equity to beat inflation.",
    "rule of 72": "Divide 72 by the expected interest rate to find out how many years it will take to double your money. (e.g., at 12% return, money doubles in 6 years)."
}

class ChatAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") 

    def get_local_faq_answer(self, message):
        """Scans for keywords and provides instant local answers if possible."""
        msg_lower = message.lower()
        # Look for the best match
        for key, answer in FAQ_DB.items():
            # If the specific keyword (e.g. 'index fund', 'buy a car') is strongly present
            if re.search(r'\b' + re.escape(key) + r'\b', msg_lower):
                return f"⚡ Fast Advice: {answer}"
        return None

    def respond(self, message, context):
        # 1. Very Fast Local FAQ Knowledge Base check (Productive & Instant)
        local_answer = self.get_local_faq_answer(message)
        if local_answer:
            return local_answer
            
        # 2. Fallback to Gemini if no local FAQ matched
        if not self.api_key:
            return "I run purely on my internal FAQ database right now because my API key is missing. Ask me about SIPs, Term Insurance, Tax deductuons, or Buying a car!"
            
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            prompt = f"""You are FinAI, an expert Indian personal finance mentor. 
User's Question: {message}
User's Context from Dashboard: {context}

Provide extremely concise, highly actionable, bulleted advice. Use Indian context (Rupees, Section 80C, Term Insurance, Nifty 50). Do not use markdown headers, just plain text with emojis."""
            
            payload = { "contents": [{"parts": [{"text": prompt}]}] }
            response = requests.post(url, json=payload, timeout=8)
            
            if response.status_code == 200:
                data = response.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            else:
                return "I couldn't reach the AI brain right now. Please try again! Remember: Time in the market > Timing the market."
        except Exception as e:
            print("Chat API Error:", str(e))
            return "Connection error. To build wealth: save 20%, buy term insurance, and set up an SIP!"
