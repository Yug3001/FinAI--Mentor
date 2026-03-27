class TaxAgent:
    """
    Computes both regimes with full slab breakdown, effective tax rate,
    monthly tax deduction, and a ranked list of specific deduction gaps.
    Every input produces unique, specific numbers.
    """

    def optimize(self, user_data):
        gross        = max(0, float(user_data.get('annual_income',      0)))
        dedn_80c     = max(0, min(150000, float(user_data.get('deduction_80c',      0))))
        dedn_80d     = max(0, min(50000,  float(user_data.get('deduction_80d',      0))))
        hra          = max(0, float(user_data.get('hra_exemption',      0)))
        home_int     = max(0, min(200000, float(user_data.get('home_loan_interest', 0))))
        nps_80ccd1b  = max(0, min(50000,  float(user_data.get('nps_80ccd1b',        0))))
        std_dedn     = 75000.0   # Standard deduction (FY 2024-25 Budget)

        # ── Old Regime ────────────────────────────────────────────
        old_deductions = std_dedn + dedn_80c + dedn_80d + hra + home_int + nps_80ccd1b
        taxable_old    = max(0, gross - old_deductions)
        old_tax_gross  = self._old_slab(taxable_old)
        old_cess       = round(old_tax_gross * 0.04, 2)
        # Rebate 87A: full rebate if taxable income <= 5L
        old_rebate     = old_tax_gross if taxable_old <= 500000 else 0
        old_tax        = max(0, round(old_tax_gross - old_rebate + old_cess, 2))
        old_eff_rate   = round((old_tax / gross) * 100, 2) if gross > 0 else 0

        # ── New Regime ────────────────────────────────────────────
        new_deductions = std_dedn   # Only standard deduction in new regime
        taxable_new    = max(0, gross - new_deductions)
        new_tax_gross  = self._new_slab(taxable_new)
        new_cess       = round(new_tax_gross * 0.04, 2)
        # Rebate 87A: full rebate if taxable income <= 7L (new regime)
        new_rebate     = new_tax_gross if taxable_new <= 700000 else 0
        new_tax        = max(0, round(new_tax_gross - new_rebate + new_cess, 2))
        new_eff_rate   = round((new_tax / gross) * 100, 2) if gross > 0 else 0

        # ── Decision ──────────────────────────────────────────────
        better_regime = "New" if new_tax <= old_tax else "Old"
        annual_saving = round(abs(old_tax - new_tax), 2)
        monthly_old   = round(old_tax / 12, 2)
        monthly_new   = round(new_tax / 12, 2)

        # ── Deduction gap analysis (specific ₹ amounts) ───────────
        gaps = []
        if dedn_80c < 150000:
            gap_amt = 150000 - dedn_80c
            tax_saved = round(gap_amt * 0.30, 0)   # approximate at 30% slab
            gaps.append({
                "section": "80C",
                "description": "ELSS / PPF / NPS Tier-1 / Life Insurance",
                "unused_limit": gap_amt,
                "potential_tax_saving": int(tax_saved),
            })
        if dedn_80d < 25000:
            gap_amt = 25000 - dedn_80d
            gaps.append({
                "section": "80D",
                "description": "Health Insurance Premium (self + spouse)",
                "unused_limit": gap_amt,
                "potential_tax_saving": int(gap_amt * 0.20),
            })
        if nps_80ccd1b < 50000:
            gap_amt = 50000 - nps_80ccd1b
            gaps.append({
                "section": "80CCD(1B)",
                "description": "Additional NPS contribution (over 80C limit)",
                "unused_limit": gap_amt,
                "potential_tax_saving": int(gap_amt * 0.30),
            })
        if home_int == 0:
            gaps.append({
                "section": "Sec 24B",
                "description": "Home Loan Interest (up to ₹2L if self-occupied)",
                "unused_limit": 200000,
                "potential_tax_saving": 60000,
            })

        return {
            # Old Regime
            "old_taxable_income":  round(taxable_old, 2),
            "old_deductions_total": round(old_deductions, 2),
            "old_tax":             old_tax,
            "old_cess":            old_cess,
            "old_eff_rate":        old_eff_rate,
            "old_monthly_tds":     monthly_old,

            # New Regime
            "new_taxable_income":  round(taxable_new, 2),
            "new_deductions_total": round(new_deductions, 2),
            "new_tax":             new_tax,
            "new_cess":            new_cess,
            "new_eff_rate":        new_eff_rate,
            "new_monthly_tds":     monthly_new,

            # Decision
            "better_regime":          better_regime,
            "savings_with_better":    annual_saving,
            "monthly_savings_better": round(annual_saving / 12, 2),
            "missing_deductions_flag": len(gaps) > 0,
            "deduction_gaps":         gaps,

            # Step by step calculation
            "step_by_step": {
                "old_regime": [
                    f"1. Gross Salary: ₹{gross}",
                    f"2. Less Standard Deduction: -₹{std_dedn}",
                    f"3. Less 80C (Limited to 1.5L): -₹{dedn_80c}",
                    f"4. Less 80D (Health Ins): -₹{dedn_80d}",
                    f"5. Less HRA Exemption: -₹{hra}",
                    f"6. Less Home Loan Int (Sec 24B): -₹{home_int}",
                    f"7. Less NPS 80CCD(1B): -₹{nps_80ccd1b}",
                    f"8. Net Taxable Income: ₹{taxable_old}",
                    f"9. Base Tax on Slabs: ₹{old_tax_gross}",
                    f"10. Less 87A Rebate (if <= 5L): -₹{old_rebate}",
                    f"11. Add 4% Cess: +₹{old_cess}",
                    f"12. Total Tax Liability: ₹{old_tax}"
                ],
                "new_regime": [
                    f"1. Gross Salary: ₹{gross}",
                    f"2. Less Standard Deduction: -₹{std_dedn}",
                    f"3. Net Taxable Income: ₹{taxable_new}",
                    f"4. Base Tax on Slabs: ₹{new_tax_gross}",
                    f"5. Less 87A Rebate (if <= 7L): -₹{new_rebate}",
                    f"6. Add 4% Cess: +₹{new_cess}",
                    f"7. Total Tax Liability: ₹{new_tax}"
                ]
            },

            # Ranked suggestions
            "ranked_suggestions": [
                {
                    "rank": 1,
                    "instrument": "ELSS Mutual Funds",
                    "liquidity": "Medium (3-year lock-in)",
                    "risk": "High (Equity)",
                    "description": "Helps max out 80C while providing long-term equity returns that beat inflation."
                },
                {
                    "rank": 2,
                    "instrument": "NPS Tier 1 - Section 80CCD(1B)",
                    "liquidity": "Very Low (Locked till retirement)",
                    "risk": "Medium (Regulated Equity + Debt)",
                    "description": "Additional ₹50,000 deduction on top of 1.5L 80C. Excellent for systematic retirement corpus."
                },
                {
                    "rank": 3,
                    "instrument": "Comprehensive Health Insurance - Section 80D",
                    "liquidity": "High (Annual/Monthly premiums)",
                    "risk": "None (Pure hedge)",
                    "description": "Protects against sudden immense capital drawdowns due to health emergencies. Up to ₹75k limit if including parents."
                }
            ]
        }

    def _old_slab(self, income):
        """Old regime slabs (FY 2024-25)"""
        tax = 0
        brackets = [
            (250000,  0.00),
            (500000,  0.05),
            (1000000, 0.20),
            (float('inf'), 0.30),
        ]
        prev = 0
        for limit, rate in brackets:
            if income <= prev:
                break
            taxable = min(income, limit) - prev
            tax += taxable * rate
            prev = limit
        return round(tax, 2)

    def _new_slab(self, income):
        """New regime slabs (FY 2024-25)"""
        tax = 0
        brackets = [
            (300000,  0.00),
            (700000,  0.05),
            (1000000, 0.10),
            (1200000, 0.15),
            (1500000, 0.20),
            (float('inf'), 0.30),
        ]
        prev = 0
        for limit, rate in brackets:
            if income <= prev:
                break
            taxable = min(income, limit) - prev
            tax += taxable * rate
            prev = limit
        return round(tax, 2)
