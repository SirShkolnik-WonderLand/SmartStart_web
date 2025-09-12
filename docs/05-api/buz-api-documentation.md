# BUZ Token API Documentation

## Overview
The BUZ (Business Utility Zone) Token API provides comprehensive token management functionality for the SmartStart platform, including user operations, admin controls, and system analytics.

## Base URL
```
https://smartstart-api.onrender.com/api/v1/buz
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Core Endpoints

### 1. Token Supply Information
**GET** `/supply`

Get current BUZ token supply and pricing information.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSupply": 1000000000,
    "circulatingSupply": 0,
    "burnedSupply": 0,
    "stakedSupply": 0,
    "reserveSupply": 200000000,
    "teamSupply": 150000000,
    "communitySupply": 100000000,
    "liquiditySupply": 100000000,
    "stakingRewardsSupply": 200000000,
    "userRewardsSupply": 150000000,
    "ventureFundSupply": 100000000,
    "currentPrice": 0.01,
    "marketCap": 0,
    "lastUpdated": "2025-09-12T02:43:00.659Z"
  }
}
```

### 2. Platform Statistics
**GET** `/stats`

Get BUZ token platform statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 0,
    "totalTransactions": 0,
    "totalStaked": 0,
    "totalBurned": 0,
    "recentTransactions24h": 0,
    "activeStakingPositions": 0,
    "totalRewardsClaimed": 0
  }
}
```

### 3. User Balance
**GET** `/balance/:userId`

Get user's BUZ token balance and activity.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "balance": 0,
    "stakedBalance": 0,
    "totalEarned": 0,
    "totalSpent": 0,
    "totalBurned": 0,
    "lastActivity": null
  }
}
```

### 4. Transaction History
**GET** `/transactions/:userId`

Get user's transaction history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `type` (optional): Transaction type filter
- `status` (optional): Transaction status filter

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 0,
      "pages": 0
    }
  }
}
```

### 5. Transfer Tokens
**POST** `/transfer`

Transfer BUZ tokens to another user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "toUserId": "user456",
  "amount": 100,
  "reason": "Payment for services",
  "description": "Project completion bonus"
}
```

**Response:**
```json
{
  "success": true,
  "message": "BUZ transfer completed successfully",
  "data": {
    "transactionId": "buz_1234567890_abc123",
    "fromUserId": "user123",
    "toUserId": "user456",
    "amount": 100,
    "status": "CONFIRMED"
  }
}
```

### 6. Stake Tokens
**POST** `/stake`

Stake BUZ tokens for rewards.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 1000,
  "tier": "BASIC"
}
```

**Staking Tiers:**
- `BASIC`: 30 days, 5% APY
- `PREMIUM`: 90 days, 10% APY
- `VIP`: 180 days, 15% APY
- `GOVERNANCE`: 365 days, 20% APY

**Response:**
```json
{
  "success": true,
  "message": "BUZ tokens staked successfully",
  "data": {
    "stakingId": "staking_1234567890_def456",
    "userId": "user123",
    "amount": 1000,
    "tier": "BASIC",
    "duration": 30,
    "apy": 5.00,
    "expectedReward": 4.11,
    "endDate": "2025-10-12T02:43:00.659Z"
  }
}
```

### 7. Staking Positions
**GET** `/staking/:userId`

Get user's active staking positions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stakingPositions": []
  }
}
```

### 8. Claim Rewards
**POST** `/rewards/claim`

Claim available staking rewards.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Rewards claimed successfully",
  "data": {
    "claimedRewards": [],
    "totalAmount": 0
  }
}
```

### 9. User Rewards
**GET** `/rewards/:userId`

Get user's reward history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "rewards": []
  }
}
```

## Admin Endpoints

### 1. Mint Tokens
**POST** `/admin/mint`

Mint new BUZ tokens (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 1000,
  "reason": "Platform reward"
}
```

**Response:**
```json
{
  "success": true,
  "message": "BUZ tokens minted successfully",
  "data": {
    "transactionId": "mint_1234567890_ghi789",
    "userId": "user123",
    "amount": 1000,
    "mintedBy": "admin123",
    "reason": "Platform reward",
    "status": "CONFIRMED"
  }
}
```

### 2. Burn Tokens
**POST** `/admin/burn`

Burn BUZ tokens (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 100,
  "reason": "Account closure"
}
```

**Response:**
```json
{
  "success": true,
  "message": "BUZ tokens burned successfully",
  "data": {
    "transactionId": "burn_1234567890_jkl012",
    "userId": "user123",
    "amount": 100,
    "burnedBy": "admin123",
    "reason": "Account closure",
    "status": "CONFIRMED"
  }
}
```

### 3. Set Token Price
**POST** `/admin/set-price`

Set BUZ token price (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "price": 0.015
}
```

**Response:**
```json
{
  "success": true,
  "message": "BUZ token price updated successfully",
  "data": {
    "newPrice": 0.015,
    "updatedBy": "admin123",
    "updatedAt": "2025-09-12T02:43:00.659Z"
  }
}
```

### 4. System Analytics
**GET** `/admin/analytics`

Get comprehensive BUZ system analytics (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 0,
    "totalTransactions": 0,
    "totalVolume": 0,
    "totalStaked": 0,
    "totalBurned": 0,
    "averageTransactionSize": 0,
    "topUsers": [],
    "recentActivity": [],
    "priceHistory": [],
    "marketCap": 0,
    "circulatingSupply": 0
  }
}
```

### 5. All Users
**GET** `/admin/users`

Get all users with BUZ balances (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 0,
      "pages": 0
    }
  }
}
```

### 6. All Transactions
**GET** `/admin/transactions`

Get all BUZ transactions (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `type` (optional): Transaction type filter
- `status` (optional): Transaction status filter
- `userId` (optional): Filter by user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 0,
      "pages": 0
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions to perform this action"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Rate Limiting

- Public endpoints: 100 requests per minute
- Authenticated endpoints: 1000 requests per minute
- Admin endpoints: 500 requests per minute

## Webhooks

The BUZ API supports webhooks for the following events:
- `buz.transfer.completed`
- `buz.stake.created`
- `buz.rewards.claimed`
- `buz.admin.mint`
- `buz.admin.burn`

## SDK Examples

### JavaScript/TypeScript
```typescript
// Get BUZ supply
const response = await fetch('/api/v1/buz/supply');
const data = await response.json();

// Transfer BUZ tokens
const transferResponse = await fetch('/api/v1/buz/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    toUserId: 'user456',
    amount: 100,
    reason: 'Payment'
  })
});
```

### cURL Examples
```bash
# Get supply information
curl -X GET https://smartstart-api.onrender.com/api/v1/buz/supply

# Transfer tokens
curl -X POST https://smartstart-api.onrender.com/api/v1/buz/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"toUserId":"user456","amount":100,"reason":"Payment"}'

# Admin: Mint tokens
curl -X POST https://smartstart-api.onrender.com/api/v1/buz/admin/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"userId":"user123","amount":1000,"reason":"Reward"}'
```

## Support

For API support and questions:
- Email: support@smartstart.com
- Documentation: https://docs.smartstart.com
- Status Page: https://status.smartstart.com
