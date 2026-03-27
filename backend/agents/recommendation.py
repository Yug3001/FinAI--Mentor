class RecommendationAgent:
    """
    Generates action-oriented advice based on precise inputs.
    Uses actual numbers computed by the other agents to personalize suggestions.
    """

    def generate(self, financial_status, tax_status, planning_status):
        suggestions = []
        warnings = []
        improvements = []

        # ── Financial Health ──────────────────────────────────────
        score = financial_status.get('health_score', 0)
        savings_rate = financial_status.get('savings_rate_percent', 0)
        debt_ratio = financial_status.get('debt_ratio_percent', 0)
        emf_months = financial_status.get('emergency_preparedness_months', 0)
        emf_gap = financial_status.get('monthly_emf_gap', 0)

        if savings_rate < 20:
            warnings.append(f"Low savings rate ({savings_rate}%). Aim to trim discretionary spending to push this to at least 20%.")
            improvements.append("Adopt the 50/30/20 budget: 50% needs, 30% wants, 20% savings.")
        elif savings_rate >= 40:
            suggestions.append(f"Outstanding savings rate ({savings_rate}%)! You're supercharging your wealth building.")

        if debt_ratio > 35:
            warnings.append(f"High debt load (Debt-to-Income: {debt_ratio}%). This restricts your cash flow.")
            improvements.append("Use the debt avalanche method: clear highest APY loans (credit cards, personal loans) aggressively.")

        if emf_months < 6:
            warnings.append(f"Emergency fund covers only {emf_months} months.")
            if emf_gap > 0:
                improvements.append(f"Shortfall of ₹{int(emf_gap)} in your emergency fund. Park this amount in a high-yield sweep FD or liquid mutual fund.")

        if score >= 80:
            suggestions.append(f"Your overall financial health is {financial_status.get('grade')} (Score: {score}). Great job maintaining balance across all dimensions.")

        # ── Tax ───────────────────────────────────────────────────
        better_regime = tax_status.get('better_regime')
        savings = int(tax_status.get('savings_with_better', 0))
        gaps = tax_status.get('deduction_gaps', [])

        suggestions.append(f"Filing under the {better_regime} tax regime is mathematically optimal, saving you ₹{savings} this year.")

        if better_regime == 'Old' and gaps:
            for gap in gaps:
                improvements.append(f"Tax optimization gap: Claim up to ₹{int(gap['unused_limit'])} under {gap['section']} to save an extra ₹{gap['potential_tax_saving']} in tax.")

        # ── FIRE Planning ─────────────────────────────────────────
        shortfall = int(planning_status.get('shortfall', 0))
        sip_req = int(planning_status.get('monthly_sip_required', 0))
        is_on_track = planning_status.get('is_on_track', False)
        target = int(planning_status.get('target_corpus', 0))

        surplus = int(planning_status.get('investable_surplus', 0))
        yrs_current = planning_status.get('years_to_fire_at_current_pace')
        yrs_target = planning_status.get('years_to_reach')

        if target > 0:
            if not is_on_track:
                warnings.append(f"You're projected to have a shortfall of ₹{shortfall} for your retirement target.")
                if surplus < 0:
                    improvements.append(f"You need a monthly SIP of ₹{sip_req}. Currently you're short by ₹{abs(surplus)}/month. Consider stepping up investments 5-10% annually.")
                else:
                    improvements.append(f"You have the surplus cash! Increase your monthly SIP to ₹{sip_req} to secure your retirement goal.")
            else:
                suggestions.append(f"On-Target! With your current investment strategy, you're projected to hit your ₹{target} corpus.")
                
            if yrs_current and yrs_target:
                if yrs_current < yrs_target:
                    suggestions.append(f"Aggressive Growth: At your current savings rate, you could FIRE in {yrs_current} years (ahead of your {yrs_target}-year goal!).")

        return {
            "suggestions": suggestions,
            "warnings": warnings,
            "improvements": improvements
        }
