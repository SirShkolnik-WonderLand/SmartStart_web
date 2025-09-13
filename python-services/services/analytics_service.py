#!/usr/bin/env python3
"""
Analytics Service - Python Brain
Handles all analytics, reporting, and data insights
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json

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
