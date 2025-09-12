# 🔌 BUZ Token API Examples
## Complete Code Examples for BUZ Token API Integration

**Version:** 1.0  
**Last Updated:** September 2025  
**Platform:** SmartStart Venture Operating System

---

## 🚀 **Getting Started**

### **API Base URL**
```
https://smartstart-api.onrender.com/api/v1/buz
```

### **Authentication**
All API requests require JWT authentication:
```javascript
const headers = {
  'Authorization': `Bearer ${jwt_token}`,
  'Content-Type': 'application/json'
};
```

### **Rate Limits**
- **Standard Users:** 100 requests per hour
- **Premium Users:** 500 requests per hour
- **Admin Users:** 1000 requests per hour

---

## 💰 **Balance and Supply APIs**

### **Get Token Supply**
```javascript
// GET /api/v1/buz/supply
async function getTokenSupply() {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/supply', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Token Supply:', data);
    return data;
  } catch (error) {
    console.error('Error fetching token supply:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "totalSupply": 1000000000,
    "circulatingSupply": 50000000,
    "reserveSupply": 200000000,
    "stakedSupply": 10000000,
    "burnedSupply": 5000000
  }
}
```

### **Get User Balance**
```javascript
// GET /api/v1/buz/balance/:userId
async function getUserBalance(userId) {
  try {
    const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/balance/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('User Balance:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user balance:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "userId": "user123",
    "balance": 1500.50,
    "stakedBalance": 500.00,
    "totalEarned": 2000.50,
    "totalSpent": 500.00
  }
}
```

### **Get System Statistics**
```javascript
// GET /api/v1/buz/stats
async function getSystemStats() {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('System Stats:', data);
    return data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "activeUsers": 750,
    "dailyTransactions": 500,
    "totalTransactions": 10000,
    "averageTransactionValue": 25.50
  }
}
```

---

## 🔄 **Transaction APIs**

### **Transfer Tokens**
```javascript
// POST /api/v1/buz/transfer
async function transferTokens(recipientId, amount, reason = '') {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientId: recipientId,
        amount: amount,
        reason: reason
      })
    });
    
    const data = await response.json();
    console.log('Transfer Result:', data);
    return data;
  } catch (error) {
    console.error('Error transferring tokens:', error);
  }
}

// Example Usage
transferTokens('user456', 100.50, 'Payment for services');

// Example Response
{
  "success": true,
  "data": {
    "transactionId": "txn_123456789",
    "senderId": "user123",
    "recipientId": "user456",
    "amount": 100.50,
    "fee": 0.10,
    "status": "completed",
    "timestamp": "2025-09-11T10:30:00Z"
  }
}
```

### **Get Transaction History**
```javascript
// GET /api/v1/buz/transactions/:userId
async function getTransactionHistory(userId, limit = 20, offset = 0) {
  try {
    const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/transactions/${userId}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Transaction History:', data);
    return data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_123456789",
        "type": "transfer",
        "amount": 100.50,
        "status": "completed",
        "timestamp": "2025-09-11T10:30:00Z",
        "recipientId": "user456",
        "reason": "Payment for services"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 150
    }
  }
}
```

---

## 🏦 **Staking APIs**

### **Stake Tokens**
```javascript
// POST /api/v1/buz/stake
async function stakeTokens(amount, tier) {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/stake', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        tier: tier // 'bronze', 'silver', 'gold', 'platinum'
      })
    });
    
    const data = await response.json();
    console.log('Staking Result:', data);
    return data;
  } catch (error) {
    console.error('Error staking tokens:', error);
  }
}

// Example Usage
stakeTokens(1000, 'gold');

// Example Response
{
  "success": true,
  "data": {
    "stakingId": "stake_123456789",
    "userId": "user123",
    "amount": 1000,
    "tier": "gold",
    "apy": 12,
    "lockPeriod": 180,
    "startDate": "2025-09-11T10:30:00Z",
    "endDate": "2025-03-10T10:30:00Z"
  }
}
```

### **Get Staking Positions**
```javascript
// GET /api/v1/buz/staking/:userId
async function getStakingPositions(userId) {
  try {
    const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/staking/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Staking Positions:', data);
    return data;
  } catch (error) {
    console.error('Error fetching staking positions:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "positions": [
      {
        "id": "stake_123456789",
        "amount": 1000,
        "tier": "gold",
        "apy": 12,
        "startDate": "2025-09-11T10:30:00Z",
        "endDate": "2025-03-10T10:30:00Z",
        "rewards": 50.25,
        "status": "active"
      }
    ],
    "totalStaked": 1000,
    "totalRewards": 50.25
  }
}
```

### **Unstake Tokens**
```javascript
// POST /api/v1/buz/unstake
async function unstakeTokens(stakingId, early = false) {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/unstake', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stakingId: stakingId,
        early: early
      })
    });
    
    const data = await response.json();
    console.log('Unstaking Result:', data);
    return data;
  } catch (error) {
    console.error('Error unstaking tokens:', error);
  }
}

// Example Usage
unstakeTokens('stake_123456789', false);

// Example Response
{
  "success": true,
  "data": {
    "stakingId": "stake_123456789",
    "amount": 1000,
    "rewards": 50.25,
    "penalty": 0,
    "status": "completed",
    "timestamp": "2025-09-11T10:30:00Z"
  }
}
```

---

## 👑 **Admin APIs**

### **Mint Tokens (Admin Only)**
```javascript
// POST /api/v1/buz/admin/mint
async function mintTokens(amount, recipientId, reason) {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/admin/mint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${admin_jwt_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        recipientId: recipientId,
        reason: reason
      })
    });
    
    const data = await response.json();
    console.log('Minting Result:', data);
    return data;
  } catch (error) {
    console.error('Error minting tokens:', error);
  }
}

// Example Usage
mintTokens(1000, 'user123', 'Reward for project completion');

// Example Response
{
  "success": true,
  "data": {
    "transactionId": "mint_123456789",
    "amount": 1000,
    "recipientId": "user123",
    "reason": "Reward for project completion",
    "timestamp": "2025-09-11T10:30:00Z"
  }
}
```

### **Burn Tokens (Admin Only)**
```javascript
// POST /api/v1/buz/admin/burn
async function burnTokens(amount, reason) {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/admin/burn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${admin_jwt_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        reason: reason
      })
    });
    
    const data = await response.json();
    console.log('Burning Result:', data);
    return data;
  } catch (error) {
    console.error('Error burning tokens:', error);
  }
}

// Example Usage
burnTokens(500, 'Deflationary measure');

// Example Response
{
  "success": true,
  "data": {
    "transactionId": "burn_123456789",
    "amount": 500,
    "reason": "Deflationary measure",
    "timestamp": "2025-09-11T10:30:00Z"
  }
}
```

### **Get All Users (Admin Only)**
```javascript
// GET /api/v1/buz/admin/users
async function getAllUsers(limit = 50, offset = 0) {
  try {
    const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/admin/users?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${admin_jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('All Users:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all users:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "email": "user@example.com",
        "balance": 1500.50,
        "stakedBalance": 500.00,
        "totalEarned": 2000.50,
        "totalSpent": 500.00,
        "lastActive": "2025-09-11T10:30:00Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 1000
    }
  }
}
```

### **Get System Analytics (Admin Only)**
```javascript
// GET /api/v1/buz/admin/analytics
async function getSystemAnalytics() {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/admin/analytics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${admin_jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('System Analytics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching system analytics:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "totalSupply": 1000000000,
    "circulatingSupply": 50000000,
    "totalUsers": 1000,
    "activeUsers": 750,
    "dailyTransactions": 500,
    "totalTransactions": 10000,
    "averageTransactionValue": 25.50,
    "totalStaked": 10000000,
    "totalRewards": 500000
  }
}
```

---

## ⚖️ **Legal APIs**

### **Sign BUZ Token Terms of Service**
```javascript
// POST /api/v1/buz/legal/terms/sign
async function signBUZTerms(userId, signature, ipAddress, userAgent) {
  try {
    const response = await fetch('https://smartstart-api.onrender.com/api/v1/buz/legal/terms/sign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        signature: signature,
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    });
    
    const data = await response.json();
    console.log('Terms Signing Result:', data);
    return data;
  } catch (error) {
    console.error('Error signing terms:', error);
  }
}

// Example Usage
signBUZTerms('user123', 'digital_signature_hash', '192.168.1.1', 'Mozilla/5.0...');

// Example Response
{
  "success": true,
  "data": {
    "agreementId": "agreement_123456789",
    "userId": "user123",
    "documentType": "BUZ_TOKEN_TERMS",
    "signedAt": "2025-09-11T10:30:00Z",
    "rbacLevel": "BUZ_USER"
  }
}
```

### **Get Legal Status**
```javascript
// GET /api/v1/buz/legal/status/:userId
async function getLegalStatus(userId) {
  try {
    const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/legal/status/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Legal Status:', data);
    return data;
  } catch (error) {
    console.error('Error fetching legal status:', error);
  }
}

// Example Response
{
  "success": true,
  "data": {
    "userId": "user123",
    "termsSigned": true,
    "privacySigned": true,
    "termsVersion": "1.0",
    "privacyVersion": "1.0",
    "signedAt": "2025-09-11T10:30:00Z",
    "rbacLevel": "BUZ_USER"
  }
}
```

---

## 🔧 **Error Handling**

### **Standard Error Response**
```javascript
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient token balance for transaction",
    "details": {
      "required": 100.50,
      "available": 50.25
    }
  }
}
```

### **Error Handling Example**
```javascript
async function handleAPIRequest(apiFunction) {
  try {
    const response = await apiFunction();
    
    if (response.success) {
      console.log('Success:', response.data);
      return response.data;
    } else {
      console.error('API Error:', response.error);
      throw new Error(response.error.message);
    }
  } catch (error) {
    console.error('Request Error:', error);
    throw error;
  }
}

// Usage
handleAPIRequest(() => getUserBalance('user123'))
  .then(data => console.log('Balance:', data))
  .catch(error => console.error('Error:', error));
```

---

## 📱 **Frontend Integration**

### **React Hook Example**
```javascript
import { useState, useEffect } from 'react';

function useBUZBalance(userId) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/balance/${userId}`, {
          headers: {
            'Authorization': `Bearer ${jwt_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setBalance(data.data);
        } else {
          setError(data.error.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [userId]);

  return { balance, loading, error };
}

// Usage in component
function BUZWallet({ userId }) {
  const { balance, loading, error } = useBUZBalance(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>BUZ Wallet</h3>
      <p>Balance: {balance.balance} BUZ</p>
      <p>Staked: {balance.stakedBalance} BUZ</p>
    </div>
  );
}
```

### **Vue.js Example**
```javascript
// Vue.js Composition API
import { ref, onMounted } from 'vue';

export function useBUZBalance(userId) {
  const balance = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchBalance = async () => {
    try {
      loading.value = true;
      const response = await fetch(`https://smartstart-api.onrender.com/api/v1/buz/balance/${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwt_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        balance.value = data.data;
      } else {
        error.value = data.error.message;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchBalance);

  return { balance, loading, error, fetchBalance };
}
```

---

## 🧪 **Testing Examples**

### **Unit Test Example (Jest)**
```javascript
// buz-api.test.js
import { getUserBalance, transferTokens } from './buz-api';

describe('BUZ API', () => {
  test('should fetch user balance', async () => {
    const mockResponse = {
      success: true,
      data: {
        userId: 'user123',
        balance: 1500.50,
        stakedBalance: 500.00
      }
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await getUserBalance('user123');
    
    expect(result).toEqual(mockResponse.data);
    expect(fetch).toHaveBeenCalledWith(
      'https://smartstart-api.onrender.com/api/v1/buz/balance/user123',
      expect.any(Object)
    );
  });

  test('should handle transfer errors', async () => {
    const mockError = {
      success: false,
      error: {
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient token balance'
      }
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockError)
    });

    await expect(transferTokens('user456', 1000)).rejects.toThrow('Insufficient token balance');
  });
});
```

### **Integration Test Example**
```javascript
// integration-test.js
describe('BUZ API Integration', () => {
  test('should complete full transfer flow', async () => {
    // 1. Get initial balance
    const initialBalance = await getUserBalance('user123');
    
    // 2. Transfer tokens
    const transferResult = await transferTokens('user456', 100);
    expect(transferResult.success).toBe(true);
    
    // 3. Verify balance change
    const newBalance = await getUserBalance('user123');
    expect(newBalance.balance).toBe(initialBalance.balance - 100);
    
    // 4. Verify transaction history
    const history = await getTransactionHistory('user123');
    expect(history.data.transactions[0].amount).toBe(100);
  });
});
```

---

## 📚 **Additional Resources**

### **SDK Libraries**
- **JavaScript SDK:** Complete JavaScript SDK
- **Python SDK:** Python integration library
- **PHP SDK:** PHP integration library
- **Java SDK:** Java integration library
- **C# SDK:** C# integration library

### **Documentation**
- **API Reference:** Complete API documentation
- **Authentication Guide:** JWT authentication guide
- **Rate Limiting:** Rate limiting guidelines
- **Error Codes:** Complete error code reference
- **Webhooks:** Webhook integration guide

### **Support**
- **Developer Support:** Technical support for developers
- **API Status:** Real-time API status page
- **Community Forum:** Developer community forum
- **GitHub Repository:** Open source examples and tools
- **Discord Server:** Real-time developer chat

---

*Last Updated: September 2025 | Version: 1.0 | SmartStart Platform*
