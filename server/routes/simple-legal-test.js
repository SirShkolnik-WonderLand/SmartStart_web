/**
 * Simple Legal Test Route
 * Test route without Prisma dependencies
 */

const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Simple legal test route is working!', 
        timestamp: new Date().toISOString(),
        legalTemplates: [
            {
                id: 'work-for-hire-template-v1',
                name: 'Work-for-Hire Agreement',
                type: 'WORK_FOR_HIRE_AGREEMENT',
                liquidatedDamages: 100000
            },
            {
                id: 'worldwide-non-compete-template-v1',
                name: 'Worldwide Non-Compete Agreement',
                type: 'WORLDWIDE_NON_COMPETE',
                liquidatedDamages: 50000
            },
            {
                id: 'anti-ip-theft-template-v1',
                name: 'Anti-IP-Theft Agreement',
                type: 'ANTI_IP_THEFT_AGREEMENT',
                liquidatedDamages: 100000
            },
            {
                id: 'platform-lock-in-template-v1',
                name: 'Platform Lock-In Agreement',
                type: 'PLATFORM_LOCK_IN_AGREEMENT',
                liquidatedDamages: 50000
            },
            {
                id: 'revenue-sharing-enforcement-template-v1',
                name: 'Revenue Sharing Enforcement Agreement',
                type: 'REVENUE_SHARING_ENFORCEMENT',
                liquidatedDamages: 0
            }
        ]
    });
});

module.exports = router;
