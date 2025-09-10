/**
 * Slack Integration Service
 * Handles Slack workspace and channel management for ventures
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class SlackIntegrationService {
  constructor() {
    this.slackApiUrl = 'https://slack.com/api';
  }

  /**
   * Create Slack integration for a venture
   * @param {string} ventureId - Venture ID
   * @param {Object} slackConfig - Slack configuration
   * @returns {Promise<Object>} Created integration
   */
  async createVentureSlackIntegration(ventureId, slackConfig) {
    try {
      const { workspaceId, workspaceName, channelId, channelName, botToken, webhookUrl } = slackConfig;

      // Verify Slack workspace access
      const workspaceInfo = await this.verifySlackWorkspace(botToken);
      if (!workspaceInfo.success) {
        throw new Error('Invalid Slack workspace or bot token');
      }

      // Create or update integration
      const integration = await prisma.ventureSlackIntegration.upsert({
        where: { ventureId },
        update: {
          slackWorkspaceId: workspaceId,
          slackWorkspaceName: workspaceName,
          slackChannelId: channelId,
          slackChannelName: channelName,
          botToken: this.encryptToken(botToken),
          webhookUrl,
          status: 'ACTIVE',
          lastSyncAt: new Date()
        },
        create: {
          ventureId,
          slackWorkspaceId: workspaceId,
          slackWorkspaceName: workspaceName,
          slackChannelId: channelId,
          slackChannelName: channelName,
          botToken: this.encryptToken(botToken),
          webhookUrl,
          status: 'ACTIVE',
          features: {
            messages: true,
            updates: true,
            notifications: true,
            milestones: true,
            tasks: true,
            risks: true
          }
        }
      });

      // Send welcome message to Slack channel
      await this.sendSlackMessage(ventureId, {
        text: `🚀 *${workspaceName}* has been connected to SmartStart!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🎉 *Welcome to SmartStart Venture Management!*\n\nThis channel is now connected to your venture's 30-day launch timeline, sprint management, and risk tracking.\n\n*Available commands:*\n• \`/smartstart status\` - Get venture status\n• \`/smartstart timeline\` - View launch timeline\n• \`/smartstart sprint\` - Current sprint info\n• \`/smartstart risks\` - View active risks\n• \`/smartstart checkin\` - Daily check-in`
            }
          }
        ]
      });

      return {
        success: true,
        data: integration,
        message: 'Slack integration created successfully'
      };
    } catch (error) {
      console.error('Slack integration creation error:', error);
      return {
        success: false,
        error: { code: 'SLACK_INTEGRATION_ERROR', message: error.message }
      };
    }
  }

  /**
   * Send message to venture's Slack channel
   * @param {string} ventureId - Venture ID
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} Send result
   */
  async sendSlackMessage(ventureId, message) {
    try {
      const integration = await prisma.ventureSlackIntegration.findUnique({
        where: { ventureId }
      });

      if (!integration || integration.status !== 'ACTIVE') {
        throw new Error('Slack integration not found or inactive');
      }

      const botToken = this.decryptToken(integration.botToken);
      const response = await axios.post(
        `${this.slackApiUrl}/chat.postMessage`,
        {
          channel: integration.slackChannelId,
          ...message
        },
        {
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      // Store message in database
      await prisma.slackMessage.create({
        data: {
          ventureId,
          slackMessageId: response.data.ts,
          slackChannelId: integration.slackChannelId,
          slackUserId: 'bot',
          slackUserName: 'SmartStart Bot',
          content: message.text || 'System message',
          messageType: 'SYSTEM'
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Message sent successfully'
      };
    } catch (error) {
      console.error('Slack message send error:', error);
      return {
        success: false,
        error: { code: 'SLACK_MESSAGE_ERROR', message: error.message }
      };
    }
  }

  /**
   * Send milestone update to Slack
   * @param {string} ventureId - Venture ID
   * @param {Object} milestone - Milestone data
   * @param {string} action - Action performed (created, updated, completed)
   * @returns {Promise<Object>} Send result
   */
  async sendMilestoneUpdate(ventureId, milestone, action) {
    const actionEmojis = {
      created: '🆕',
      updated: '📝',
      completed: '✅',
      blocked: '🚫'
    };

    const actionText = {
      created: 'created',
      updated: 'updated',
      completed: 'completed',
      blocked: 'blocked'
    };

    const emoji = actionEmojis[action] || '📝';
    const text = actionText[action] || 'updated';

    const message = {
      text: `${emoji} Milestone ${text}: ${milestone.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${emoji} Milestone ${text.toUpperCase()}*\n\n*${milestone.title}*\n${milestone.description || ''}\n\n*Phase:* ${milestone.phase}\n*Target Date:* ${new Date(milestone.targetDate).toLocaleDateString()}\n*Priority:* ${milestone.priority}/5`
          }
        }
      ]
    };

    return await this.sendSlackMessage(ventureId, message);
  }

  /**
   * Send task update to Slack
   * @param {string} ventureId - Venture ID
   * @param {Object} task - Task data
   * @param {string} action - Action performed
   * @returns {Promise<Object>} Send result
   */
  async sendTaskUpdate(ventureId, task, action) {
    const actionEmojis = {
      created: '📋',
      assigned: '👤',
      in_progress: '🔄',
      completed: '✅',
      blocked: '🚫'
    };

    const emoji = actionEmojis[action] || '📝';

    const message = {
      text: `${emoji} Task ${action}: ${task.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${emoji} Task ${action.toUpperCase().replace('_', ' ')}*\n\n*${task.title}*\n${task.description || ''}\n\n*Type:* ${task.taskType}\n*Priority:* ${task.priority}/5\n*Story Points:* ${task.storyPoints}\n*Assignee:* ${task.assignee?.name || 'Unassigned'}`
          }
        }
      ]
    };

    return await this.sendSlackMessage(ventureId, message);
  }

  /**
   * Send risk alert to Slack
   * @param {string} ventureId - Venture ID
   * @param {Object} risk - Risk data
   * @param {string} action - Action performed
   * @returns {Promise<Object>} Send result
   */
  async sendRiskAlert(ventureId, risk, action) {
    const riskEmojis = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    const riskLevel = risk.riskScore >= 20 ? 'critical' : 
                     risk.riskScore >= 15 ? 'high' : 
                     risk.riskScore >= 10 ? 'medium' : 'low';

    const emoji = riskEmojis[riskLevel];

    const message = {
      text: `${emoji} Risk ${action}: ${risk.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${emoji} Risk ${action.toUpperCase()}*\n\n*${risk.title}*\n${risk.description || ''}\n\n*Type:* ${risk.riskType}\n*Risk Score:* ${risk.riskScore}/25\n*Impact:* ${risk.impactLevel}/5\n*Probability:* ${risk.probabilityLevel}/5\n*Owner:* ${risk.owner?.name || 'Unassigned'}`
          }
        }
      ]
    };

    return await this.sendSlackMessage(ventureId, message);
  }

  /**
   * Send daily check-in summary to Slack
   * @param {string} ventureId - Venture ID
   * @param {Array} checkins - Daily check-ins
   * @returns {Promise<Object>} Send result
   */
  async sendDailyCheckinSummary(ventureId, checkins) {
    const statusEmojis = {
      ON_TRACK: '🟢',
      AT_RISK: '🟡',
      BLOCKED: '🔴',
      COMPLETED: '✅'
    };

    const checkinBlocks = checkins.map(checkin => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${statusEmojis[checkin.status]} ${checkin.user.name}*\n${checkin.progressNotes || 'No notes'}\n${checkin.blockers.length > 0 ? `*Blockers:* ${checkin.blockers.join(', ')}` : ''}`
      }
    }));

    const message = {
      text: `📊 Daily Check-in Summary`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Daily Check-in Summary'
          }
        },
        ...checkinBlocks
      ]
    };

    return await this.sendSlackMessage(ventureId, message);
  }

  /**
   * Verify Slack workspace access
   * @param {string} botToken - Bot token
   * @returns {Promise<Object>} Verification result
   */
  async verifySlackWorkspace(botToken) {
    try {
      const response = await axios.get(`${this.slackApiUrl}/auth.test`, {
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.data.ok,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Encrypt bot token for storage
   * @param {string} token - Bot token
   * @returns {string} Encrypted token
   */
  encryptToken(token) {
    // Simple base64 encoding for now - in production, use proper encryption
    return Buffer.from(token).toString('base64');
  }

  /**
   * Decrypt bot token for use
   * @param {string} encryptedToken - Encrypted token
   * @returns {string} Decrypted token
   */
  decryptToken(encryptedToken) {
    // Simple base64 decoding for now - in production, use proper decryption
    return Buffer.from(encryptedToken, 'base64').toString('utf-8');
  }

  /**
   * Get venture Slack integration
   * @param {string} ventureId - Venture ID
   * @returns {Promise<Object>} Integration data
   */
  async getVentureSlackIntegration(ventureId) {
    try {
      const integration = await prisma.ventureSlackIntegration.findUnique({
        where: { ventureId }
      });

      if (!integration) {
        return {
          success: false,
          error: { code: 'INTEGRATION_NOT_FOUND', message: 'Slack integration not found' }
        };
      }

      return {
        success: true,
        data: integration,
        message: 'Integration retrieved successfully'
      };
    } catch (error) {
      console.error('Slack integration fetch error:', error);
      return {
        success: false,
        error: { code: 'INTEGRATION_FETCH_ERROR', message: error.message }
      };
    }
  }

  /**
   * Update Slack integration status
   * @param {string} ventureId - Venture ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Update result
   */
  async updateIntegrationStatus(ventureId, status) {
    try {
      const integration = await prisma.ventureSlackIntegration.update({
        where: { ventureId },
        data: { status, lastSyncAt: new Date() }
      });

      return {
        success: true,
        data: integration,
        message: 'Integration status updated successfully'
      };
    } catch (error) {
      console.error('Slack integration update error:', error);
      return {
        success: false,
        error: { code: 'INTEGRATION_UPDATE_ERROR', message: error.message }
      };
    }
  }
}

module.exports = new SlackIntegrationService();
