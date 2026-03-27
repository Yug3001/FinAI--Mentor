from agents.financial import FinancialAnalysisAgent
from agents.planning import PlanningAgent
from agents.tax import TaxAgent
from agents.recommendation import RecommendationAgent

class OrchestratorAgent:
    def __init__(self):
        self.financial_agent = FinancialAnalysisAgent()
        self.planning_agent = PlanningAgent()
        self.tax_agent = TaxAgent()
        self.recommendation_agent = RecommendationAgent()

    def process(self, user_data):
        # 1. Financial Analysis
        financial_status = self.financial_agent.analyze(user_data)
        
        # 2. Tax Optimization
        tax_status = self.tax_agent.optimize(user_data)
        
        # 3. Future Planning (FIRE)
        planning_status = self.planning_agent.plan(user_data, financial_status, tax_status)
        
        # 4. Final Recommendations
        recommendations = self.recommendation_agent.generate(
            financial_status, tax_status, planning_status
        )
        
        # Merge all outputs
        return {
            "financial_health": financial_status,
            "tax_optimization": tax_status,
            "fire_plan": planning_status,
            "recommendations": recommendations,
            "money_health_score": financial_status.get('health_score', 0),
            "input_data": user_data
        }
