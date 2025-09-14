#!/usr/bin/env python3
"""
Cache Service - Python Brain
Handles caching, performance optimization, and data acceleration
"""

import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import hashlib
import threading
from collections import OrderedDict

logger = logging.getLogger(__name__)

class CacheService:
    """Advanced caching service for performance optimization"""
    
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.cache = OrderedDict()  # LRU cache
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "total_requests": 0
        }
        self.max_cache_size = 1000  # Maximum number of items
        self.default_ttl = 300  # 5 minutes default TTL
        self.cache_lock = threading.RLock()
        
        # Cache categories with different TTLs
        self.cache_categories = {
            "user_data": 600,      # 10 minutes
            "venture_data": 300,   # 5 minutes
            "analytics": 1800,     # 30 minutes
            "legal_docs": 3600,    # 1 hour
            "system_stats": 60,    # 1 minute
            "api_responses": 300,  # 5 minutes
            "ml_predictions": 1800, # 30 minutes
            "recommendations": 900  # 15 minutes
        }
        
        logger.info("🚀 Cache Service initialized with LRU eviction")

    def get(self, key: str, category: str = "general") -> Optional[Any]:
        """Get value from cache"""
        try:
            with self.cache_lock:
                self.cache_stats["total_requests"] += 1
                
                cache_key = self._generate_cache_key(key, category)
                
                if cache_key in self.cache:
                    # Check TTL
                    item = self.cache[cache_key]
                    if self._is_expired(item):
                        del self.cache[cache_key]
                        self.cache_stats["misses"] += 1
                        return None
                    
                    # Move to end (most recently used)
                    self.cache.move_to_end(cache_key)
                    self.cache_stats["hits"] += 1
                    
                    logger.debug(f"Cache HIT: {cache_key}")
                    return item["value"]
                else:
                    self.cache_stats["misses"] += 1
                    logger.debug(f"Cache MISS: {cache_key}")
                    return None
                    
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    def set(self, key: str, value: Any, category: str = "general", ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        try:
            with self.cache_lock:
                cache_key = self._generate_cache_key(key, category)
                
                # Determine TTL
                if ttl is None:
                    ttl = self.cache_categories.get(category, self.default_ttl)
                
                # Create cache item
                cache_item = {
                    "value": value,
                    "created_at": time.time(),
                    "ttl": ttl,
                    "category": category,
                    "access_count": 0
                }
                
                # Add to cache
                self.cache[cache_key] = cache_item
                
                # Evict if necessary
                self._evict_if_needed()
                
                logger.debug(f"Cache SET: {cache_key} (TTL: {ttl}s)")
                return True
                
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def delete(self, key: str, category: str = "general") -> bool:
        """Delete value from cache"""
        try:
            with self.cache_lock:
                cache_key = self._generate_cache_key(key, category)
                
                if cache_key in self.cache:
                    del self.cache[cache_key]
                    logger.debug(f"Cache DELETE: {cache_key}")
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    def clear_category(self, category: str) -> int:
        """Clear all items in a category"""
        try:
            with self.cache_lock:
                keys_to_delete = []
                for cache_key, item in self.cache.items():
                    if item["category"] == category:
                        keys_to_delete.append(cache_key)
                
                for key in keys_to_delete:
                    del self.cache[key]
                
                logger.info(f"Cleared {len(keys_to_delete)} items from category: {category}")
                return len(keys_to_delete)
                
        except Exception as e:
            logger.error(f"Clear category error: {e}")
            return 0

    def clear_all(self) -> int:
        """Clear all cache items"""
        try:
            with self.cache_lock:
                count = len(self.cache)
                self.cache.clear()
                logger.info(f"Cleared all {count} cache items")
                return count
                
        except Exception as e:
            logger.error(f"Clear all error: {e}")
            return 0

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            with self.cache_lock:
                hit_rate = 0.0
                if self.cache_stats["total_requests"] > 0:
                    hit_rate = self.cache_stats["hits"] / self.cache_stats["total_requests"]
                
                # Count items by category
                category_counts = {}
                for item in self.cache.values():
                    category = item["category"]
                    category_counts[category] = category_counts.get(category, 0) + 1
                
                return {
                    "total_items": len(self.cache),
                    "max_size": self.max_cache_size,
                    "hit_rate": round(hit_rate, 3),
                    "hits": self.cache_stats["hits"],
                    "misses": self.cache_stats["misses"],
                    "evictions": self.cache_stats["evictions"],
                    "total_requests": self.cache_stats["total_requests"],
                    "category_counts": category_counts,
                    "memory_usage_estimate": self._estimate_memory_usage()
                }
                
        except Exception as e:
            logger.error(f"Get stats error: {e}")
            return {}

    def warm_cache(self, warmup_data: Dict[str, Any]) -> Dict[str, Any]:
        """Warm up cache with frequently accessed data"""
        try:
            warmed_items = 0
            
            # Warm up user data
            if "user_ids" in warmup_data:
                for user_id in warmup_data["user_ids"]:
                    if not self.get(f"user_{user_id}", "user_data"):
                        # Simulate user data fetch
                        user_data = self._fetch_user_data(user_id)
                        if user_data:
                            self.set(f"user_{user_id}", user_data, "user_data")
                            warmed_items += 1
            
            # Warm up venture data
            if "venture_ids" in warmup_data:
                for venture_id in warmup_data["venture_ids"]:
                    if not self.get(f"venture_{venture_id}", "venture_data"):
                        # Simulate venture data fetch
                        venture_data = self._fetch_venture_data(venture_id)
                        if venture_data:
                            self.set(f"venture_{venture_id}", venture_data, "venture_data")
                            warmed_items += 1
            
            # Warm up system stats
            if not self.get("system_stats", "system_stats"):
                system_stats = self._fetch_system_stats()
                if system_stats:
                    self.set("system_stats", system_stats, "system_stats")
                    warmed_items += 1
            
            logger.info(f"Cache warmed up with {warmed_items} items")
            return {
                "success": True,
                "warmed_items": warmed_items,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Cache warmup error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def invalidate_pattern(self, pattern: str, category: str = "general") -> int:
        """Invalidate cache items matching a pattern"""
        try:
            with self.cache_lock:
                keys_to_delete = []
                for cache_key in self.cache.keys():
                    if pattern in cache_key and (category == "general" or category in cache_key):
                        keys_to_delete.append(cache_key)
                
                for key in keys_to_delete:
                    del self.cache[key]
                
                logger.info(f"Invalidated {len(keys_to_delete)} items matching pattern: {pattern}")
                return len(keys_to_delete)
                
        except Exception as e:
            logger.error(f"Invalidate pattern error: {e}")
            return 0

    def get_cached_or_fetch(self, key: str, fetch_func, category: str = "general", ttl: Optional[int] = None, *args, **kwargs):
        """Get from cache or fetch and cache the result"""
        try:
            # Try to get from cache first
            cached_value = self.get(key, category)
            if cached_value is not None:
                return cached_value
            
            # Fetch the data
            fresh_value = fetch_func(*args, **kwargs)
            
            # Cache the result
            if fresh_value is not None:
                self.set(key, fresh_value, category, ttl)
            
            return fresh_value
            
        except Exception as e:
            logger.error(f"Get cached or fetch error: {e}")
            return None

    def _generate_cache_key(self, key: str, category: str) -> str:
        """Generate a unique cache key"""
        return f"{category}:{hashlib.md5(key.encode()).hexdigest()}"

    def _is_expired(self, item: Dict[str, Any]) -> bool:
        """Check if cache item is expired"""
        current_time = time.time()
        return current_time - item["created_at"] > item["ttl"]

    def _evict_if_needed(self):
        """Evict least recently used items if cache is full"""
        while len(self.cache) > self.max_cache_size:
            # Remove least recently used item
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            self.cache_stats["evictions"] += 1

    def _estimate_memory_usage(self) -> str:
        """Estimate memory usage of cache"""
        try:
            total_size = 0
            for item in self.cache.values():
                # Rough estimation
                item_size = len(str(item["value"]).encode('utf-8'))
                total_size += item_size
            
            if total_size < 1024:
                return f"{total_size} B"
            elif total_size < 1024 * 1024:
                return f"{total_size / 1024:.1f} KB"
            else:
                return f"{total_size / (1024 * 1024):.1f} MB"
                
        except Exception as e:
            logger.error(f"Memory usage estimation error: {e}")
            return "Unknown"

    def _fetch_user_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user data (placeholder)"""
        try:
            if self.nodejs_connector:
                result = self.nodejs_connector.get_user(user_id)
                return result.get('data') if result.get('success') else None
            return None
        except Exception as e:
            logger.error(f"Fetch user data error: {e}")
            return None

    def _fetch_venture_data(self, venture_id: str) -> Optional[Dict[str, Any]]:
        """Fetch venture data (placeholder)"""
        try:
            if self.nodejs_connector:
                result = self.nodejs_connector.get_venture(venture_id)
                return result.get('data') if result.get('success') else None
            return None
        except Exception as e:
            logger.error(f"Fetch venture data error: {e}")
            return None

    def _fetch_system_stats(self) -> Optional[Dict[str, Any]]:
        """Fetch system stats (placeholder)"""
        try:
            return {
                "total_users": 0,
                "total_ventures": 0,
                "active_sessions": 0,
                "system_uptime": time.time(),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Fetch system stats error: {e}")
            return None

    def cleanup_expired(self) -> int:
        """Clean up expired cache items"""
        try:
            with self.cache_lock:
                expired_keys = []
                for cache_key, item in self.cache.items():
                    if self._is_expired(item):
                        expired_keys.append(cache_key)
                
                for key in expired_keys:
                    del self.cache[key]
                
                logger.info(f"Cleaned up {len(expired_keys)} expired items")
                return len(expired_keys)
                
        except Exception as e:
            logger.error(f"Cleanup expired error: {e}")
            return 0

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics"""
        try:
            stats = self.get_stats()
            
            # Calculate performance metrics
            avg_response_time = 0.0
            if stats.get("total_requests", 0) > 0:
                # Simulate response time calculation
                avg_response_time = 0.1  # Placeholder
            
            return {
                "cache_hit_rate": stats.get("hit_rate", 0.0),
                "total_requests": stats.get("total_requests", 0),
                "cache_size": stats.get("total_items", 0),
                "memory_usage": stats.get("memory_usage_estimate", "Unknown"),
                "avg_response_time": avg_response_time,
                "eviction_rate": stats.get("evictions", 0) / max(stats.get("total_requests", 1), 1),
                "category_distribution": stats.get("category_counts", {}),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Get performance metrics error: {e}")
            return {}
