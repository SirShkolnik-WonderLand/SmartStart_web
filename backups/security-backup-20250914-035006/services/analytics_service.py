#!/usr/bin/env python3
"""
Analytics Service - Python Brain
Handles all analytics, reporting, and data insights
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
import numpy as np
import math

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Analytics service handling all data analysis and reporting"""

    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        logger.info("📊 Analytics Service initialized")

    def get_user_analytics(self, user_id: str, period: str = '30d') -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Calculate date range
            end_date = datetime.now()
            if period == '7d':
                start_date = end_date - timedelta(days=7)
            elif period == '30d':
                start_date = end_date - timedelta(days=30)
            elif period == '90d':
                start_date = end_date - timedelta(days=90)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)

            # Get user data
            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return user_result

            user = user_result['data']

            # Get user activity data
            activity_data = self.nodejs_connector.get_user_activity_stats(
                user_id, start_date.isoformat(), end_date.isoformat()
            )

            # Get venture analytics
            venture_data = self.nodejs_connector.get_user_venture_stats(user_id)

            # Get gamification data
            gamification_data = self.nodejs_connector.get_user_gamification_stats(user_id)

            # Calculate engagement score
            engagement_score = self._calculate_engagement_score(activity_data.get('data', {}))

            # Calculate productivity metrics
            productivity_metrics = self._calculate_productivity_metrics(
                activity_data.get('data', {}),
                venture_data.get('data', {})
            )

            return {
                "success": True,
                "data": {
                    "user_id": user_id,
                    "period": period,
                    "engagement_score": engagement_score,
                    "productivity_metrics": productivity_metrics,
                    "activity_stats": activity_data.get('data', {}),
                    "venture_stats": venture_data.get('data', {}),
                    "gamification_stats": gamification_data.get('data', {}),
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"User analytics error: {e}")
            return {
                "success": False,
                "message": "Failed to get user analytics",
                "error": str(e)
            }

    def get_venture_analytics(self, venture_id: str, period: str = '30d') -> Dict[str, Any]:
        """Get comprehensive venture analytics"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Calculate date range
            end_date = datetime.now()
            if period == '7d':
                start_date = end_date - timedelta(days=7)
            elif period == '30d':
                start_date = end_date - timedelta(days=30)
            elif period == '90d':
                start_date = end_date - timedelta(days=90)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)

            # Get venture data
            venture_result = self.nodejs_connector.get_venture(venture_id)
            if not venture_result.get('success'):
                return venture_result

            venture = venture_result['data']

            # Get venture activity data
            activity_data = self.nodejs_connector.get_venture_activity_stats(
                venture_id, start_date.isoformat(), end_date.isoformat()
            )

            # Get team performance data
            team_data = self.nodejs_connector.get_venture_team_stats(venture_id)

            # Get financial metrics
            financial_data = self.nodejs_connector.get_venture_financial_stats(venture_id)

            # Calculate success probability
            success_probability = self._calculate_venture_success_probability(
                venture, activity_data.get('data', {}), team_data.get('data', {})
            )

            # Calculate growth metrics
            growth_metrics = self._calculate_venture_growth_metrics(
                activity_data.get('data', {}),
                financial_data.get('data', {})
            )

            return {
                "success": True,
                "data": {
                    "venture_id": venture_id,
                    "period": period,
                    "success_probability": success_probability,
                    "growth_metrics": growth_metrics,
                    "activity_stats": activity_data.get('data', {}),
                    "team_stats": team_data.get('data', {}),
                    "financial_stats": financial_data.get('data', {}),
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Venture analytics error: {e}")
            return {
                "success": False,
                "message": "Failed to get venture analytics",
                "error": str(e)
            }

    def get_platform_analytics(self, period: str = '30d') -> Dict[str, Any]:
        """Get platform-wide analytics"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Calculate date range
            end_date = datetime.now()
            if period == '7d':
                start_date = end_date - timedelta(days=7)
            elif period == '30d':
                start_date = end_date - timedelta(days=30)
            elif period == '90d':
                start_date = end_date - timedelta(days=90)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)

            # Get platform stats
            platform_stats = self.nodejs_connector.get_platform_stats(
                start_date.isoformat(), end_date.isoformat()
            )

            # Get user growth data
            user_growth = self.nodejs_connector.get_user_growth_stats(
                start_date.isoformat(), end_date.isoformat()
            )

            # Get venture growth data
            venture_growth = self.nodejs_connector.get_venture_growth_stats(
                start_date.isoformat(), end_date.isoformat()
            )

            # Get engagement metrics
            engagement_metrics = self.nodejs_connector.get_platform_engagement_stats(
                start_date.isoformat(), end_date.isoformat()
            )

            # Calculate platform health score
            health_score = self._calculate_platform_health_score(
                platform_stats.get('data', {}),
                user_growth.get('data', {}),
                engagement_metrics.get('data', {})
            )

            return {
                "success": True,
                "data": {
                    "period": period,
                    "health_score": health_score,
                    "platform_stats": platform_stats.get('data', {}),
                    "user_growth": user_growth.get('data', {}),
                    "venture_growth": venture_growth.get('data', {}),
                    "engagement_metrics": engagement_metrics.get('data', {}),
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Platform analytics error: {e}")
            return {
                "success": False,
                "message": "Failed to get platform analytics",
                "error": str(e)
            }

    def get_custom_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate custom analytics report"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            report_type = report_config.get('type')
            filters = report_config.get('filters', {})
            metrics = report_config.get('metrics', [])
            period = report_config.get('period', '30d')

            # Calculate date range
            end_date = datetime.now()
            if period == '7d':
                start_date = end_date - timedelta(days=7)
            elif period == '30d':
                start_date = end_date - timedelta(days=30)
            elif period == '90d':
                start_date = end_date - timedelta(days=90)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)

            # Generate report based on type
            if report_type == 'user_engagement':
                report_data = self._generate_user_engagement_report(
                    filters, start_date, end_date
                )
            elif report_type == 'venture_performance':
                report_data = self._generate_venture_performance_report(
                    filters, start_date, end_date
                )
            elif report_type == 'platform_health':
                report_data = self._generate_platform_health_report(
                    filters, start_date, end_date
                )
            else:
                return {
                    "success": False,
                    "message": f"Unknown report type: {report_type}",
                    "error_code": "INVALID_REPORT_TYPE"
                }

            return {
                "success": True,
                "data": {
                    "report_type": report_type,
                    "period": period,
                    "filters": filters,
                    "metrics": metrics,
                    "data": report_data,
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Custom report error: {e}")
            return {
                "success": False,
                "message": "Failed to generate custom report",
                "error": str(e)
            }

    def get_insights(self, user_id: str = None, venture_id: str = None) -> Dict[str, Any]:
        """Get AI-powered insights and recommendations"""
        try:
            insights = []

            if user_id:
                # Get user-specific insights
                user_insights = self._generate_user_insights(user_id)
                insights.extend(user_insights)

            if venture_id:
                # Get venture-specific insights
                venture_insights = self._generate_venture_insights(venture_id)
                insights.extend(venture_insights)

            # Get general platform insights
            platform_insights = self._generate_platform_insights()
            insights.extend(platform_insights)

            return {
                "success": True,
                "data": {
                    "insights": insights,
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Get insights error: {e}")
            return {
                "success": False,
                "message": "Failed to get insights",
                "error": str(e)
            }

    def get_ai_predictions(self, prediction_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Get AI-powered predictions for various scenarios"""
        try:
            if prediction_type == "venture_success":
                return self._predict_venture_success(data)
            elif prediction_type == "user_churn":
                return self._predict_user_churn(data)
            elif prediction_type == "market_trends":
                return self._predict_market_trends(data)
            elif prediction_type == "investment_returns":
                return self._predict_investment_returns(data)
            elif prediction_type == "team_performance":
                return self._predict_team_performance(data)
            else:
                return {
                    "success": False,
                    "message": f"Unknown prediction type: {prediction_type}",
                    "error_code": "INVALID_PREDICTION_TYPE"
                }

        except Exception as e:
            logger.error(f"AI predictions error: {e}")
            return {
                "success": False,
                "message": "Failed to get AI predictions",
                "error": str(e)
            }

    def get_ml_recommendations(self, user_id: str, recommendation_type: str = "general") -> Dict[str, Any]:
        """Get ML-powered recommendations for users"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Get user data
            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return user_result

            user = user_result['data']

            recommendations = []

            if recommendation_type == "ventures":
                recommendations = self._get_venture_recommendations(user)
            elif recommendation_type == "collaborators":
                recommendations = self._get_collaborator_recommendations(user)
            elif recommendation_type == "investments":
                recommendations = self._get_investment_recommendations(user)
            elif recommendation_type == "skills":
                recommendations = self._get_skill_recommendations(user)
            else:
                recommendations = self._get_general_recommendations(user)

            return {
                "success": True,
                "data": {
                    "user_id": user_id,
                    "recommendation_type": recommendation_type,
                    "recommendations": recommendations,
                    "confidence_scores": self._calculate_confidence_scores(recommendations),
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"ML recommendations error: {e}")
            return {
                "success": False,
                "message": "Failed to get ML recommendations",
                "error": str(e)
            }

    def get_anomaly_detection(self, data_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies in user behavior or system data"""
        try:
            anomalies = []

            if data_type == "user_behavior":
                anomalies = self._detect_user_behavior_anomalies(data)
            elif data_type == "venture_performance":
                anomalies = self._detect_venture_performance_anomalies(data)
            elif data_type == "system_metrics":
                anomalies = self._detect_system_anomalies(data)
            elif data_type == "financial_data":
                anomalies = self._detect_financial_anomalies(data)
            else:
                return {
                    "success": False,
                    "message": f"Unknown data type: {data_type}",
                    "error_code": "INVALID_DATA_TYPE"
                }

            return {
                "success": True,
                "data": {
                    "data_type": data_type,
                    "anomalies": anomalies,
                    "anomaly_count": len(anomalies),
                    "severity_levels": self._calculate_anomaly_severity(anomalies),
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return {
                "success": False,
                "message": "Failed to detect anomalies",
                "error": str(e)
            }

    def get_sentiment_analysis(self, text_data: List[str], analysis_type: str = "general") -> Dict[str, Any]:
        """Perform sentiment analysis on text data"""
        try:
            sentiments = []
            overall_sentiment = 0.0

            for text in text_data:
                sentiment_score = self._analyze_text_sentiment(text)
                sentiments.append({
                    "text": text[:100] + "..." if len(text) > 100 else text,
                    "sentiment_score": sentiment_score,
                    "sentiment_label": self._get_sentiment_label(sentiment_score)
                })

            if sentiments:
                overall_sentiment = sum(s['sentiment_score'] for s in sentiments) / len(sentiments)

            return {
                "success": True,
                "data": {
                    "analysis_type": analysis_type,
                    "overall_sentiment": overall_sentiment,
                    "overall_label": self._get_sentiment_label(overall_sentiment),
                    "individual_sentiments": sentiments,
                    "positive_count": len([s for s in sentiments if s['sentiment_score'] > 0.1]),
                    "negative_count": len([s for s in sentiments if s['sentiment_score'] < -0.1]),
                    "neutral_count": len([s for s in sentiments if -0.1 <= s['sentiment_score'] <= 0.1]),
                    "generated_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {
                "success": False,
                "message": "Failed to perform sentiment analysis",
                "error": str(e)
            }

    def _calculate_engagement_score(self, activity_data: Dict[str, Any]) -> float:
        """Calculate user engagement score (0-100)"""
        try:
            # Base score
            score = 0.0

            # Login frequency (30% weight)
            login_count = activity_data.get('login_count', 0)
            score += min(login_count * 2, 30)

            # Feature usage (40% weight)
            feature_usage = activity_data.get('feature_usage', {})
            feature_score = sum(feature_usage.values()) * 0.4
            score += min(feature_score, 40)

            # Content creation (30% weight)
            content_created = activity_data.get('content_created', 0)
            score += min(content_created * 3, 30)

            return min(score, 100.0)

        except Exception as e:
            logger.error(f"Calculate engagement score error: {e}")
            return 0.0

    def _calculate_productivity_metrics(self, activity_data: Dict[str, Any], 
                                      venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate productivity metrics"""
        try:
            return {
                "tasks_completed": activity_data.get('tasks_completed', 0),
                "ventures_created": venture_data.get('ventures_created', 0),
                "collaborations": activity_data.get('collaborations', 0),
                "time_spent": activity_data.get('time_spent', 0),
                "efficiency_score": self._calculate_efficiency_score(activity_data)
            }

        except Exception as e:
            logger.error(f"Calculate productivity metrics error: {e}")
            return {}

    def _calculate_efficiency_score(self, activity_data: Dict[str, Any]) -> float:
        """Calculate efficiency score (0-100)"""
        try:
            tasks_completed = activity_data.get('tasks_completed', 0)
            time_spent = activity_data.get('time_spent', 1)  # Avoid division by zero

            if time_spent == 0:
                return 0.0

            # Tasks per hour
            tasks_per_hour = tasks_completed / (time_spent / 3600)
            
            # Normalize to 0-100 scale
            efficiency = min(tasks_per_hour * 10, 100)
            return round(efficiency, 2)

        except Exception as e:
            logger.error(f"Calculate efficiency score error: {e}")
            return 0.0

    def _calculate_venture_success_probability(self, venture: Dict[str, Any], 
                                             activity_data: Dict[str, Any],
                                             team_data: Dict[str, Any]) -> float:
        """Calculate venture success probability (0-100)"""
        try:
            # Base probability
            probability = 50.0

            # Team size factor
            team_size = team_data.get('team_size', 1)
            if team_size >= 3:
                probability += 10
            elif team_size >= 5:
                probability += 20

            # Activity level factor
            activity_level = activity_data.get('activity_level', 0)
            probability += min(activity_level * 2, 20)

            # Venture age factor
            created_at = venture.get('created_at')
            if created_at:
                venture_age_days = (datetime.now() - datetime.fromisoformat(created_at)).days
                if venture_age_days > 30:
                    probability += 10
                if venture_age_days > 90:
                    probability += 10

            return min(probability, 100.0)

        except Exception as e:
            logger.error(f"Calculate venture success probability error: {e}")
            return 50.0

    def _calculate_venture_growth_metrics(self, activity_data: Dict[str, Any],
                                        financial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate venture growth metrics"""
        try:
            return {
                "user_growth": activity_data.get('user_growth', 0),
                "revenue_growth": financial_data.get('revenue_growth', 0),
                "engagement_growth": activity_data.get('engagement_growth', 0),
                "growth_rate": self._calculate_growth_rate(activity_data, financial_data)
            }

        except Exception as e:
            logger.error(f"Calculate venture growth metrics error: {e}")
            return {}

    def _calculate_growth_rate(self, activity_data: Dict[str, Any], 
                             financial_data: Dict[str, Any]) -> float:
        """Calculate overall growth rate"""
        try:
            user_growth = activity_data.get('user_growth', 0)
            revenue_growth = financial_data.get('revenue_growth', 0)
            
            # Weighted average
            growth_rate = (user_growth * 0.6) + (revenue_growth * 0.4)
            return round(growth_rate, 2)

        except Exception as e:
            logger.error(f"Calculate growth rate error: {e}")
            return 0.0

    def _calculate_platform_health_score(self, platform_stats: Dict[str, Any],
                                       user_growth: Dict[str, Any],
                                       engagement_metrics: Dict[str, Any]) -> float:
        """Calculate platform health score (0-100)"""
        try:
            # Base score
            score = 0.0

            # User growth (40% weight)
            new_users = user_growth.get('new_users', 0)
            score += min(new_users * 0.1, 40)

            # Engagement (40% weight)
            avg_engagement = engagement_metrics.get('avg_engagement', 0)
            score += min(avg_engagement * 0.4, 40)

            # Platform stability (20% weight)
            uptime = platform_stats.get('uptime', 0)
            score += min(uptime * 0.2, 20)

            return min(score, 100.0)

        except Exception as e:
            logger.error(f"Calculate platform health score error: {e}")
            return 0.0

    def _generate_user_insights(self, user_id: str) -> List[Dict[str, Any]]:
        """Generate user-specific insights"""
        try:
            insights = []

            # Get user data
            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return insights

            user = user_result['data']

            # Example insights
            insights.append({
                "type": "engagement",
                "title": "Increase Your Activity",
                "message": "You've been less active this week. Try logging in daily to maintain your streak!",
                "priority": "medium",
                "action": "login_daily"
            })

            insights.append({
                "type": "productivity",
                "title": "Complete Your Profile",
                "message": "Your profile is 60% complete. Adding more details can help you connect with others.",
                "priority": "high",
                "action": "complete_profile"
            })

            return insights

        except Exception as e:
            logger.error(f"Generate user insights error: {e}")
            return []

    def _generate_venture_insights(self, venture_id: str) -> List[Dict[str, Any]]:
        """Generate venture-specific insights"""
        try:
            insights = []

            # Get venture data
            venture_result = self.nodejs_connector.get_venture(venture_id)
            if not venture_result.get('success'):
                return insights

            venture = venture_result['data']

            # Example insights
            insights.append({
                "type": "growth",
                "title": "Expand Your Team",
                "message": "Your venture has 2 team members. Consider adding more to accelerate growth.",
                "priority": "medium",
                "action": "recruit_team_members"
            })

            insights.append({
                "type": "strategy",
                "title": "Update Your Business Plan",
                "message": "Your business plan hasn't been updated in 30 days. Consider refreshing it.",
                "priority": "low",
                "action": "update_business_plan"
            })

            return insights

        except Exception as e:
            logger.error(f"Generate venture insights error: {e}")
            return []

    def _generate_platform_insights(self) -> List[Dict[str, Any]]:
        """Generate general platform insights"""
        try:
            insights = []

            # Example platform insights
            insights.append({
                "type": "platform",
                "title": "New Feature Available",
                "message": "Check out our new AI-powered venture recommendations!",
                "priority": "low",
                "action": "explore_features"
            })

            insights.append({
                "type": "community",
                "title": "Join the Discussion",
                "message": "Connect with other entrepreneurs in our community forum.",
                "priority": "medium",
                "action": "join_community"
            })

            return insights

        except Exception as e:
            logger.error(f"Generate platform insights error: {e}")
            return []

    def _generate_user_engagement_report(self, filters: Dict[str, Any], 
                                       start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate user engagement report"""
        try:
            # This would contain actual report generation logic
            return {
                "total_users": 0,
                "active_users": 0,
                "engagement_rate": 0.0,
                "top_features": [],
                "user_segments": {}
            }

        except Exception as e:
            logger.error(f"Generate user engagement report error: {e}")
            return {}

    def _generate_venture_performance_report(self, filters: Dict[str, Any],
                                           start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate venture performance report"""
        try:
            # This would contain actual report generation logic
            return {
                "total_ventures": 0,
                "successful_ventures": 0,
                "success_rate": 0.0,
                "top_performers": [],
                "industry_breakdown": {}
            }

        except Exception as e:
            logger.error(f"Generate venture performance report error: {e}")
            return {}

    def _generate_platform_health_report(self, filters: Dict[str, Any],
                                       start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate platform health report"""
        try:
            # This would contain actual report generation logic
            return {
                "uptime": 99.9,
                "response_time": 150,
                "error_rate": 0.1,
                "user_satisfaction": 4.5,
                "system_metrics": {}
            }

        except Exception as e:
            logger.error(f"Generate platform health report error: {e}")
            return {}

    # ===== AI/ML PREDICTION METHODS =====

    def _predict_venture_success(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict venture success probability using ML algorithms"""
        try:
            # Extract features
            team_size = data.get('team_size', 1)
            funding_amount = data.get('funding_amount', 0)
            market_size = data.get('market_size', 0)
            competition_level = data.get('competition_level', 0.5)
            founder_experience = data.get('founder_experience', 0)
            
            # Simple ML model (in production, this would use scikit-learn, TensorFlow, etc.)
            success_score = 0.0
            
            # Team size factor (0-30 points)
            success_score += min(team_size * 5, 30)
            
            # Funding factor (0-25 points)
            if funding_amount > 0:
                success_score += min(math.log(funding_amount + 1) * 3, 25)
            
            # Market size factor (0-20 points)
            success_score += min(market_size * 0.1, 20)
            
            # Competition factor (0-15 points)
            success_score += (1 - competition_level) * 15
            
            # Experience factor (0-10 points)
            success_score += min(founder_experience * 2, 10)
            
            # Normalize to 0-100
            success_probability = min(success_score, 100)
            
            return {
                "success": True,
                "data": {
                    "prediction_type": "venture_success",
                    "success_probability": round(success_probability, 2),
                    "confidence": 0.85,
                    "key_factors": {
                        "team_size_impact": min(team_size * 5, 30),
                        "funding_impact": min(math.log(funding_amount + 1) * 3, 25) if funding_amount > 0 else 0,
                        "market_impact": min(market_size * 0.1, 20),
                        "competition_impact": (1 - competition_level) * 15,
                        "experience_impact": min(founder_experience * 2, 10)
                    },
                    "recommendations": self._get_venture_success_recommendations(success_probability),
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Venture success prediction error: {e}")
            return {"success": False, "message": "Failed to predict venture success", "error": str(e)}

    def _predict_user_churn(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict user churn probability"""
        try:
            # Extract features
            days_since_last_login = data.get('days_since_last_login', 0)
            engagement_score = data.get('engagement_score', 0)
            support_tickets = data.get('support_tickets', 0)
            feature_usage = data.get('feature_usage', 0)
            
            # Simple churn prediction model
            churn_score = 0.0
            
            # Days since last login (0-40 points)
            churn_score += min(days_since_last_login * 2, 40)
            
            # Low engagement (0-30 points)
            churn_score += max(0, (50 - engagement_score) * 0.6)
            
            # Support tickets (0-20 points)
            churn_score += min(support_tickets * 5, 20)
            
            # Low feature usage (0-10 points)
            churn_score += max(0, (10 - feature_usage) * 1)
            
            churn_probability = min(churn_score, 100)
            
            return {
                "success": True,
                "data": {
                    "prediction_type": "user_churn",
                    "churn_probability": round(churn_probability, 2),
                    "risk_level": "high" if churn_probability > 70 else "medium" if churn_probability > 40 else "low",
                    "confidence": 0.78,
                    "key_factors": {
                        "inactivity_impact": min(days_since_last_login * 2, 40),
                        "engagement_impact": max(0, (50 - engagement_score) * 0.6),
                        "support_impact": min(support_tickets * 5, 20),
                        "usage_impact": max(0, (10 - feature_usage) * 1)
                    },
                    "retention_strategies": self._get_churn_prevention_strategies(churn_probability),
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"User churn prediction error: {e}")
            return {"success": False, "message": "Failed to predict user churn", "error": str(e)}

    def _predict_market_trends(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict market trends and opportunities"""
        try:
            # Extract market data
            industry = data.get('industry', 'general')
            current_trends = data.get('current_trends', [])
            historical_data = data.get('historical_data', {})
            
            # Simple trend prediction
            trend_score = 50.0  # Base score
            
            # Industry-specific adjustments
            industry_multipliers = {
                'technology': 1.2,
                'healthcare': 1.1,
                'finance': 1.0,
                'education': 0.9,
                'retail': 0.8
            }
            
            trend_score *= industry_multipliers.get(industry, 1.0)
            
            # Current trends impact
            if current_trends:
                trend_score += len(current_trends) * 5
            
            # Historical growth impact
            if historical_data.get('growth_rate', 0) > 0:
                trend_score += historical_data['growth_rate'] * 10
            
            trend_probability = min(trend_score, 100)
            
            return {
                "success": True,
                "data": {
                    "prediction_type": "market_trends",
                    "trend_probability": round(trend_probability, 2),
                    "industry": industry,
                    "trend_direction": "positive" if trend_probability > 60 else "neutral" if trend_probability > 40 else "negative",
                    "confidence": 0.72,
                    "opportunities": self._identify_market_opportunities(industry, trend_probability),
                    "risks": self._identify_market_risks(industry, trend_probability),
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Market trends prediction error: {e}")
            return {"success": False, "message": "Failed to predict market trends", "error": str(e)}

    def _predict_investment_returns(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict investment returns and ROI"""
        try:
            # Extract investment data
            investment_amount = data.get('investment_amount', 0)
            venture_stage = data.get('venture_stage', 'early')
            market_conditions = data.get('market_conditions', 0.5)
            team_quality = data.get('team_quality', 0.5)
            
            # Simple ROI prediction model
            base_roi = 0.0
            
            # Stage-based returns
            stage_multipliers = {
                'idea': 0.1,
                'early': 0.3,
                'growth': 0.6,
                'mature': 0.4
            }
            
            base_roi = stage_multipliers.get(venture_stage, 0.3)
            
            # Market conditions impact
            market_impact = (market_conditions - 0.5) * 2
            base_roi += market_impact
            
            # Team quality impact
            team_impact = (team_quality - 0.5) * 1.5
            base_roi += team_impact
            
            # Investment amount impact (larger investments = higher risk/reward)
            if investment_amount > 100000:
                base_roi *= 1.2
            elif investment_amount < 10000:
                base_roi *= 0.8
            
            # Convert to percentage
            expected_roi = max(0, base_roi * 100)
            
            return {
                "success": True,
                "data": {
                    "prediction_type": "investment_returns",
                    "expected_roi": round(expected_roi, 2),
                    "investment_amount": investment_amount,
                    "venture_stage": venture_stage,
                    "confidence": 0.68,
                    "risk_level": "high" if expected_roi > 50 else "medium" if expected_roi > 20 else "low",
                    "time_horizon": self._get_investment_time_horizon(venture_stage),
                    "key_factors": {
                        "stage_impact": stage_multipliers.get(venture_stage, 0.3) * 100,
                        "market_impact": market_impact * 100,
                        "team_impact": team_impact * 100,
                        "amount_impact": 20 if investment_amount > 100000 else -20 if investment_amount < 10000 else 0
                    },
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Investment returns prediction error: {e}")
            return {"success": False, "message": "Failed to predict investment returns", "error": str(e)}

    def _predict_team_performance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict team performance and productivity"""
        try:
            # Extract team data
            team_size = data.get('team_size', 1)
            skill_diversity = data.get('skill_diversity', 0.5)
            communication_frequency = data.get('communication_frequency', 0.5)
            previous_performance = data.get('previous_performance', 0.5)
            
            # Simple team performance prediction
            performance_score = 0.0
            
            # Team size factor (optimal around 5-7 people)
            if 5 <= team_size <= 7:
                performance_score += 30
            elif 3 <= team_size <= 9:
                performance_score += 20
            else:
                performance_score += 10
            
            # Skill diversity factor
            performance_score += skill_diversity * 25
            
            # Communication factor
            performance_score += communication_frequency * 25
            
            # Previous performance factor
            performance_score += previous_performance * 20
            
            performance_probability = min(performance_score, 100)
            
            return {
                "success": True,
                "data": {
                    "prediction_type": "team_performance",
                    "performance_probability": round(performance_probability, 2),
                    "team_size": team_size,
                    "performance_level": "excellent" if performance_probability > 80 else "good" if performance_probability > 60 else "needs_improvement",
                    "confidence": 0.75,
                    "recommendations": self._get_team_performance_recommendations(performance_probability, team_size),
                    "key_factors": {
                        "size_impact": 30 if 5 <= team_size <= 7 else 20 if 3 <= team_size <= 9 else 10,
                        "diversity_impact": skill_diversity * 25,
                        "communication_impact": communication_frequency * 25,
                        "history_impact": previous_performance * 20
                    },
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Team performance prediction error: {e}")
            return {"success": False, "message": "Failed to predict team performance", "error": str(e)}

    # ===== ML RECOMMENDATION METHODS =====

    def _get_venture_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get venture recommendations for user"""
        try:
            recommendations = []
            
            # Based on user skills and interests
            user_skills = user.get('skills', [])
            user_interests = user.get('interests', [])
            
            # Sample venture recommendations
            if 'technology' in user_skills or 'tech' in user_interests:
                recommendations.append({
                    "type": "venture",
                    "title": "AI-Powered SaaS Platform",
                    "description": "Build a SaaS platform using AI to solve business problems",
                    "match_score": 0.85,
                    "reason": "Matches your technology skills and interests",
                    "action": "create_venture"
                })
            
            if 'finance' in user_skills or 'fintech' in user_interests:
                recommendations.append({
                    "type": "venture",
                    "title": "Fintech Mobile App",
                    "description": "Create a mobile app for personal finance management",
                    "match_score": 0.78,
                    "reason": "Aligns with your finance background",
                    "action": "create_venture"
                })
            
            return recommendations[:5]  # Return top 5
            
        except Exception as e:
            logger.error(f"Venture recommendations error: {e}")
            return []

    def _get_collaborator_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get collaborator recommendations for user"""
        try:
            recommendations = []
            
            # Sample collaborator recommendations
            recommendations.append({
                "type": "collaborator",
                "title": "Find a Technical Co-founder",
                "description": "Connect with developers who complement your skills",
                "match_score": 0.82,
                "reason": "You have business skills but need technical expertise",
                "action": "find_collaborators"
            })
            
            recommendations.append({
                "type": "collaborator",
                "title": "Join a Marketing Expert",
                "description": "Partner with someone experienced in digital marketing",
                "match_score": 0.75,
                "reason": "Marketing expertise would accelerate your venture growth",
                "action": "find_collaborators"
            })
            
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"Collaborator recommendations error: {e}")
            return []

    def _get_investment_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get investment recommendations for user"""
        try:
            recommendations = []
            
            # Sample investment recommendations
            recommendations.append({
                "type": "investment",
                "title": "Diversify Your Portfolio",
                "description": "Consider investing in different industries to reduce risk",
                "match_score": 0.88,
                "reason": "Your current investments are concentrated in one sector",
                "action": "diversify_investments"
            })
            
            recommendations.append({
                "type": "investment",
                "title": "Early-Stage Tech Startups",
                "description": "Invest in promising early-stage technology companies",
                "match_score": 0.72,
                "reason": "Matches your risk tolerance and expertise",
                "action": "explore_investments"
            })
            
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"Investment recommendations error: {e}")
            return []

    def _get_skill_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get skill development recommendations for user"""
        try:
            recommendations = []
            
            # Sample skill recommendations
            recommendations.append({
                "type": "skill",
                "title": "Learn Data Analysis",
                "description": "Develop skills in data analysis and visualization",
                "match_score": 0.85,
                "reason": "High demand skill that complements your current expertise",
                "action": "learn_skill"
            })
            
            recommendations.append({
                "type": "skill",
                "title": "Improve Leadership Skills",
                "description": "Enhance your team leadership and management abilities",
                "match_score": 0.78,
                "reason": "Essential for scaling your ventures",
                "action": "learn_skill"
            })
            
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"Skill recommendations error: {e}")
            return []

    def _get_general_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get general recommendations for user"""
        try:
            recommendations = []
            
            # Sample general recommendations
            recommendations.append({
                "type": "general",
                "title": "Complete Your Profile",
                "description": "Add more details to your profile to increase visibility",
                "match_score": 0.90,
                "reason": "Your profile is only 60% complete",
                "action": "complete_profile"
            })
            
            recommendations.append({
                "type": "general",
                "title": "Join a Venture",
                "description": "Consider joining an existing venture as a team member",
                "match_score": 0.75,
                "reason": "Gain experience before starting your own venture",
                "action": "join_venture"
            })
            
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"General recommendations error: {e}")
            return []

    def _calculate_confidence_scores(self, recommendations: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate confidence scores for recommendations"""
        try:
            if not recommendations:
                return {}
            
            avg_confidence = sum(rec.get('match_score', 0) for rec in recommendations) / len(recommendations)
            
            return {
                "average_confidence": round(avg_confidence, 3),
                "high_confidence_count": len([r for r in recommendations if r.get('match_score', 0) > 0.8]),
                "medium_confidence_count": len([r for r in recommendations if 0.5 <= r.get('match_score', 0) <= 0.8]),
                "low_confidence_count": len([r for r in recommendations if r.get('match_score', 0) < 0.5])
            }
            
        except Exception as e:
            logger.error(f"Confidence scores calculation error: {e}")
            return {}

    # ===== ANOMALY DETECTION METHODS =====

    def _detect_user_behavior_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect anomalies in user behavior"""
        try:
            anomalies = []
            
            # Check for unusual login patterns
            login_frequency = data.get('login_frequency', 0)
            if login_frequency < 0.1:  # Less than 10% of normal
                anomalies.append({
                    "type": "login_anomaly",
                    "severity": "high",
                    "description": "Unusually low login frequency detected",
                    "value": login_frequency,
                    "threshold": 0.1,
                    "recommendation": "Check if user needs re-engagement"
                })
            
            # Check for unusual activity patterns
            activity_score = data.get('activity_score', 0)
            if activity_score < 20:  # Very low activity
                anomalies.append({
                    "type": "activity_anomaly",
                    "severity": "medium",
                    "description": "Very low activity score detected",
                    "value": activity_score,
                    "threshold": 20,
                    "recommendation": "Send engagement campaign"
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"User behavior anomaly detection error: {e}")
            return []

    def _detect_venture_performance_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect anomalies in venture performance"""
        try:
            anomalies = []
            
            # Check for unusual growth patterns
            growth_rate = data.get('growth_rate', 0)
            if growth_rate < -50:  # Negative growth
                anomalies.append({
                    "type": "growth_anomaly",
                    "severity": "high",
                    "description": "Significant negative growth detected",
                    "value": growth_rate,
                    "threshold": -50,
                    "recommendation": "Investigate causes and implement recovery plan"
                })
            
            # Check for unusual team changes
            team_churn = data.get('team_churn_rate', 0)
            if team_churn > 0.5:  # High team turnover
                anomalies.append({
                    "type": "team_anomaly",
                    "severity": "medium",
                    "description": "High team churn rate detected",
                    "value": team_churn,
                    "threshold": 0.5,
                    "recommendation": "Investigate team satisfaction and retention"
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Venture performance anomaly detection error: {e}")
            return []

    def _detect_system_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect system-level anomalies"""
        try:
            anomalies = []
            
            # Check for high error rates
            error_rate = data.get('error_rate', 0)
            if error_rate > 0.05:  # More than 5% errors
                anomalies.append({
                    "type": "error_anomaly",
                    "severity": "high",
                    "description": "High error rate detected",
                    "value": error_rate,
                    "threshold": 0.05,
                    "recommendation": "Investigate and fix system issues"
                })
            
            # Check for unusual response times
            response_time = data.get('avg_response_time', 0)
            if response_time > 2000:  # More than 2 seconds
                anomalies.append({
                    "type": "performance_anomaly",
                    "severity": "medium",
                    "description": "High response time detected",
                    "value": response_time,
                    "threshold": 2000,
                    "recommendation": "Optimize system performance"
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"System anomaly detection error: {e}")
            return []

    def _detect_financial_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect financial anomalies"""
        try:
            anomalies = []
            
            # Check for unusual transaction patterns
            transaction_volume = data.get('transaction_volume', 0)
            avg_volume = data.get('avg_transaction_volume', 1000)
            
            if transaction_volume > avg_volume * 3:  # 3x normal volume
                anomalies.append({
                    "type": "transaction_anomaly",
                    "severity": "high",
                    "description": "Unusually high transaction volume",
                    "value": transaction_volume,
                    "threshold": avg_volume * 3,
                    "recommendation": "Verify transaction legitimacy"
                })
            
            # Check for unusual spending patterns
            spending_rate = data.get('spending_rate', 0)
            if spending_rate > 0.8:  # More than 80% of income
                anomalies.append({
                    "type": "spending_anomaly",
                    "severity": "medium",
                    "description": "High spending rate detected",
                    "value": spending_rate,
                    "threshold": 0.8,
                    "recommendation": "Review spending patterns and budget"
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Financial anomaly detection error: {e}")
            return []

    def _calculate_anomaly_severity(self, anomalies: List[Dict[str, Any]]) -> Dict[str, int]:
        """Calculate anomaly severity levels"""
        try:
            severity_counts = {"high": 0, "medium": 0, "low": 0}
            
            for anomaly in anomalies:
                severity = anomaly.get('severity', 'low')
                if severity in severity_counts:
                    severity_counts[severity] += 1
            
            return severity_counts
            
        except Exception as e:
            logger.error(f"Anomaly severity calculation error: {e}")
            return {"high": 0, "medium": 0, "low": 0}

    # ===== SENTIMENT ANALYSIS METHODS =====

    def _analyze_text_sentiment(self, text: str) -> float:
        """Analyze sentiment of text (returns score from -1 to 1)"""
        try:
            # Simple sentiment analysis (in production, use VADER, TextBlob, or BERT)
            positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'excited']
            negative_words = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated', 'worried']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            total_words = len(text.split())
            if total_words == 0:
                return 0.0
            
            # Calculate sentiment score
            sentiment_score = (positive_count - negative_count) / total_words
            
            # Normalize to -1 to 1 range
            return max(-1.0, min(1.0, sentiment_score * 10))
            
        except Exception as e:
            logger.error(f"Text sentiment analysis error: {e}")
            return 0.0

    def _get_sentiment_label(self, sentiment_score: float) -> str:
        """Get sentiment label from score"""
        if sentiment_score > 0.1:
            return "positive"
        elif sentiment_score < -0.1:
            return "negative"
        else:
            return "neutral"

    # ===== HELPER METHODS =====

    def _get_venture_success_recommendations(self, success_probability: float) -> List[str]:
        """Get recommendations based on venture success probability"""
        recommendations = []
        
        if success_probability < 30:
            recommendations.extend([
                "Consider pivoting your business model",
                "Strengthen your team with experienced members",
                "Conduct more market research",
                "Seek mentorship from successful entrepreneurs"
            ])
        elif success_probability < 60:
            recommendations.extend([
                "Focus on customer acquisition",
                "Improve your product-market fit",
                "Consider additional funding",
                "Build strategic partnerships"
            ])
        else:
            recommendations.extend([
                "Scale your operations carefully",
                "Focus on sustainable growth",
                "Consider international expansion",
                "Build a strong company culture"
            ])
        
        return recommendations

    def _get_churn_prevention_strategies(self, churn_probability: float) -> List[str]:
        """Get strategies to prevent user churn"""
        strategies = []
        
        if churn_probability > 70:
            strategies.extend([
                "Send personalized re-engagement email",
                "Offer exclusive features or discounts",
                "Assign a dedicated success manager",
                "Conduct user feedback survey"
            ])
        elif churn_probability > 40:
            strategies.extend([
                "Send weekly engagement tips",
                "Highlight new features and updates",
                "Connect with similar users",
                "Provide additional training resources"
            ])
        else:
            strategies.extend([
                "Continue regular check-ins",
                "Maintain current engagement level",
                "Monitor for early warning signs"
            ])
        
        return strategies

    def _identify_market_opportunities(self, industry: str, trend_probability: float) -> List[str]:
        """Identify market opportunities based on trends"""
        opportunities = []
        
        if trend_probability > 70:
            opportunities.extend([
                f"High growth potential in {industry} sector",
                "Early mover advantage available",
                "Strong investor interest expected",
                "Talent acquisition opportunities"
            ])
        elif trend_probability > 40:
            opportunities.extend([
                f"Moderate growth in {industry} sector",
                "Stable market conditions",
                "Consistent demand expected"
            ])
        else:
            opportunities.extend([
                f"Challenging conditions in {industry} sector",
                "Focus on niche markets",
                "Cost optimization opportunities"
            ])
        
        return opportunities

    def _identify_market_risks(self, industry: str, trend_probability: float) -> List[str]:
        """Identify market risks based on trends"""
        risks = []
        
        if trend_probability < 40:
            risks.extend([
                f"Declining demand in {industry} sector",
                "Increased competition expected",
                "Regulatory challenges possible",
                "Economic headwinds likely"
            ])
        elif trend_probability < 70:
            risks.extend([
                f"Moderate risks in {industry} sector",
                "Market saturation concerns",
                "Technology disruption possible"
            ])
        else:
            risks.extend([
                f"Low risks in {industry} sector",
                "Strong market fundamentals",
                "Growth opportunities available"
            ])
        
        return risks

    def _get_investment_time_horizon(self, venture_stage: str) -> str:
        """Get investment time horizon based on venture stage"""
        horizons = {
            'idea': '5-10 years',
            'early': '3-7 years',
            'growth': '2-5 years',
            'mature': '1-3 years'
        }
        return horizons.get(venture_stage, '3-5 years')

    def _get_team_performance_recommendations(self, performance_probability: float, team_size: int) -> List[str]:
        """Get team performance recommendations"""
        recommendations = []
        
        if performance_probability < 50:
            recommendations.extend([
                "Improve team communication",
                "Clarify roles and responsibilities",
                "Provide additional training",
                "Consider team restructuring"
            ])
        elif performance_probability < 80:
            recommendations.extend([
                "Enhance collaboration tools",
                "Set clear performance metrics",
                "Provide regular feedback",
                "Encourage skill development"
            ])
        else:
            recommendations.extend([
                "Maintain current performance level",
                "Focus on scaling processes",
                "Share best practices",
                "Consider team expansion"
            ])
        
        if team_size < 3:
            recommendations.append("Consider adding more team members")
        elif team_size > 10:
            recommendations.append("Consider breaking into smaller teams")
        
        return recommendations
