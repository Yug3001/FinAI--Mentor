import io
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class FinAIPDFGenerator:
    def __init__(self):
        self.pagesize = letter
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#334155'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#475569'),
            spaceAfter=6,
            leading=14
        )

    def _format_number(self, n):
        """Format number with Indian rupee format"""
        try:
            n = float(n or 0)
            return '₹' + '{:,.2f}'.format(n).replace(',', ',')
        except:
            return str(n)

    def _create_metric_table(self, metrics, title=None):
        """Create a formatted table for metrics"""
        data = []
        if title:
            data.append([Paragraph(f"<b>{title}</b>", self.heading_style)])
        
        for label, value in metrics:
            if isinstance(value, (int, float)):
                value = self._format_number(value)
            data.append([
                Paragraph(f"<b>{label}:</b>", self.normal_style),
                Paragraph(str(value), self.normal_style)
            ])
        
        table = Table(data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        return table

    def generate_health_score_pdf(self, result, input_data):
        """Generate PDF for Health Score analysis"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=self.pagesize, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []

        # Header
        elements.append(Paragraph("FinAI Money Health Score Report", self.title_style))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", self.normal_style))
        elements.append(Spacer(1, 0.3*inch))

        # Overall Score
        score = result.get('health_score', 0)
        grade = result.get('grade', 'N/A')
        elements.append(Paragraph(f"<b>Overall Score: {score}/100 ({grade})</b>", self.heading_style))
        elements.append(Spacer(1, 0.2*inch))

        # Input Summary
        input_metrics = [
            ('Monthly Income', input_data.get('monthly_income')),
            ('Monthly Expenses', input_data.get('monthly_expenses')),
            ('Total Debt', input_data.get('total_debt')),
            ('Emergency Fund', input_data.get('emergency_fund')),
            ('Total Investments', input_data.get('total_investments')),
        ]
        elements.append(self._create_metric_table(input_metrics, "Your Financial Snapshot"))
        elements.append(Spacer(1, 0.2*inch))

        # 6-Dimension Breakdown
        dimensions = result.get('dimensions', {})
        dimension_metrics = [
            ('Savings Rate', f"{dimensions.get('savings_rate', 0)}/100"),
            ('Emergency Fund Readiness', f"{dimensions.get('emergency_fund', 0)}/100"),
            ('Debt Health', f"{dimensions.get('debt_health', 0)}/100"),
            ('Investment Rate', f"{dimensions.get('investment_rate', 0)}/100"),
            ('Income Cushion', f"{dimensions.get('income_cushion', 0)}/100"),
            ('Net Worth Proxy', f"{dimensions.get('net_worth_proxy', 0)}/100"),
        ]
        elements.append(self._create_metric_table(dimension_metrics, "Analysis by Dimension"))
        elements.append(Spacer(1, 0.2*inch))

        # Key Metrics
        key_metrics = [
            ('Monthly Savings', result.get('monthly_savings')),
            ('Savings Rate %', f"{result.get('savings_rate_percent')}%"),
            ('Debt-to-Income Ratio', f"{result.get('debt_ratio_percent')}%"),
            ('Emergency Fund Months', result.get('emergency_preparedness_months')),
            ('Net Worth', result.get('net_worth')),
        ]
        elements.append(self._create_metric_table(key_metrics, "Key Financial Metrics"))
        elements.append(Spacer(1, 0.3*inch))

        elements.append(Paragraph("This report is confidential and for personal financial planning only.", self.normal_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_fire_plan_pdf(self, result, input_data):
        """Generate PDF for FIRE Plan"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=self.pagesize, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []

        fire_plan = result.get('fire_plan', {})

        # Header
        elements.append(Paragraph("FinAI FIRE Growth Projection Report", self.title_style))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", self.normal_style))
        elements.append(Spacer(1, 0.3*inch))

        # Core FIRE Metrics
        fire_metrics = [
            ('Target Corpus Required', fire_plan.get('target_corpus')),
            ('Current Investments (FV)', fire_plan.get('current_investments_future_value')),
            ('Shortfall', fire_plan.get('shortfall')),
            ('Monthly SIP Required', fire_plan.get('monthly_sip_required')),
            ('Years to Reach Goal', fire_plan.get('years_to_reach')),
            ('Years to FIRE (Current Pace)', fire_plan.get('years_to_fire_at_current_pace')),
            ('On Track?', 'Yes ✓' if fire_plan.get('is_on_track') else 'No - Gap Detected'),
        ]
        elements.append(self._create_metric_table(fire_metrics, "FIRE Plan Summary"))
        elements.append(Spacer(1, 0.2*inch))

        # SIP Scenarios
        scenarios = fire_plan.get('sip_scenarios', {})
        scenario_metrics = [
            ('Conservative (7%)', scenarios.get('conservative_7pct')),
            ('Moderate (12%)', scenarios.get('moderate_12pct')),
            ('Aggressive (15%)', scenarios.get('aggressive_15pct')),
        ]
        elements.append(self._create_metric_table(scenario_metrics, "SIP Amount by Return Scenario"))
        elements.append(Spacer(1, 0.2*inch))

        # Insurance Analysis
        insurance = fire_plan.get('insurance_gap', {})
        insurance_metrics = [
            ('Recommended Term Cover', insurance.get('recommended_term_cover')),
            ('Recommended Health Cover', insurance.get('recommended_health_cover')),
        ]
        elements.append(self._create_metric_table(insurance_metrics, "Insurance Gap Analysis"))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_tax_plan_pdf(self, result, input_data):
        """Generate PDF for Tax Optimization Plan"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=self.pagesize, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []

        # Header
        elements.append(Paragraph("FinAI Tax Optimization Report", self.title_style))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", self.normal_style))
        elements.append(Spacer(1, 0.3*inch))

        # Best Regime Recommendation
        better = result.get('better_regime', 'N/A')
        savings = result.get('savings_with_better', 0)
        elements.append(Paragraph(f"<b>Recommended Regime: {better} (Saves ₹{self._format_number(savings)}/year)</b>", self.heading_style))
        elements.append(Spacer(1, 0.2*inch))

        # Old Regime
        old_metrics = [
            ('Taxable Income', result.get('old_taxable_income')),
            ('Total Deductions', result.get('old_deductions_total')),
            ('Tax Amount', result.get('old_tax')),
            ('Effective Rate', f"{result.get('old_eff_rate')}%"),
            ('Monthly TDS', result.get('old_monthly_tds')),
        ]
        elements.append(self._create_metric_table(old_metrics, "Old Regime Analysis"))
        elements.append(Spacer(1, 0.2*inch))

        # New Regime
        new_metrics = [
            ('Taxable Income', result.get('new_taxable_income')),
            ('Total Deductions', result.get('new_deductions_total')),
            ('Tax Amount', result.get('new_tax')),
            ('Effective Rate', f"{result.get('new_eff_rate')}%"),
            ('Monthly TDS', result.get('new_monthly_tds')),
        ]
        elements.append(self._create_metric_table(new_metrics, "New Regime Analysis"))
        elements.append(Spacer(1, 0.2*inch))

        # Deduction Gaps
        gaps = result.get('deduction_gaps', [])
        if gaps:
            elements.append(Paragraph("<b>Deduction Optimization Opportunities:</b>", self.heading_style))
            gap_data = []
            for gap in gaps[:5]:  # Limit to 5 gaps for space
                gap_data.append((
                    f"{gap.get('section')} - {gap.get('description')}",
                    f"₹{self._format_number(gap.get('unused_limit'))}"
                ))
            if gap_data:
                elements.append(self._create_metric_table(gap_data, "Unclaimed Deductions"))
                elements.append(Spacer(1, 0.3*inch))

        elements.append(Paragraph("This is a general tax planning recommendation. Consult with a tax professional for personalized advice.", self.normal_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_couples_plan_pdf(self, result, input_partner_a, input_partner_b):
        """Generate PDF for Couples Financial Plan"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=self.pagesize, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []

        # Header
        elements.append(Paragraph("FinAI Couples Financial Plan Report", self.title_style))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", self.normal_style))
        elements.append(Spacer(1, 0.3*inch))

        # Partner A
        partner_a_metrics = [
            ('Annual Income', input_partner_a.get('income')),
            ('Total Savings', input_partner_a.get('savings')),
            ('Net Worth', input_partner_a.get('net_worth')),
            ('SIP Target', input_partner_a.get('sip_target')),
        ]
        elements.append(self._create_metric_table(partner_a_metrics, "Partner A - Financial Profile"))
        elements.append(Spacer(1, 0.2*inch))

        # Partner B
        partner_b_metrics = [
            ('Annual Income', input_partner_b.get('income')),
            ('Total Savings', input_partner_b.get('savings')),
            ('Net Worth', input_partner_b.get('net_worth')),
            ('SIP Target', input_partner_b.get('sip_target')),
        ]
        elements.append(self._create_metric_table(partner_b_metrics, "Partner B - Financial Profile"))
        elements.append(Spacer(1, 0.2*inch))

        # Combined Metrics
        metrics = result.get('metrics', {})
        combined_metrics = [
            ('Combined Annual Income', metrics.get('combined_income')),
            ('Combined Net Worth', metrics.get('combined_net_worth')),
            ('Joint SIP Capacity', metrics.get('combined_sip_capacity')),
        ]
        elements.append(self._create_metric_table(combined_metrics, "Combined Financial Position"))
        elements.append(Spacer(1, 0.2*inch))

        # Recommendations
        recommendations = result.get('tax_strategy', [])
        if recommendations:
            elements.append(Paragraph("<b>Tax & Investment Recommendations:</b>", self.heading_style))
            rec_text = '\n'.join([f"• {rec}" for rec in recommendations[:5]])
            elements.append(Paragraph(rec_text, self.normal_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_full_analysis_pdf(self, data):
        """Generate comprehensive PDF for Full Analysis"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=self.pagesize, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []

        # Header
        elements.append(Paragraph("FinAI Comprehensive Financial Analysis Report", self.title_style))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", self.normal_style))
        elements.append(Spacer(1, 0.3*inch))

        # Financial Health
        financial_health = data.get('financial_health', {})
        score = financial_health.get('health_score', 0)
        elements.append(Paragraph(f"<b>Money Health Score: {score}/100 ({financial_health.get('grade')})</b>", self.heading_style))
        elements.append(Spacer(1, 0.15*inch))

        health_metrics = [
            ('Monthly Savings', financial_health.get('monthly_savings')),
            ('Savings Rate %', f"{financial_health.get('savings_rate_percent')}%"),
            ('Emergency Fund Months', financial_health.get('emergency_preparedness_months')),
            ('Debt-to-Income %', f"{financial_health.get('debt_ratio_percent')}%"),
        ]
        elements.append(self._create_metric_table(health_metrics, "Financial Health Snapshot"))
        elements.append(Spacer(1, 0.2*inch))

        # FIRE Plan
        fire_plan = data.get('fire_plan', {})
        fire_metrics = [
            ('Target Corpus', fire_plan.get('target_corpus')),
            ('Monthly SIP Required', fire_plan.get('monthly_sip_required')),
            ('Years to FIRE', fire_plan.get('years_to_reach')),
            ('On Track?', 'Yes ✓' if fire_plan.get('is_on_track') else 'No'),
        ]
        elements.append(self._create_metric_table(fire_metrics, "FIRE Plan Summary"))
        elements.append(Spacer(1, 0.2*inch))

        # Tax Optimization
        tax_opt = data.get('tax_optimization', {})
        tax_metrics = [
            ('Better Regime', tax_opt.get('better_regime')),
            ('Annual Tax Savings', tax_opt.get('savings_with_better')),
            ('Old Regime Tax', tax_opt.get('old_tax')),
            ('New Regime Tax', tax_opt.get('new_tax')),
        ]
        elements.append(self._create_metric_table(tax_metrics, "Tax Optimization"))
        elements.append(Spacer(1, 0.2*inch))

        # Recommendations
        recommendations = data.get('recommendations', {})
        if recommendations.get('suggestions'):
            elements.append(Paragraph("<b>AI Recommendations - Suggestions:</b>", self.heading_style))
            rec_text = '\n'.join([f"• {r}" for r in recommendations.get('suggestions', [])[:3]])
            elements.append(Paragraph(rec_text, self.normal_style))
            elements.append(Spacer(1, 0.15*inch))

        if recommendations.get('warnings'):
            elements.append(Paragraph("<b>Important Warnings:</b>", self.heading_style))
            warn_text = '\n'.join([f"• {w}" for w in recommendations.get('warnings', [])[:3]])
            elements.append(Paragraph(warn_text, self.normal_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer
