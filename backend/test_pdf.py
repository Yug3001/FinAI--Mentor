from pdf_generator import FinAIPDFGenerator
import io

# Initialize
pg = FinAIPDFGenerator()

# Test data
result = {
    'health_score': 72,
    'grade': 'A',
    'dimensions': {
        'savings_rate': 75,
        'emergency_fund': 85,
        'debt_health': 60,
        'investment_rate': 70,
        'income_cushion': 80,
        'net_worth_proxy': 65
    },
    'monthly_savings': 60000,
    'savings_rate_percent': 50,
    'debt_ratio_percent': 25,
    'emergency_preparedness_months': 3.3,
    'net_worth': 1200000
}

input_data = {
    'monthly_income': 120000,
    'monthly_expenses': 60000,
    'total_debt': 300000,
    'emergency_fund': 180000,
    'total_investments': 500000
}

try:
    buffer = pg.generate_health_score_pdf(result, input_data)
    print(f"PDF generated successfully! Buffer size: {len(buffer.getvalue())} bytes")
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
