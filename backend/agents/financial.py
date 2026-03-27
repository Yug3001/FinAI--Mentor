class FinancialAnalysisAgent:
    """
    Produces a continuously-varying health score (not fixed steps) and
    rich per-dimension breakdown so every unique input gives unique output.
    """

    def analyze(self, user_data):
        income       = max(1, float(user_data.get('monthly_income',    0)))
        expenses     = max(0, float(user_data.get('monthly_expenses',  0)))
        debt         = max(0, float(user_data.get('total_debt',        0)))
        investments  = max(0, float(user_data.get('total_investments', 0)))
        emerg_fund   = max(0, float(user_data.get('emergency_fund',    0)))

        # ── Core numbers ──────────────────────────────────────────
        savings         = income - expenses
        savings_rate    = (savings / income) * 100 if income > 0 else 0
        annual_income   = income * 12
        debt_ratio      = (debt / annual_income) * 100 if annual_income > 0 else 0
        emerg_months    = (emerg_fund / expenses) if expenses > 0 else (12 if emerg_fund > 0 else 0)
        invest_rate     = (investments / annual_income) * 100 if annual_income > 0 else 0
        monthly_emf_gap = max(0, (expenses * 6) - emerg_fund)

        # ── 6-Dimension Scoring (each 0-100, weighted) ────────────
        # 1. Savings Rate (weight 25)
        s1 = min(100, max(0, (savings_rate / 50) * 100))          # 50%+ = perfect

        # 2. Emergency Preparedness (weight 20)
        s2 = min(100, max(0, (emerg_months / 6) * 100))           # 6 months = perfect

        # 3. Debt Health (weight 20)
        s3 = max(0, 100 - (debt_ratio * 1.5))                     # 0 debt = 100, 67% debt = 0

        # 4. Investment Rate (weight 15)
        s4 = min(100, max(0, (invest_rate / 30) * 100))           # 30%+ of annual income = perfect

        # 5. Income vs Expenses Cushion (weight 10)
        expense_ratio = (expenses / income) * 100 if income > 0 else 100
        s5 = max(0, 100 - expense_ratio)                           # lower expense ratio = higher

        # 6. Net Worth Proxy (weight 10)
        net_worth = investments + emerg_fund - debt
        net_worth_months = (net_worth / expenses) if expenses > 0 else 0
        s6 = min(100, max(0, (net_worth_months / 24) * 100))      # 24 months net worth = perfect

        # Weighted composite score
        score = (
            s1 * 0.25 +
            s2 * 0.20 +
            s3 * 0.20 +
            s4 * 0.15 +
            s5 * 0.10 +
            s6 * 0.10
        )
        score = round(max(0, min(100, score)), 1)

        # ── Grade ─────────────────────────────────────────────────
        if score >= 80:   grade = "Excellent"
        elif score >= 65: grade = "Good"
        elif score >= 45: grade = "Fair"
        elif score >= 25: grade = "Needs Work"
        else:             grade = "Critical"

        return {
            # Core metrics
            "monthly_savings":             round(savings, 2),
            "savings_rate_percent":        round(savings_rate, 2),
            "debt_ratio_percent":          round(debt_ratio, 2),
            "emergency_preparedness_months": round(emerg_months, 1),
            "investment_rate_percent":     round(invest_rate, 2),
            "net_worth":                   round(net_worth, 2),
            "monthly_emf_gap":             round(monthly_emf_gap, 2),
            "expense_ratio_percent":       round(expense_ratio, 2),

            # 6-dimension breakdown (each out of 100)
            "dimensions": {
                "savings_rate":           round(s1, 1),
                "emergency_fund":         round(s2, 1),
                "debt_health":            round(s3, 1),
                "investment_rate":        round(s4, 1),
                "income_cushion":         round(s5, 1),
                "net_worth_proxy":        round(s6, 1),
            },

            # Composite
            "health_score": score,
            "grade":        grade,
        }
