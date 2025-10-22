/**
 * EXPORT MODAL
 * Modal component for data export with format selection and date range
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ExportService, type AnalyticsData } from '@/services/exportService';
import { useDashboardStore } from '@/store/dashboardStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  dataType: 'analytics' | 'pages' | 'visitors' | 'goals' | 'sources';
  title: string;
}

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FormatSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const FormatOption = styled.div<{ selected: boolean }>`
  padding: 16px;
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ selected, theme }) => 
    selected ? theme.colors.primary + '10' : theme.colors.background};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const FormatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary + '20'};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const FormatLabel = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const FormatDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  dataType,
  title,
}) => {
  const { dateRange, setDateRange } = useDashboardStore();
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('pdf');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: dateRange.startDate.split('T')[0],
    endDate: dateRange.endDate.split('T')[0],
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportDateRange = {
        startDate: new Date(customDateRange.startDate).toISOString(),
        endDate: new Date(customDateRange.endDate).toISOString(),
      };

      const filename = `${dataType}_report_${customDateRange.startDate}_to_${customDateRange.endDate}`;

      switch (dataType) {
        case 'analytics':
          await ExportService.exportAnalyticsReport(data as AnalyticsData, {
            filename,
            dateRange: exportDateRange,
            format: exportFormat,
          });
          break;
        case 'pages':
          await ExportService.exportPageAnalytics(data, {
            filename,
            dateRange: exportDateRange,
            format: exportFormat,
          });
          break;
        case 'visitors':
          await ExportService.exportVisitorInsights(data, {
            filename,
            dateRange: exportDateRange,
            format: exportFormat,
          });
          break;
        case 'goals':
          await ExportService.exportConversionGoals(data, {
            filename,
            dateRange: exportDateRange,
            format: exportFormat,
          });
          break;
        case 'sources':
          await ExportService.exportTrafficSources(data, {
            filename,
            dateRange: exportDateRange,
            format: exportFormat,
          });
          break;
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <h2>
                <Download size={24} />
                Export {title}
              </h2>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Date Range</Label>
              <InputGroup>
                <DateInput
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                />
                <span>to</span>
                <DateInput
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label>Export Format</Label>
              <FormatSelector>
                <FormatOption
                  selected={exportFormat === 'pdf'}
                  onClick={() => setExportFormat('pdf')}
                >
                  <FormatIcon>
                    <FileText size={20} />
                  </FormatIcon>
                  <FormatLabel>PDF Report</FormatLabel>
                  <FormatDescription>Professional formatted report with charts and insights</FormatDescription>
                </FormatOption>

                <FormatOption
                  selected={exportFormat === 'csv'}
                  onClick={() => setExportFormat('csv')}
                >
                  <FormatIcon>
                    <FileSpreadsheet size={20} />
                  </FormatIcon>
                  <FormatLabel>CSV Data</FormatLabel>
                  <FormatDescription>Raw data for analysis in Excel or other tools</FormatDescription>
                </FormatOption>
              </FormatSelector>
            </FormGroup>

            <ActionButtons>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download size={16} />
                Export {exportFormat.toUpperCase()}
              </Button>
            </ActionButtons>

            {isExporting && (
              <LoadingOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <LoadingSpinner />
                  <div style={{ marginTop: '16px', color: '#666' }}>
                    Generating {exportFormat.toUpperCase()} report...
                  </div>
                </div>
              </LoadingOverlay>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};
