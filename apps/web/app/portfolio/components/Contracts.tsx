'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { apiCall } from '../../utils/api';

interface ContractOffer {
  id: string;
  projectId: string;
  projectName: string;
  equityPercentage: number;
  contributionType: string;
  effortRequired: number;
  impactExpected: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
  terms: string;
  deliverables: string[];
  milestones: string[];
}

interface ContractStats {
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  totalEquityOffered: number;
  averageEquityPerOffer: number;
}

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractOffer[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractOffer | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    fetchContractsData();
  }, []);

  const fetchContractsData = async () => {
    try {
      const contractsResponse = await apiCall(`/smart-contracts/offers/user/${user?.id}`);
      if (contractsResponse && Array.isArray(contractsResponse)) {
        const userContracts = contractsResponse.map((contract: any) => ({
          id: contract.id,
          projectId: contract.projectId,
          projectName: contract.project?.name || 'Unknown Project',
          equityPercentage: contract.equityPercentage || 0,
          contributionType: contract.contributionType || 'GENERAL',
          effortRequired: contract.effortRequired || 0,
          impactExpected: contract.impactExpected || 0,
          status: contract.status || 'PENDING',
          expiresAt: new Date(contract.expiresAt || contract.createdAt),
          createdAt: new Date(contract.createdAt),
          terms: contract.terms || 'Standard terms',
          deliverables: contract.deliverables || [],
          milestones: contract.milestones || []
        }));
        setContracts(userContracts);
        calculateStats(userContracts);
      }
    } catch (error) {
      console.error('Error fetching contracts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contractList: ContractOffer[]) => {
    const totalOffers = contractList.length;
    const pendingOffers = contractList.filter(c => c.status === 'PENDING').length;
    const acceptedOffers = contractList.filter(c => c.status === 'ACCEPTED').length;
    const totalEquityOffered = contractList.reduce((sum, c) => sum + c.equityPercentage, 0);
    const averageEquityPerOffer = totalOffers > 0 ? totalEquityOffered / totalOffers : 0;

    setStats({
      totalOffers,
      pendingOffers,
      acceptedOffers,
      totalEquityOffered,
      averageEquityPerOffer
    });
  };

  const handleContractAction = async (contractId: string, action: 'accept' | 'reject', reason?: string) => {
    try {
      const response = await apiCall(`/smart-contracts/offers/${contractId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });

      if (response) {
        // Refresh contracts data
        fetchContractsData();
        setSelectedContract(null);
      }
    } catch (error) {
      console.error(`Error ${action}ing contract:`, error);
    }
  };

  const getFilteredContracts = () => {
    if (filter === 'all') return contracts;
    return contracts.filter(contract => contract.status.toUpperCase() === filter.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ACCEPTED': return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      case 'EXPIRED': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getContributionTypeIcon = (type: string) => {
    switch (type) {
      case 'CODE': return '💻';
      case 'DESIGN': return '🎨';
      case 'MARKETING': return '📢';
      case 'OPS': return '⚙️';
      case 'SALES': return '💰';
      case 'COMPLIANCE': return '📋';
      default: return '🛠️';
    }
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt;
  };

  if (loading) {
    return (
      <div className="contracts-container">
        <div className="loading-spinner"></div>
        <p>Loading contracts...</p>
      </div>
    );
  }

  return (
    <div className="contracts-container">
      {/* Contracts Summary */}
      <div className="contracts-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <h3>Total Offers</h3>
            <p className="stat-number">{stats?.totalOffers || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>Pending</h3>
            <p className="stat-number">{stats?.pendingOffers || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>Accepted</h3>
            <p className="stat-number">{stats?.acceptedOffers || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>Total Equity Offered</h3>
            <p className="stat-number">{stats?.totalEquityOffered?.toFixed(1) || '0'}%</p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Contracts ({contracts.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({contracts.filter(c => c.status === 'PENDING').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({contracts.filter(c => c.status === 'ACCEPTED').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({contracts.filter(c => c.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="contracts-grid">
        {getFilteredContracts().length > 0 ? (
          getFilteredContracts().map((contract) => (
            <div key={contract.id} className="contract-card" onClick={() => setSelectedContract(contract)}>
              <div className="contract-header">
                <div className="contract-title">
                  <span className="contribution-icon">{getContributionTypeIcon(contract.contributionType)}</span>
                  <h3>{contract.projectName}</h3>
                </div>
                <div className="contract-status">
                  <span className={`status-badge ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
              </div>

              <div className="contract-details">
                <div className="detail-row">
                  <span className="detail-label">Equity Offered:</span>
                  <span className="detail-value highlight">{contract.equityPercentage}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contribution Type:</span>
                  <span className="detail-value">{contract.contributionType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Effort Required:</span>
                  <span className="detail-value">{contract.effortRequired}/5</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expected Impact:</span>
                  <span className="detail-value">{contract.impactExpected}/5</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expires:</span>
                  <span className={`detail-value ${isExpired(contract.expiresAt) ? 'expired' : ''}`}>
                    {contract.expiresAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {contract.status === 'PENDING' && !isExpired(contract.expiresAt) && (
                <div className="contract-actions">
                  <button 
                    className="action-btn accept"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContractAction(contract.id, 'accept');
                    }}
                  >
                    Accept Offer
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContractAction(contract.id, 'reject');
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-contracts">
            <p>No contracts found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedContract.projectName}</h2>
              <button className="close-btn" onClick={() => setSelectedContract(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Contract Details</h3>
                <div className="modal-details">
                  <div className="modal-detail">
                    <span className="detail-label">Equity Percentage:</span>
                    <span className="detail-value">{selectedContract.equityPercentage}%</span>
                  </div>
                  <div className="modal-detail">
                    <span className="detail-label">Contribution Type:</span>
                    <span className="detail-value">{selectedContract.contributionType}</span>
                  </div>
                  <div className="modal-detail">
                    <span className="detail-label">Effort Required:</span>
                    <span className="detail-value">{selectedContract.effortRequired}/5</span>
                  </div>
                  <div className="modal-detail">
                    <span className="detail-label">Expected Impact:</span>
                    <span className="detail-value">{selectedContract.impactExpected}/5</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Terms & Conditions</h3>
                <p>{selectedContract.terms}</p>
              </div>

              {selectedContract.deliverables.length > 0 && (
                <div className="modal-section">
                  <h3>Deliverables</h3>
                  <ul>
                    {selectedContract.deliverables.map((deliverable, index) => (
                      <li key={index}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedContract.milestones.length > 0 && (
                <div className="modal-section">
                  <h3>Milestones</h3>
                  <ul>
                    {selectedContract.milestones.map((milestone, index) => (
                      <li key={index}>{milestone}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedContract.status === 'PENDING' && !isExpired(selectedContract.expiresAt) && (
                <div className="modal-actions">
                  <button 
                    className="action-btn accept"
                    onClick={() => handleContractAction(selectedContract.id, 'accept')}
                  >
                    Accept Offer
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => handleContractAction(selectedContract.id, 'reject')}
                  >
                    Decline Offer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
