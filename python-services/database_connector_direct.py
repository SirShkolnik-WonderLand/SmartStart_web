#!/usr/bin/env python3
"""
Direct Database Connector - SmartStart Platform
Connects directly to PostgreSQL database without fallbacks
"""

import os
import logging
import psycopg2
import time
import json
from psycopg2.extras import RealDictCursor
from datetime import datetime

logger = logging.getLogger(__name__)

class DirectDatabaseConnector:
    """Direct database connector for production use"""
    
    def __init__(self):
        self.connection = None
        self._establish_connection()
    
    def _establish_connection(self):
        """Establish direct database connection"""
        try:
            # Get database URL from environment or use defaults
            database_url = os.getenv('DATABASE_URL')
            
            if database_url:
                # Parse DATABASE_URL (e.g., postgresql://user:pass@host:port/db)
                self.connection = psycopg2.connect(database_url)
                logger.info("Connected using DATABASE_URL")
            else:
                # Fallback to individual parameters
                db_config = {
                    'host': os.getenv('DB_HOST', 'localhost'),
                    'database': os.getenv('DB_NAME', 'smartstart_db'),
                    'user': os.getenv('DB_USER', 'smartstart_user'),
                    'password': os.getenv('DB_PASSWORD', 'smartstart_password'),
                    'port': int(os.getenv('DB_PORT', 5432))
                }
                
                self.connection = psycopg2.connect(**db_config)
                logger.info("Connected using individual parameters")
            
            logger.info("Direct database connection established successfully")
            
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise e
    
    def _execute_query(self, query, params=None, fetch_one=False, fetch_all=False):
        """Execute database query with proper error handling and connection management"""
        try:
            # Check if connection is still alive, reconnect if needed
            if self.connection and self.connection.closed:
                logger.info("Connection closed, reconnecting...")
                self._establish_connection()
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                
                if fetch_one:
                    result = cur.fetchone()
                    return dict(result) if result else None
                elif fetch_all:
                    results = cur.fetchall()
                    return [dict(row) for row in results]
                else:
                    self.connection.commit()
                    return True
                    
        except Exception as e:
            logger.error(f"Database query error: {e}")
            if self.connection:
                self.connection.rollback()
            # Try to reconnect on error
            try:
                self._establish_connection()
            except:
                pass
            raise e
    
    def test_connection(self):
        """Test database connection"""
        try:
            with self.connection.cursor() as cur:
                cur.execute("SELECT 1")
                result = cur.fetchone()
                return result[0] == 1
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False
    
    # ============================================================================
    # USER MANAGEMENT
    # ============================================================================
    
    def get_user_by_id(self, user_id):
        """Get user by ID from database"""
        query = """
            SELECT u.*
            FROM "User" u
            WHERE u.id = %s
        """
        return self._execute_query(query, (user_id,), fetch_one=True)
    
    def get_user_by_email(self, email):
        """Get user by email from database"""
        query = """
            SELECT u.*
            FROM "User" u
            WHERE u.email = %s
        """
        return self._execute_query(query, (email,), fetch_one=True)
    
    def create_user_journey_state(self, journey_data):
        """Create user journey state"""
        # Map to correct column names
        mapped_data = {
            'id': f"journey_{journey_data['user_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'userId': journey_data['user_id'],
            'stageId': journey_data.get('current_stage', 'account_creation'),
            'status': 'NOT_STARTED',
            'startedAt': journey_data.get('created_at'),
            'completedAt': None,
            'metadata': json.dumps({
                'progress_percentage': journey_data.get('progress_percentage', 0),
                'completed_stages': journey_data.get('completed_stages', [])
            }),
            'createdAt': journey_data.get('created_at'),
            'updatedAt': journey_data.get('updated_at')
        }
        
        columns = list(mapped_data.keys())
        values = list(mapped_data.values())
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "UserJourneyState" ({', '.join([f'"{col}"' for col in columns])})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    def create_subscription(self, subscription_data):
        """Create user subscription"""
        # Map to correct column names
        mapped_data = {
            'id': f"sub_{subscription_data['user_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'userId': subscription_data['user_id'],
            'planId': subscription_data['plan_id'],
            'status': subscription_data['status'],
            'startDate': subscription_data['start_date'],
            'endDate': subscription_data.get('end_date'),
            'autoRenew': subscription_data.get('auto_renew', False),
            'createdAt': subscription_data.get('created_at'),
            'updatedAt': subscription_data.get('created_at')
        }
        
        columns = list(mapped_data.keys())
        values = list(mapped_data.values())
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "Subscription" ({', '.join([f'"{col}"' for col in columns])})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    def update_user(self, user_id, data):
        """Update user in database"""
        # Build dynamic update query
        # Quote identifiers to preserve case (e.g., "lastActive")
        set_clause = ', '.join([f'"{col}" = %s' for col in data.keys()])
        values = list(data.values()) + [user_id]
        
        query = f"""
            UPDATE "User"
            SET {set_clause}
            WHERE id = %s
            RETURNING *
        """
        
        result = self._execute_query(query, values, fetch_one=True)
        return result
    
    def create_user(self, data):
        """Create new user in database"""
        # Map camelCase to database column names (they are the same in this case)
        column_mapping = {
            'firstName': 'firstName',
            'lastName': 'lastName',
            'createdAt': 'createdAt',
            'updatedAt': 'updatedAt',
            'tenantId': 'tenantId',
            'lastActive': 'lastActive',
            'totalPortfolioValue': 'totalPortfolioValue',
            'activeProjectsCount': 'activeProjectsCount',
            'totalContributions': 'totalContributions',
            'totalEquityOwned': 'totalEquityOwned',
            'averageEquityPerProject': 'averageEquityPerProject',
            'portfolioDiversity': 'portfolioDiversity'
        }
        
        # Build query with proper column names
        columns = []
        values = []
        for key, value in data.items():
            if key in column_mapping:
                columns.append(f'"{column_mapping[key]}"')
            else:
                columns.append(f'"{key}"')
            values.append(value)
        
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "User" ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    # ============================================================================
    # VENTURE MANAGEMENT
    # ============================================================================
    
    def get_user_ventures(self, user_id):
        """Get ventures for user or all ventures"""
        if user_id == "all":
            query = """
                SELECT v.*, u.name as owner_name, u.email as owner_email
                FROM "Venture" v
                LEFT JOIN "User" u ON v."createdBy" = u.id
                ORDER BY v."createdAt" DESC
            """
            return self._execute_query(query, fetch_all=True)
        else:
            query = """
                SELECT v.*, u.name as owner_name, u.email as owner_email
                FROM "Venture" v
                LEFT JOIN "User" u ON v."createdBy" = u.id
                WHERE v."createdBy" = %s
                ORDER BY v."createdAt" DESC
            """
            return self._execute_query(query, (user_id,), fetch_all=True)
    
    def get_venture_by_id(self, venture_id):
        """Get venture by ID"""
        query = """
            SELECT v.*, u.name as owner_name, u.email as owner_email
            FROM "Venture" v
            LEFT JOIN "User" u ON v."createdBy" = u.id
            WHERE v.id = %s
        """
        return self._execute_query(query, (venture_id,), fetch_one=True)
    
    def create_venture(self, data):
        """Create new venture"""
        # Generate unique ID
        import uuid
        venture_id = f"venture_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
        
        # Map frontend data to database columns
        mapped_data = {
            'id': venture_id,
            'name': data.get('name', ''),
            'description': data.get('description', ''),
            'status': 'ACTIVE',
            'category': data.get('category', 'TECHNOLOGY'),
            'industry': data.get('industry', 'TECHNOLOGY'),
            'stage': data.get('tier', 'T1'),  # Map tier to stage
            'fundingGoal': data.get('fundingGoal', 0),
            'currentFunding': 0,
            'equityOffered': data.get('equityOffered', 0),
            'minInvestment': data.get('minInvestment', 0),
            'maxInvestment': data.get('maxInvestment', 0),
            'startDate': data.get('startDate'),
            'endDate': data.get('endDate'),
            'createdBy': data.get('createdBy', data.get('owner_id')),
            'teamMembers': json.dumps(data.get('teamMembers', [])),
            'tags': json.dumps(data.get('tags', [])),
            'metadata': json.dumps({
                'isPublic': data.get('isPublic', False),
                'allowApplications': data.get('allowApplications', False),
                'teamSize': data.get('teamSize', 1),
                'originalData': data
            })
        }
        
        # Remove None values
        mapped_data = {k: v for k, v in mapped_data.items() if v is not None}
        
        columns = list(mapped_data.keys())
        values = list(mapped_data.values())
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "Venture" ({', '.join([f'"{col}"' for col in columns])})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    def update_venture(self, venture_id, data):
        """Update venture"""
        set_clause = ', '.join([f"{col} = %s" for col in data.keys()])
        values = list(data.values()) + [venture_id]
        
        query = f"""
            UPDATE "Venture"
            SET {set_clause}
            WHERE id = %s AND is_deleted = false
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    # ============================================================================
    # BUZ TOKEN SYSTEM
    # ============================================================================
    
    def get_user_buz_tokens(self, user_id):
        """Get user BUZ token balance and staking info"""
        # Get BUZ token balance from the new table structure
        buz_query = """
            SELECT balance, "stakedAmount", "totalEarned", "totalSpent"
            FROM "BUZToken"
            WHERE "userId" = %s
        """
        buz_result = self._execute_query(buz_query, (user_id,), fetch_one=True)
        
        if buz_result:
            balance = float(buz_result['balance'])
            staked = float(buz_result['stakedAmount'])
            total_earned = float(buz_result['totalEarned'])
            total_spent = float(buz_result['totalSpent'])
        else:
            # If no BUZ token record exists, create one with default values
            balance = 0.0
            staked = 0.0
            total_earned = 0.0
            total_spent = 0.0
            
            # Create default BUZ token record
            create_buz_query = """
                INSERT INTO "BUZToken" ("id", "userId", "balance", "stakedAmount", "totalEarned", "totalSpent")
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT ("userId") DO NOTHING
            """
            buz_id = f"buz_{user_id}"
            self._execute_query(create_buz_query, (buz_id, user_id, balance, staked, total_earned, total_spent))
        
        # Check if user has limited time founder plan for monthly allocation
        subscription_query = """
            SELECT bp."buzTokensMonthly"
            FROM "Subscription" s
            JOIN "BillingPlan" bp ON s."planId" = bp."id"
            WHERE s."userId" = %s AND s.status = 'ACTIVE'
        """
        subscription_result = self._execute_query(subscription_query, (user_id,), fetch_one=True)
        monthly_allocation = subscription_result['buzTokensMonthly'] if subscription_result else 0
        
        return {
            "user_id": user_id,
            "balance": balance,
            "staked": staked,
            "available": balance - staked,
            "total_earned": total_earned,
            "total_spent": total_spent,
            "monthly_allocation": monthly_allocation or 0,
            "currency": "BUZ",
            "level": "Member",
            "next_level_buz": 5000
        }
    
    def stake_buz_tokens(self, user_id, amount, staking_period, staking_type):
        """Stake BUZ tokens"""
        try:
            # Check if user has enough balance
            balance_data = self.get_user_buz_tokens(user_id)
            if balance_data['available'] < amount:
                raise ValueError("Insufficient BUZ token balance")
            
            # Create staking record
            staking_data = {
                'user_id': user_id,
                'amount': amount,
                'staking_period': staking_period,
                'staking_type': staking_type,
                'status': 'ACTIVE',
                'created_at': datetime.now().isoformat(),
                'maturity_date': (datetime.now() + timedelta(days=staking_period)).isoformat()
            }
            
            columns = list(staking_data.keys())
            values = list(staking_data.values())
            placeholders = ['%s'] * len(values)
            
            query = f"""
                INSERT INTO "BUZStaking" ({', '.join(columns)})
                VALUES ({', '.join(placeholders)})
                RETURNING *
            """
            
            result = self._execute_query(query, values, fetch_one=True)
            
            # Create BUZ transaction record
            transaction_data = {
                'user_id': user_id,
                'amount': amount,
                'transaction_type': 'STAKED',
                'description': f'Staked {amount} BUZ tokens for {staking_period} days',
                'created_at': datetime.now().isoformat()
            }
            
            self._create_buz_transaction(transaction_data)
            
            return result
            
        except Exception as e:
            logger.error(f"Error staking BUZ tokens: {e}")
            raise e
    
    def unstake_buz_tokens(self, user_id, amount):
        """Unstake BUZ tokens"""
        try:
            # Find active staking records
            query = """
                SELECT * FROM "BUZStaking"
                WHERE user_id = %s AND status = 'ACTIVE'
                ORDER BY created_at ASC
            """
            staking_records = self._execute_query(query, (user_id,), fetch_all=True)
            
            if not staking_records:
                raise ValueError("No active staking records found")
            
            # Calculate unstaking amount
            remaining_amount = amount
            unstaked_records = []
            
            for record in staking_records:
                if remaining_amount <= 0:
                    break
                
                unstake_amount = min(remaining_amount, record['amount'])
                remaining_amount -= unstake_amount
                
                # Update staking record
                update_query = """
                    UPDATE "BUZStaking"
                    SET amount = amount - %s, status = CASE WHEN amount - %s = 0 THEN 'COMPLETED' ELSE 'ACTIVE' END
                    WHERE id = %s
                """
                self._execute_query(update_query, (unstake_amount, unstake_amount, record['id']))
                
                unstaked_records.append({
                    'id': record['id'],
                    'amount': unstake_amount,
                    'original_amount': record['amount']
                })
            
            # Create BUZ transaction record
            transaction_data = {
                'user_id': user_id,
                'amount': amount,
                'transaction_type': 'UNSTAKED',
                'description': f'Unstaked {amount} BUZ tokens',
                'created_at': datetime.now().isoformat()
            }
            
            self._create_buz_transaction(transaction_data)
            
            return {
                'unstaked_amount': amount,
                'unstaked_records': unstaked_records,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error unstaking BUZ tokens: {e}")
            raise e
    
    def transfer_buz_tokens(self, from_user_id, to_user_id, amount):
        """Transfer BUZ tokens between users"""
        try:
            # Check if sender has enough balance
            sender_balance = self.get_user_buz_tokens(from_user_id)
            if sender_balance['available'] < amount:
                raise ValueError("Insufficient BUZ token balance")
            
            # Create transfer transaction for sender
            sender_transaction = {
                'user_id': from_user_id,
                'amount': amount,
                'transaction_type': 'TRANSFER_OUT',
                'description': f'Transferred {amount} BUZ tokens to {to_user_id}',
                'created_at': datetime.now().isoformat()
            }
            self._create_buz_transaction(sender_transaction)
            
            # Create transfer transaction for receiver
            receiver_transaction = {
                'user_id': to_user_id,
                'amount': amount,
                'transaction_type': 'TRANSFER_IN',
                'description': f'Received {amount} BUZ tokens from {from_user_id}',
                'created_at': datetime.now().isoformat()
            }
            self._create_buz_transaction(receiver_transaction)
            
            return {
                'from_user': from_user_id,
                'to_user': to_user_id,
                'amount': amount,
                'transferred_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error transferring BUZ tokens: {e}")
            raise e
    
    def _create_buz_transaction(self, transaction_data):
        """Create BUZ transaction record"""
        columns = list(transaction_data.keys())
        values = list(transaction_data.values())
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "BUZTransaction" ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    # ============================================================================
    # LEGAL DOCUMENT SYSTEM
    # ============================================================================
    
    def get_user_legal_documents(self, user_id):
        """Get user legal documents"""
        query = """
            SELECT ld.*, ds."signedAt"
            FROM "LegalDocument" ld
            LEFT JOIN "LegalDocumentSignature" ds ON ld.id = ds."documentId" AND ds."userId" = %s
            WHERE ld.status = 'APPROVED'
            ORDER BY ld."requiresSignature" DESC, ld."createdAt" ASC
        """
        return self._execute_query(query, (user_id,), fetch_all=True)
    
    def sign_legal_document(self, user_id, document_id, signature_data):
        """Sign legal document"""
        try:
            # Create or update document signature
            signature_record = {
                'user_id': user_id,
                'document_id': document_id,
                'status': 'SIGNED',
                'signed_at': datetime.now().isoformat(),
                'signature_data': json.dumps(signature_data),
                'ip_address': signature_data.get('ip_address'),
                'user_agent': signature_data.get('user_agent')
            }
            
            # Check if signature already exists
            check_query = """
                SELECT id FROM "LegalDocumentSignature"
                WHERE user_id = %s AND document_id = %s
            """
            existing = self._execute_query(check_query, (user_id, document_id), fetch_one=True)
            
            if existing:
                # Update existing signature
                update_query = """
                    UPDATE "LegalDocumentSignature"
                    SET status = %s, signed_at = %s, signature_data = %s, ip_address = %s, user_agent = %s
                    WHERE user_id = %s AND document_id = %s
                """
                self._execute_query(update_query, (
                    signature_record['status'],
                    signature_record['signed_at'],
                    signature_record['signature_data'],
                    signature_record['ip_address'],
                    signature_record['user_agent'],
                    user_id,
                    document_id
                ))
            else:
                # Create new signature
                columns = list(signature_record.keys())
                values = list(signature_record.values())
                placeholders = ['%s'] * len(values)
                
                query = f"""
                    INSERT INTO "LegalDocumentSignature" ({', '.join(columns)})
                    VALUES ({', '.join(placeholders)})
                    RETURNING *
                """
                
                self._execute_query(query, values)
            
            return {
                'document_id': document_id,
                'signed_at': signature_record['signed_at'],
                'signature_hash': f"sig_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_id}",
                'legal_validity': True
            }
            
        except Exception as e:
            logger.error(f"Error signing document: {e}")
            raise e
    
    def get_user_legal_status(self, user_id):
        """Get user legal document status"""
        query = """
            SELECT 
                COUNT(ld.id) as total_documents,
                COUNT(ds.id) as documents_signed,
                CASE 
                    WHEN COUNT(ld.id) = COUNT(ds.id) THEN 'COMPLIANT'
                    WHEN COUNT(ds.id) > 0 THEN 'PARTIAL'
                    ELSE 'NON_COMPLIANT'
                END as compliance_level,
                MAX(ds."signedAt") as last_signed
            FROM "LegalDocument" ld
            LEFT JOIN "LegalDocumentSignature" ds ON ld.id = ds."documentId" AND ds."userId" = %s
            WHERE ld.status = 'APPROVED'
        """
        
        result = self._execute_query(query, (user_id,), fetch_one=True)
        
        # Get required documents
        required_docs_query = """
            SELECT ld.*, ds."signedAt"
            FROM "LegalDocument" ld
            LEFT JOIN "LegalDocumentSignature" ds ON ld.id = ds."documentId" AND ds."userId" = %s
            WHERE ld.status = 'APPROVED' AND ld."requiresSignature" = true
            ORDER BY ld."createdAt" ASC
        """
        required_docs = self._execute_query(required_docs_query, (user_id,), fetch_all=True)
        
        return {
            'user_id': user_id,
            'documents_signed': result['documents_signed'],
            'total_documents': result['total_documents'],
            'compliance_level': result['compliance_level'],
            'last_signed': result['last_signed'],
            'required_documents': required_docs
        }
    
    # ============================================================================
    # SUBSCRIPTION SYSTEM
    # ============================================================================
    
    def get_subscription_plans(self):
        """Get all subscription plans"""
        query = """
            SELECT * FROM "BillingPlan"
            WHERE "isActive" = true
            ORDER BY price ASC
        """
        return self._execute_query(query, fetch_all=True)
    
    def create_subscription(self, user_id, plan_id):
        """Create user subscription"""
        try:
            # Get plan details
            plan_query = """
                SELECT * FROM "BillingPlan"
                WHERE id = %s AND "isActive" = true
            """
            plan = self._execute_query(plan_query, (plan_id,), fetch_one=True)
            
            if not plan:
                raise ValueError("Invalid subscription plan")
            
            # Create subscription
            subscription_data = {
                'user_id': user_id,
                'plan_id': plan_id,
                'status': 'ACTIVE',
                'start_date': datetime.now().isoformat(),
                'end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                'auto_renew': True,
                'created_at': datetime.now().isoformat()
            }
            
            columns = list(subscription_data.keys())
            values = list(subscription_data.values())
            placeholders = ['%s'] * len(values)
            
            query = f"""
                INSERT INTO "Subscription" ({', '.join(columns)})
                VALUES ({', '.join(placeholders)})
                RETURNING *
            """
            
            result = self._execute_query(query, values, fetch_one=True)
            
            # If limited time founder plan, set up professional email
            if plan.get('is_limited_time') and plan.get('email_included'):
                self._setup_professional_email(user_id)
            
            return result
            
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            raise e
    
    def get_user_subscription_status(self, user_id):
        """Get user subscription status"""
        query = """
            SELECT s.*, bp.*
            FROM "Subscription" s
            JOIN "BillingPlan" bp ON s."planId" = bp.id
            WHERE s."userId" = %s AND s.status = 'ACTIVE'
            ORDER BY s."createdAt" DESC
            LIMIT 1
        """
        
        result = self._execute_query(query, (user_id,), fetch_one=True)
        
        if not result:
            return {
                'user_id': user_id,
                'current_plan': None,
                'subscription': None,
                'next_billing_date': None,
                'payment_method': None
            }
        
        return {
            'user_id': user_id,
            'current_plan': {
                'id': result['planId'],
                'name': result['name'],
                'description': result['description'],
                'price': float(result['price']),
                'currency': result['currency'],
                'features': result.get('features', []),
                'buz_tokens_monthly': result.get('buzTokensMonthly', 0),
                'email_included': result.get('emailIncluded', False),
                'microsoft_365_included': result.get('microsoft365Included', False)
            },
            'subscription': {
                'id': result['id'],
                'user_id': result['userId'],
                'plan_id': result['planId'],
                'status': result['status'],
                'start_date': result['startDate'],
                'end_date': result['endDate'],
                'auto_renew': result['autoRenew']
            },
            'next_billing_date': result['endDate'],
            'payment_method': 'Credit Card'  # Default for now
        }
    
    def _setup_professional_email(self, user_id):
        """Set up professional email for user"""
        try:
            # Get user details
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            # Generate professional email
            email_address = f"{user['username']}@alicesolutionsgroup.com"
            
            # Create professional email record
            email_data = {
                'user_id': user_id,
                'email_address': email_address,
                'microsoft_365_license_id': f"lic_{user_id}_{datetime.now().strftime('%Y%m%d')}",
                'defender_enabled': True,
                'backup_enabled': True,
                'created_at': datetime.now().isoformat()
            }
            
            # Check if table exists, if not create it
            create_table_query = """
                CREATE TABLE IF NOT EXISTS "UserProfessionalEmails" (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    email_address VARCHAR(255) UNIQUE NOT NULL,
                    microsoft_365_license_id VARCHAR(100),
                    defender_enabled BOOLEAN DEFAULT TRUE,
                    backup_enabled BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """
            self._execute_query(create_table_query)
            
            # Insert professional email record
            columns = list(email_data.keys())
            values = list(email_data.values())
            placeholders = ['%s'] * len(values)
            
            query = f"""
                INSERT INTO "UserProfessionalEmails" ({', '.join(columns)})
                VALUES ({', '.join(placeholders)})
                RETURNING *
            """
            
            return self._execute_query(query, values, fetch_one=True)
            
        except Exception as e:
            logger.error(f"Error setting up professional email: {e}")
            return None
    
    # ============================================================================
    # JOURNEY SYSTEM
    # ============================================================================
    
    def get_user_journey_status(self, user_id):
        """Get user journey status"""
        query = """
            SELECT ujs.*, js.name as stage_name, js.description as stage_description
            FROM "UserJourneyState" ujs
            LEFT JOIN "JourneyStage" js ON ujs."stageId" = js.id
            WHERE ujs."userId" = %s
            ORDER BY ujs."updatedAt" DESC
            LIMIT 1
        """
        
        result = self._execute_query(query, (user_id,), fetch_one=True)
        
        if not result:
            # Create initial journey state
            initial_data = {
                'id': f"journey_{user_id}_{int(time.time())}",
                'userId': user_id,
                'stageId': 'account_creation',
                'status': 'IN_PROGRESS',
                'startedAt': datetime.now().isoformat(),
                'completedAt': None,
                'metadata': '{}',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            columns = [f'"{col}"' for col in initial_data.keys()]
            values = list(initial_data.values())
            placeholders = ['%s'] * len(values)
            
            query = f"""
                INSERT INTO "UserJourneyState" ({', '.join(columns)})
                VALUES ({', '.join(placeholders)})
                RETURNING *
            """
            
            result = self._execute_query(query, values, fetch_one=True)
        
        # Get all available stages
        stages_query = """
            SELECT * FROM "JourneyStage"
            WHERE "isActive" = true
            ORDER BY "order" ASC
        """
        all_stages = self._execute_query(stages_query, fetch_all=True)
        
        # Calculate next stage
        current_stage_order = next((s['order'] for s in all_stages if s['id'] == result['stageId']), 0)
        next_stage = next((s for s in all_stages if s['order'] == current_stage_order + 1), None)
        
        return {
            'user_id': user_id,
            'current_stage': result['stageId'],
            'progress_percentage': 0,  # Calculate based on completed stages
            'completed_stages': [],  # Will be calculated based on status
            'next_stage': next_stage['id'] if next_stage else None,
            'requirements': []
        }
    
    def complete_journey_stage(self, user_id, stage):
        """Complete journey stage"""
        try:
            # Get current journey state
            current_state = self.get_user_journey_status(user_id)
            
            # Update completed stages
            completed_stages = current_state['completed_stages']
            if stage not in completed_stages:
                completed_stages.append(stage)
            
            # Calculate progress percentage
            total_stages = 6  # Account Creation, Profile Setup, Legal Pack, Subscription, Orientation, BUZ Tokens
            progress_percentage = int((len(completed_stages) / total_stages) * 100)
            
            # Update journey state
            update_data = {
                'current_stage': stage,
                'progress_percentage': progress_percentage,
                'completed_stages': completed_stages,
                'updated_at': datetime.now().isoformat()
            }
            
            set_clause = ', '.join([f"{col} = %s" for col in update_data.keys()])
            values = list(update_data.values()) + [user_id]
            
            query = f"""
                UPDATE "UserJourneyState"
                SET {set_clause}
                WHERE user_id = %s
                RETURNING *
            """
            
            result = self._execute_query(query, values, fetch_one=True)
            
            return {
                'stage': stage,
                'completed_at': datetime.now().isoformat(),
                'next_stage': self.get_user_journey_status(user_id)['next_stage'],
                'rewards': []  # Add rewards logic here
            }
            
        except Exception as e:
            logger.error(f"Error completing journey stage: {e}")
            raise e
    
    def update_user_journey_status(self, user_id, data):
        """Update user journey status"""
        try:
            # Get current journey state
            current_state = self.get_user_journey_status(user_id)
            
            # Update with new data
            update_data = {
                'stageId': data.get('current_stage', current_state['current_stage']),
                'status': 'IN_PROGRESS',
                'updatedAt': datetime.now().isoformat(),
                'metadata': json.dumps({
                    'completed_stages': data.get('completed_stages', current_state['completed_stages']),
                    'progress_percentage': data.get('progress_percentage', current_state['progress_percentage']),
                    'requirements': data.get('requirements', current_state.get('requirements', []))
                })
            }
            
            set_clause = ', '.join([f'"{col}" = %s' for col in update_data.keys()])
            values = list(update_data.values()) + [user_id]
            
            query = f"""
                UPDATE "UserJourneyState"
                SET {set_clause}
                WHERE "userId" = %s
                RETURNING *
            """
            
            result = self._execute_query(query, values, fetch_one=True)
            
            # Return updated status
            return self.get_user_journey_status(user_id)
            
        except Exception as e:
            logger.error(f"Error updating journey status: {e}")
            raise e
    
    # ============================================================================
    # TEAM MANAGEMENT
    # ============================================================================
    
    def get_team_by_id(self, team_id):
        """Get team by ID"""
        query = """
            SELECT t.*, u.name as owner_name, u.email as owner_email
            FROM "Team" t
            LEFT JOIN "User" u ON t.owner_id = u.id
            WHERE t.id = %s AND t.is_deleted = false
        """
        return self._execute_query(query, (team_id,), fetch_one=True)
    
    def create_team(self, data):
        """Create new team"""
        columns = list(data.keys())
        values = list(data.values())
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "Team" ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    def update_team(self, team_id, data):
        """Update team"""
        set_clause = ', '.join([f"{col} = %s" for col in data.keys()])
        values = list(data.values()) + [team_id]
        
        query = f"""
            UPDATE "Team"
            SET {set_clause}
            WHERE id = %s AND is_deleted = false
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    # ============================================================================
    # UMBRELLA NETWORK
    # ============================================================================
    
    def get_umbrella_relationships(self, user_id):
        """Get umbrella relationships for user"""
        query = """
            SELECT ur.*, 
                   u1.name as referrer_name, u1.email as referrer_email, u1.level as referrer_level,
                   u2.name as referred_name, u2.email as referred_email, u2.level as referred_level
            FROM "UmbrellaRelationship" ur
            LEFT JOIN "User" u1 ON ur.referrer_id = u1.id
            LEFT JOIN "User" u2 ON ur.referred_id = u2.id
            WHERE ur.referrer_id = %s OR ur.referred_id = %s
            ORDER BY ur.created_at DESC
        """
        return self._execute_query(query, (user_id, user_id), fetch_all=True)
    
    def create_umbrella_relationship(self, data):
        """Create umbrella relationship"""
        columns = list(data.keys())
        values = list(data.values())
        placeholders = ['%s'] * len(values)
        
        query = f"""
            INSERT INTO "UmbrellaRelationship" ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """
        
        return self._execute_query(query, values, fetch_one=True)
    
    def get_umbrella_revenue_shares(self, user_id):
        """Get umbrella revenue shares for user"""
        query = """
            SELECT rs.*,
                   p.name as project_name, p.email as project_email,
                   u.name as referred_name, u.email as referred_email
            FROM "RevenueShare" rs
            LEFT JOIN "Project" p ON rs.project_id = p.id
            LEFT JOIN "User" u ON rs.referred_id = u.id
            WHERE rs.referrer_id = %s
            ORDER BY rs.calculated_at DESC
        """
        return self._execute_query(query, (user_id,), fetch_all=True)
    
    # ============================================================================
    # ANALYTICS
    # ============================================================================
    
    def get_user_analytics(self, user_id):
        """Get user analytics"""
        # Get user ventures count
        ventures_query = """
            SELECT COUNT(*) as total_ventures,
                   COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_ventures
            FROM "Venture"
            WHERE "createdBy" = %s
        """
        ventures_result = self._execute_query(ventures_query, (user_id,), fetch_one=True)
        
        # Get BUZ balance
        buz_data = self.get_user_buz_tokens(user_id)
        
        # Get user details
        user = self.get_user_by_id(user_id)
        
        return {
            'user_id': user_id,
            'total_ventures': ventures_result['total_ventures'],
            'active_ventures': ventures_result['active_ventures'],
            'buz_balance': buz_data['balance'],
            'xp_points': user.get('xp', 0) if user else 0,
            'level': user.get('level', 'Unknown') if user else 'Unknown',
            'total_contributions': user.get('total_contributions', 0) if user else 0,
            'portfolio_value': user.get('total_portfolio_value', 0) if user else 0
        }
    
    def get_venture_analytics(self, venture_id):
        """Get venture analytics"""
        # Get team members count
        members_query = """
            SELECT COUNT(*) as total_members,
                   COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_members
            FROM "TeamMember"
            WHERE venture_id = %s
        """
        members_result = self._execute_query(members_query, (venture_id,), fetch_one=True)
        
        # Get contributions count
        contributions_query = """
            SELECT COUNT(*) as total_contributions
            FROM "Contribution"
            WHERE venture_id = %s
        """
        contributions_result = self._execute_query(contributions_query, (venture_id,), fetch_one=True)
        
        return {
            'venture_id': venture_id,
            'total_members': members_result['total_members'],
            'active_members': members_result['active_members'],
            'total_contributions': contributions_result['total_contributions'],
            'completion_percentage': 75,  # Calculate based on goals
            'revenue_generated': 0,  # Calculate from revenue data
            'buzz_score': 85  # Calculate from engagement metrics
        }
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def test_connection(self):
        """Test database connection"""
        try:
            query = "SELECT 1 as test"
            result = self._execute_query(query, fetch_one=True)
            return result['test'] == 1
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

# Create global instance
db = DirectDatabaseConnector()
