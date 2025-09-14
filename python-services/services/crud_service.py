"""
SmartStart CRUD Service
Comprehensive Create, Read, Update, Delete operations with existing database integration
"""

import logging
from typing import List, Dict, Optional, Any, Union
from dataclasses import dataclass
import sys
import os
from datetime import datetime

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from nodejs_connector import NodeJSConnector
except ImportError:
    try:
        from nodejs_connector import NodeJSConnector
    except ImportError:
        # Fallback for when NodeJSConnector is not available
        class NodeJSConnector:
            def __init__(self):
                pass
            def query(self, sql, params=None):
                return []
            def execute(self, sql, params=None):
                return False

logger = logging.getLogger(__name__)

@dataclass
class QueryResult:
    success: bool
    data: List[Dict] = None
    error: str = None
    count: int = 0

class CRUDService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        logger.info("📊 CRUD Service initialized")
    
    def create(self, table: str, data: Dict[str, Any]) -> QueryResult:
        """Create a new record in the specified table"""
        try:
            # Generate ID if not provided
            if 'id' not in data:
                data['id'] = self._generate_id()
            
            # Add timestamps
            data['createdAt'] = datetime.now()
            data['updatedAt'] = datetime.now()
            
            # Build INSERT query
            columns = list(data.keys())
            placeholders = [f"%s" for _ in columns]
            values = list(data.values())
            
            query = f"""
            INSERT INTO "{table}" ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
            """
            
            result = self.connector.query(query, values)
            
            if result:
                return QueryResult(
                    success=True,
                    data=result,
                    count=len(result)
                )
            else:
                return QueryResult(
                    success=False,
                    error="Failed to create record"
                )
                
        except Exception as e:
            logger.error(f"Error creating record in {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def read(self, table: str, filters: Dict[str, Any] = None, 
             order_by: str = None, limit: int = None, offset: int = None) -> QueryResult:
        """Read records from the specified table"""
        try:
            query = f"SELECT * FROM \"{table}\""
            params = []
            
            # Add WHERE clause if filters provided
            if filters:
                where_conditions = []
                for key, value in filters.items():
                    if isinstance(value, list):
                        placeholders = ', '.join(['%s'] * len(value))
                        where_conditions.append(f'"{key}" IN ({placeholders})')
                        params.extend(value)
                    else:
                        where_conditions.append(f'"{key}" = %s')
                        params.append(value)
                
                query += f" WHERE {' AND '.join(where_conditions)}"
            
            # Add ORDER BY clause
            if order_by:
                query += f" ORDER BY {order_by}"
            
            # Add LIMIT and OFFSET
            if limit:
                query += f" LIMIT {limit}"
            if offset:
                query += f" OFFSET {offset}"
            
            result = self.connector.query(query, params)
            
            return QueryResult(
                success=True,
                data=result,
                count=len(result)
            )
            
        except Exception as e:
            logger.error(f"Error reading from {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def read_by_id(self, table: str, record_id: str) -> QueryResult:
        """Read a single record by ID"""
        try:
            query = f'SELECT * FROM "{table}" WHERE id = %s'
            result = self.connector.query(query, [record_id])
            
            if result:
                return QueryResult(
                    success=True,
                    data=result,
                    count=1
                )
            else:
                return QueryResult(
                    success=False,
                    error="Record not found"
                )
                
        except Exception as e:
            logger.error(f"Error reading record {record_id} from {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def update(self, table: str, record_id: str, data: Dict[str, Any]) -> QueryResult:
        """Update a record in the specified table"""
        try:
            # Add updatedAt timestamp
            data['updatedAt'] = datetime.now()
            
            # Build UPDATE query
            set_clauses = [f'"{key}" = %s' for key in data.keys()]
            values = list(data.values()) + [record_id]
            
            query = f"""
            UPDATE "{table}" 
            SET {', '.join(set_clauses)}
            WHERE id = %s
            RETURNING *
            """
            
            result = self.connector.query(query, values)
            
            if result:
                return QueryResult(
                    success=True,
                    data=result,
                    count=len(result)
                )
            else:
                return QueryResult(
                    success=False,
                    error="Record not found or update failed"
                )
                
        except Exception as e:
            logger.error(f"Error updating record {record_id} in {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def delete(self, table: str, record_id: str) -> QueryResult:
        """Delete a record from the specified table"""
        try:
            query = f'DELETE FROM "{table}" WHERE id = %s RETURNING *'
            result = self.connector.query(query, [record_id])
            
            if result:
                return QueryResult(
                    success=True,
                    data=result,
                    count=len(result)
                )
            else:
                return QueryResult(
                    success=False,
                    error="Record not found"
                )
                
        except Exception as e:
            logger.error(f"Error deleting record {record_id} from {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def soft_delete(self, table: str, record_id: str) -> QueryResult:
        """Soft delete a record (set deletedAt timestamp)"""
        try:
            query = f"""
            UPDATE "{table}" 
            SET "deletedAt" = %s, "updatedAt" = %s
            WHERE id = %s
            RETURNING *
            """
            
            now = datetime.now()
            result = self.connector.query(query, [now, now, record_id])
            
            if result:
                return QueryResult(
                    success=True,
                    data=result,
                    count=len(result)
                )
            else:
                return QueryResult(
                    success=False,
                    error="Record not found"
                )
                
        except Exception as e:
            logger.error(f"Error soft deleting record {record_id} from {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def count(self, table: str, filters: Dict[str, Any] = None) -> QueryResult:
        """Count records in the specified table"""
        try:
            query = f'SELECT COUNT(*) as count FROM "{table}"'
            params = []
            
            # Add WHERE clause if filters provided
            if filters:
                where_conditions = []
                for key, value in filters.items():
                    if isinstance(value, list):
                        placeholders = ', '.join(['%s'] * len(value))
                        where_conditions.append(f'"{key}" IN ({placeholders})')
                        params.extend(value)
                    else:
                        where_conditions.append(f'"{key}" = %s')
                        params.append(value)
                
                query += f" WHERE {' AND '.join(where_conditions)}"
            
            result = self.connector.query(query, params)
            
            if result:
                return QueryResult(
                    success=True,
                    data=result,
                    count=result[0]['count']
                )
            else:
                return QueryResult(
                    success=False,
                    error="Count query failed"
                )
                
        except Exception as e:
            logger.error(f"Error counting records in {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def search(self, table: str, search_term: str, search_columns: List[str], 
               filters: Dict[str, Any] = None, limit: int = 50) -> QueryResult:
        """Search records using LIKE queries on specified columns"""
        try:
            # Build search conditions
            search_conditions = []
            params = []
            
            for column in search_columns:
                search_conditions.append(f'"{column}" ILIKE %s')
                params.append(f'%{search_term}%')
            
            query = f"""
            SELECT * FROM "{table}"
            WHERE ({' OR '.join(search_conditions)})
            """
            
            # Add additional filters
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        placeholders = ', '.join(['%s'] * len(value))
                        query += f' AND "{key}" IN ({placeholders})'
                        params.extend(value)
                    else:
                        query += f' AND "{key}" = %s'
                        params.append(value)
            
            query += f" LIMIT {limit}"
            
            result = self.connector.query(query, params)
            
            return QueryResult(
                success=True,
                data=result,
                count=len(result)
            )
            
        except Exception as e:
            logger.error(f"Error searching in {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def execute_raw_query(self, query: str, params: List[Any] = None) -> QueryResult:
        """Execute a raw SQL query"""
        try:
            result = self.connector.query(query, params or [])
            
            return QueryResult(
                success=True,
                data=result,
                count=len(result)
            )
            
        except Exception as e:
            logger.error(f"Error executing raw query: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def execute_transaction(self, operations: List[Dict[str, Any]]) -> QueryResult:
        """Execute multiple operations in a transaction"""
        try:
            results = []
            
            for operation in operations:
                op_type = operation.get('type')
                table = operation.get('table')
                data = operation.get('data', {})
                record_id = operation.get('id')
                
                if op_type == 'create':
                    result = self.create(table, data)
                elif op_type == 'update':
                    result = self.update(table, record_id, data)
                elif op_type == 'delete':
                    result = self.delete(table, record_id)
                else:
                    result = QueryResult(success=False, error=f"Unknown operation type: {op_type}")
                
                results.append(result)
                
                if not result.success:
                    return QueryResult(
                        success=False,
                        error=f"Transaction failed at operation: {operation}",
                        data=results
                    )
            
            return QueryResult(
                success=True,
                data=results,
                count=len(results)
            )
            
        except Exception as e:
            logger.error(f"Error executing transaction: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"cm{timestamp[-8:]}{random_part}"
    
    def get_table_info(self, table: str) -> QueryResult:
        """Get table structure information"""
        try:
            query = """
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position
            """
            
            result = self.connector.query(query, [table])
            
            return QueryResult(
                success=True,
                data=result,
                count=len(result)
            )
            
        except Exception as e:
            logger.error(f"Error getting table info for {table}: {e}")
            return QueryResult(
                success=False,
                error=str(e)
            )
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            # Get table sizes
            size_query = """
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats
            WHERE schemaname = 'public'
            ORDER BY tablename, attname
            """
            
            stats = self.connector.query(size_query)
            
            # Get table row counts
            tables = ['User', 'Project', 'LegalDocument', 'Role', 'Permission', 'UserJourneyState']
            table_counts = {}
            
            for table in tables:
                count_result = self.count(table)
                if count_result.success:
                    table_counts[table] = count_result.count
            
            return {
                'table_counts': table_counts,
                'database_stats': stats,
                'total_tables': len(tables)
            }
            
        except Exception as e:
            logger.error(f"Error getting database stats: {e}")
            return {}
