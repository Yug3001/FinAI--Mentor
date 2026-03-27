class PlanningAgent:
    """
    FIRE planner with year-by-year projection, multiple SIP scenarios,
    and input-sensitive milestones. Every set of inputs produces a unique plan.
    """

    EQUITY_RETURN   = 0.12   # 12% equity
    DEBT_RETURN     = 0.07   # 7% debt
    INFLATION       = 0.06   # 6% inflation
    SAFE_WITHDRAWAL = 0.04   # 4% rule for corpus size check

    def plan(self, user_data, financial_status, tax_status):
        current_age        = int(user_data.get('current_age', 34))
        retirement_age     = int(user_data.get('retirement_age', 50))
        years_to_retire    = max(1, retirement_age - current_age)
        monthly_expenses   = float(user_data.get('monthly_expenses', 150000))
        investments_mf     = float(user_data.get('total_investments_mf', 1800000))
        investments_ppf    = float(user_data.get('total_investments_ppf', 600000))
        monthly_savings    = float(user_data.get('monthly_savings', 50000))
        annual_income      = float(user_data.get('annual_income', 2400000))
        
        current_invest     = investments_mf + investments_ppf
        months             = years_to_retire * 12
        mr                 = self.EQUITY_RETURN / 12

        # ── Future Value of Target Corpus ────────────────────────
        # 1. Annual expenses in today's value
        annual_expenses_today = monthly_expenses * 12
        # 2. Inflation adjusted annual expenses at retirement
        inflated_annual_expenses = annual_expenses_today * ((1 + self.INFLATION) ** years_to_retire)
        # 3. Target corpus needed using 4% SAFE WITHDRAWAL RULE
        target_corpus = inflated_annual_expenses / self.SAFE_WITHDRAWAL

        # ── FV of existing corpus ─────────────────────────────────
        fv_current = current_invest * ((1 + self.EQUITY_RETURN) ** years_to_retire)

        # ── Shortfall & required SIP ──────────────────────────────
        shortfall = max(0, target_corpus - fv_current)

        if shortfall > 0 and mr > 0 and months > 0:
            sip_required = (shortfall * mr) / (((1 + mr) ** months) - 1)
        else:
            sip_required = 0

        # ── Inflation-adjusted corpus needed ─────────────────────
        inflation_adj_target = target_corpus * ((1 + self.INFLATION) ** years_to_retire)
        today_value_of_target = round(target_corpus / ((1 + self.INFLATION) ** years_to_retire), 2)

        # ── Surplus / deficit monthly ─────────────────────────────
        investable_surplus = monthly_savings - sip_required

        # ── FIRE number using 4% rule ─────────────────────────────
        fire_number = monthly_expenses * 12 * 25

        # ── Years to FIRE at current savings pace ─────────────────
        # If person saves monthly_savings every month at 12% return
        if monthly_savings > 0 and mr > 0:
            # Find n: FV of SIP(monthly_savings, n) + FV of current_invest = fire_number
            # Approximation via binary search
            lo, hi = 0, 600       # months
            for _ in range(50):
                mid = (lo + hi) / 2
                fv_sip  = monthly_savings * (((1 + mr) ** mid - 1) / mr) if mr > 0 else 0
                fv_corp = current_invest * ((1 + self.EQUITY_RETURN) ** (mid / 12))
                if fv_sip + fv_corp >= fire_number:
                    hi = mid
                else:
                    lo = mid
            years_to_fire_at_current = round(hi / 12, 1)
        else:
            years_to_fire_at_current = None

        # ── 3 SIP scenarios ───────────────────────────────────────
        scenarios = {}
        for label, r_annual in [("conservative_7pct", 0.07),
                                  ("moderate_12pct",   0.12),
                                  ("aggressive_15pct", 0.15)]:
            mr_s  = r_annual / 12
            fv_c  = current_invest * ((1 + r_annual) ** years_to_retire)
            short = max(0, target_corpus - fv_c)
            if short > 0 and mr_s > 0 and months > 0:
                sip_s = (short * mr_s) / (((1 + mr_s) ** months) - 1)
            else:
                sip_s = 0
            scenarios[label] = round(sip_s, 2)

        # ── Year-by-year projection (for chart) ──────────────────
        projection = []
        corpus = float(current_invest)
        sip_monthly = sip_required
        for yr in range(1, min(years_to_retire + 1, 31)):
            for _ in range(12):
                corpus = corpus * (1 + mr) + sip_monthly
            projection.append({
                "year":      yr,
                "corpus":    round(corpus, 0),
                "target":    round(target_corpus * (yr / years_to_retire), 0),
            })

        # ── Asset Allocation Glidepath ────────────────────────────
        glidepath = []
        for yr in range(current_age, retirement_age + 1, max(1, years_to_retire // 5)):
            # Rule of thumb: Equity = 100 - age, but bounded for FIRE
            equity_pct = max(40, min(80, 110 - yr))
            debt_pct = 100 - equity_pct
            glidepath.append({"age": yr, "equity": equity_pct, "debt": debt_pct})

        # ── Insurance Gap Analysis ────────────────────────────────
        rec_term_insurance = annual_income * 20
        insurance_gap = {
            "recommended_term_cover": rec_term_insurance,
            "rationale": f"20x your gross annual income of ₹{int(annual_income):,}.",
            "recommended_health_cover": 1000000 if current_age < 45 else 2000000
        }

        # ── SIP Amounts by Fund Category ──────────────────────────
        # Dynamic allocation based on current age
        curr_eq = max(40, min(85, 110 - current_age))
        curr_dt = 100 - curr_eq
        
        # Of the equity portion, split it into Large/Mid/Small/International
        dt_val = (sip_required * curr_dt) / 100
        eq_val = sip_required - dt_val
        
        sip_by_category = [
            {"category": "Nifty 50 Index (Large Cap)", "amount": eq_val * 0.45},
            {"category": "Mid Cap Fund", "amount": eq_val * 0.25},
            {"category": "Small Cap Fund", "amount": eq_val * 0.15},
            {"category": "International / Flexi", "amount": eq_val * 0.15},
            {"category": "PPF / Short Duration Debt", "amount": dt_val}
        ]

        is_on_track = (monthly_savings >= sip_required) if sip_required > 0 else True

        return {
            "target_corpus":                   round(target_corpus, 2),
            "fire_number_4pct_rule":           round(annual_expenses_today * 25, 2),
            "current_investments_future_value": round(fv_current, 2),
            "shortfall":                       round(shortfall, 2),
            "monthly_sip_required":            round(sip_required, 2),
            "investable_surplus":              round(investable_surplus, 2),
            "years_to_reach":                  years_to_retire,
            "years_to_fire_at_current_pace":   years_to_fire_at_current,
            "inflation_adjusted_target":       round(target_corpus, 2), # Target corpus IS inflation adjusted
            "today_value_of_target":           today_value_of_target,
            "sip_scenarios":                   scenarios,
            "year_by_year":                    projection,
            "is_on_track":                     is_on_track,
            "asset_allocation_glidepath":      glidepath,
            "insurance_gap":                   insurance_gap,
            "sip_by_category":                 sip_by_category,
            "current_age":                     current_age,
            "retirement_age":                  retirement_age
        }
