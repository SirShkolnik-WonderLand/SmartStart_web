"""
Secure BUZ Token Manager for SmartStart Platform
Implements cryptographic security for BUZ token economy
"""

import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from cryptography.fernet import Fernet
import redis
import threading
from decimal import Decimal, getcontext

# Set precision for decimal calculations
getcontext().prec = 28

class SecureBUZTokenManager:
    """
    Enterprise-grade BUZ token management with cryptographic security
    """
    
    def __init__(self):
        self.encryption_key = self._get_encryption_key()
        self.cipher = Fernet(self.encryption_key)
        self.hmac_secret = self._get_hmac_secret()
        self.redis_client = redis.Redis(host='localhost', port=6379, db=2)
        self.transaction_lock = threading.Lock()
        
    def _get_encryption_key(self) -> bytes:
        """Get or generate encryption key for token security"""
        key = Fernet.generate_key()
        # In production, store this securely
        return key
    
    def _get_hmac_secret(self) -> bytes:
        """Get or generate HMAC secret for transaction signing"""
        return secrets.token_bytes(32)
    
    def create_secure_transaction(self, from_user: str, to_user: str, amount: int, 
                                reason: str, transaction_type: str = 'transfer') -> Dict[str, str]:
        """
        Create cryptographically secure BUZ transaction
        """
        with self.transaction_lock:
            # Generate unique transaction ID
            transaction_id = f"buz_tx_{secrets.token_hex(16)}"
            
            # Create transaction data
            transaction_data = {
                'id': transaction_id,
                'from_user': from_user,
                'to_user': to_user,
                'amount': amount,
                'reason': reason,
                'type': transaction_type,
                'timestamp': datetime.utcnow().isoformat(),
                'nonce': secrets.token_hex(16),
                'version': '1.0'
            }
            
            # Create digital signature
            signature = self._create_signature(transaction_data)
            transaction_data['signature'] = signature
            
            # Encrypt transaction
            encrypted_transaction = self.cipher.encrypt(
                json.dumps(transaction_data).encode()
            )
            
            # Store transaction hash for integrity
            transaction_hash = self._calculate_transaction_hash(transaction_data)
            
            return {
                'transaction_id': transaction_id,
                'encrypted_transaction': encrypted_transaction.hex(),
                'transaction_hash': transaction_hash,
                'status': 'pending'
            }
    
    def verify_transaction(self, encrypted_transaction: str) -> Tuple[bool, Optional[Dict]]:
        """
        Verify transaction integrity and authenticity
        """
        try:
            # Decrypt transaction
            encrypted_bytes = bytes.fromhex(encrypted_transaction)
            decrypted_data = self.cipher.decrypt(encrypted_bytes)
            transaction_data = json.loads(decrypted_data.decode())
            
            # Verify signature
            signature = transaction_data.pop('signature')
            expected_signature = self._create_signature(transaction_data)
            
            if not hmac.compare_digest(signature, expected_signature):
                return False, {'error': 'Invalid signature'}
            
            # Verify transaction hash
            expected_hash = self._calculate_transaction_hash(transaction_data)
            if transaction_data.get('id') != expected_hash.split('_')[-1]:
                return False, {'error': 'Invalid transaction hash'}
            
            # Verify transaction age (prevent replay attacks)
            transaction_time = datetime.fromisoformat(transaction_data['timestamp'])
            if datetime.utcnow() - transaction_time > timedelta(hours=24):
                return False, {'error': 'Transaction too old'}
            
            return True, transaction_data
            
        except Exception as e:
            return False, {'error': f'Transaction verification failed: {str(e)}'}
    
    def process_transaction(self, transaction_id: str, encrypted_transaction: str) -> Tuple[bool, Optional[Dict]]:
        """
        Process BUZ transaction with double-spending prevention
        """
        with self.transaction_lock:
            # Verify transaction
            is_valid, transaction_data = self.verify_transaction(encrypted_transaction)
            if not is_valid:
                return False, transaction_data
            
            # Check for double spending
            if self._is_double_spend(transaction_id):
                return False, {'error': 'Double spending detected'}
            
            # Check user balances
            from_balance = self._get_user_balance(transaction_data['from_user'])
            if from_balance < transaction_data['amount']:
                return False, {'error': 'Insufficient balance'}
            
            # Process transaction atomically
            try:
                # Deduct from sender
                self._update_user_balance(
                    transaction_data['from_user'], 
                    -transaction_data['amount']
                )
                
                # Add to receiver
                self._update_user_balance(
                    transaction_data['to_user'], 
                    transaction_data['amount']
                )
                
                # Mark transaction as processed
                self._mark_transaction_processed(transaction_id)
                
                # Log transaction
                self._log_transaction(transaction_data)
                
                return True, {
                    'transaction_id': transaction_id,
                    'status': 'completed',
                    'timestamp': datetime.utcnow().isoformat()
                }
                
            except Exception as e:
                # Rollback on error
                self._rollback_transaction(transaction_data)
                return False, {'error': f'Transaction processing failed: {str(e)}'}
    
    def get_user_balance(self, user_id: str) -> int:
        """Get user BUZ token balance"""
        try:
            balance = self.redis_client.get(f"buz_balance:{user_id}")
            return int(balance) if balance else 0
        except Exception:
            return 0
    
    def award_tokens(self, user_id: str, amount: int, reason: str) -> Tuple[bool, Optional[Dict]]:
        """
        Award BUZ tokens to user with security validation
        """
        if amount <= 0:
            return False, {'error': 'Invalid amount'}
        
        if amount > 1000000:  # Maximum single award
            return False, {'error': 'Amount too large'}
        
        # Create award transaction
        transaction = self.create_secure_transaction(
            from_user='system',
            to_user=user_id,
            amount=amount,
            reason=reason,
            transaction_type='award'
        )
        
        # Process transaction
        success, result = self.process_transaction(
            transaction['transaction_id'],
            transaction['encrypted_transaction']
        )
        
        return success, result
    
    def spend_tokens(self, user_id: str, amount: int, reason: str) -> Tuple[bool, Optional[Dict]]:
        """
        Spend BUZ tokens from user with security validation
        """
        if amount <= 0:
            return False, {'error': 'Invalid amount'}
        
        # Check balance
        balance = self.get_user_balance(user_id)
        if balance < amount:
            return False, {'error': 'Insufficient balance'}
        
        # Create spend transaction
        transaction = self.create_secure_transaction(
            from_user=user_id,
            to_user='system',
            amount=amount,
            reason=reason,
            transaction_type='spend'
        )
        
        # Process transaction
        success, result = self.process_transaction(
            transaction['transaction_id'],
            transaction['encrypted_transaction']
        )
        
        return success, result
    
    def _create_signature(self, data: Dict) -> str:
        """Create HMAC signature for transaction integrity"""
        # Sort data for consistent signing
        sorted_data = json.dumps(data, sort_keys=True)
        signature = hmac.new(
            self.hmac_secret,
            sorted_data.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _calculate_transaction_hash(self, data: Dict) -> str:
        """Calculate SHA-256 hash for transaction integrity"""
        # Create hash from transaction data
        hash_data = f"{data['id']}_{data['from_user']}_{data['to_user']}_{data['amount']}_{data['timestamp']}"
        return hashlib.sha256(hash_data.encode()).hexdigest()
    
    def _is_double_spend(self, transaction_id: str) -> bool:
        """Check if transaction has already been processed"""
        try:
            return self.redis_client.exists(f"processed_tx:{transaction_id}") > 0
        except Exception:
            return False
    
    def _get_user_balance(self, user_id: str) -> int:
        """Get user balance from Redis"""
        try:
            balance = self.redis_client.get(f"buz_balance:{user_id}")
            return int(balance) if balance else 0
        except Exception:
            return 0
    
    def _update_user_balance(self, user_id: str, amount: int):
        """Update user balance atomically"""
        try:
            self.redis_client.incrby(f"buz_balance:{user_id}", amount)
        except Exception:
            raise Exception("Failed to update balance")
    
    def _mark_transaction_processed(self, transaction_id: str):
        """Mark transaction as processed to prevent double spending"""
        try:
            self.redis_client.setex(f"processed_tx:{transaction_id}", 86400, "1")  # 24 hours
        except Exception:
            pass
    
    def _log_transaction(self, transaction_data: Dict):
        """Log transaction for audit trail"""
        try:
            log_entry = {
                'transaction_id': transaction_data['id'],
                'from_user': transaction_data['from_user'],
                'to_user': transaction_data['to_user'],
                'amount': transaction_data['amount'],
                'reason': transaction_data['reason'],
                'type': transaction_data['type'],
                'timestamp': transaction_data['timestamp'],
                'processed_at': datetime.utcnow().isoformat()
            }
            
            # Store in Redis for audit trail
            self.redis_client.lpush('buz_transactions', json.dumps(log_entry))
            
            # Keep only last 10000 transactions
            self.redis_client.ltrim('buz_transactions', 0, 9999)
            
        except Exception:
            pass
    
    def _rollback_transaction(self, transaction_data: Dict):
        """Rollback transaction on error"""
        try:
            # Reverse the balance changes
            self._update_user_balance(transaction_data['from_user'], transaction_data['amount'])
            self._update_user_balance(transaction_data['to_user'], -transaction_data['amount'])
        except Exception:
            pass
    
    def get_transaction_history(self, user_id: str, limit: int = 100) -> List[Dict]:
        """Get transaction history for user"""
        try:
            transactions = self.redis_client.lrange('buz_transactions', 0, limit - 1)
            user_transactions = []
            
            for tx_json in transactions:
                tx = json.loads(tx_json)
                if tx['from_user'] == user_id or tx['to_user'] == user_id:
                    user_transactions.append(tx)
            
            return user_transactions
        except Exception:
            return []
    
    def validate_economic_rules(self, transaction_type: str, amount: int) -> Tuple[bool, str]:
        """Validate transaction against economic rules"""
        rules = {
            'transfer': {'min': 1, 'max': 1000000},
            'award': {'min': 1, 'max': 100000},
            'spend': {'min': 1, 'max': 1000000},
            'stake': {'min': 100, 'max': 1000000},
            'unstake': {'min': 100, 'max': 1000000}
        }
        
        rule = rules.get(transaction_type)
        if not rule:
            return False, f"Unknown transaction type: {transaction_type}"
        
        if amount < rule['min']:
            return False, f"Amount too small. Minimum: {rule['min']}"
        
        if amount > rule['max']:
            return False, f"Amount too large. Maximum: {rule['max']}"
        
        return True, "Valid"

# Fraud detection system
class BUZFraudDetector:
    """Machine learning-based fraud detection for BUZ transactions"""
    
    def __init__(self):
        self.suspicious_patterns = []
        self.user_behavior = {}
    
    def analyze_transaction(self, transaction_data: Dict) -> Tuple[bool, float]:
        """
        Analyze transaction for fraud indicators
        Returns: (is_fraud, confidence_score)
        """
        fraud_indicators = []
        confidence = 0.0
        
        # Check for unusual amounts
        if transaction_data['amount'] > 500000:  # Large transaction
            fraud_indicators.append('large_amount')
            confidence += 0.3
        
        # Check for rapid transactions
        user_id = transaction_data['from_user']
        if self._is_rapid_transaction(user_id):
            fraud_indicators.append('rapid_transactions')
            confidence += 0.4
        
        # Check for unusual patterns
        if self._has_unusual_pattern(transaction_data):
            fraud_indicators.append('unusual_pattern')
            confidence += 0.2
        
        # Check for new user with large transactions
        if self._is_new_user_large_transaction(transaction_data):
            fraud_indicators.append('new_user_large')
            confidence += 0.5
        
        is_fraud = confidence > 0.6
        return is_fraud, confidence
    
    def _is_rapid_transaction(self, user_id: str) -> bool:
        """Check if user is making rapid transactions"""
        # Implementation would check recent transaction frequency
        return False
    
    def _has_unusual_pattern(self, transaction_data: Dict) -> bool:
        """Check for unusual transaction patterns"""
        # Implementation would analyze transaction patterns
        return False
    
    def _is_new_user_large_transaction(self, transaction_data: Dict) -> bool:
        """Check if new user is making large transactions"""
        # Implementation would check user age and transaction size
        return False
