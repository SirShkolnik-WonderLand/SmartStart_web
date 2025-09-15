'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Download, FileText, Gavel, DollarSign, Lock } from 'lucide-react'
import { apiService } from '@/lib/api-unified'

interface LegalTemplate {
  id: string
  name: string
  type: string
  version: string
  rbacLevel: string
  isRequired: boolean
  jurisdiction: string
  enforcementMechanisms: string[]
  liquidatedDamages: number
  survivalPeriod: number
  content: string
}

interface ComplianceStatus {
  userId: string
  rbacLevel: string
  totalRequired: number
  completed: number
  pending: number
  violations: number
  isCompliant: boolean
  missingDocuments: Array<{
    documentId: string
    documentName: string
    documentType: string
  }>
  violationDetails: Array<{
    documentId: string
    documentName: string
    violationType: string
  }>
}

interface IPTheftDetection {
  id: string
  userId: string
  ventureId?: string
  projectId?: string
  detectionType: string
  evidence: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'DETECTED' | 'INVESTIGATING' | 'CONFIRMED' | 'RESOLVED'
  damages: number
  detectedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface RevenueViolation {
  id: string
  userId: string
  ventureId: string
  projectId?: string
  violationType: string
  amount: number
  liquidatedDamages: number
  evidence: string
  status: string
  detectedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface LegalStatus {
  userId: string
  compliance: ComplianceStatus
  ipTheft: {
    totalDetections: number
    criticalDetections: number
    totalDamages: number
  }
  revenueViolations: {
    totalViolations: number
    totalAmount: number
    totalDamages: number
  }
  enforcement: {
    totalActions: number
    pendingActions: number
    executedActions: number
  }
  riskLevel: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export function EnhancedLegalProtectionsDashboard() {
  const [templates, setTemplates] = useState<LegalTemplate[]>([])
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null)
  const [ipTheftDetections, setIpTheftDetections] = useState<IPTheftDetection[]>([])
  const [revenueViolations, setRevenueViolations] = useState<RevenueViolation[]>([])
  const [legalStatus, setLegalStatus] = useState<LegalStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        templatesResult,
        complianceResult,
        ipTheftResult,
        revenueResult,
        statusResult
      ] = await Promise.all([
        apiService.getLegalTemplates(),
        apiService.getUserCompliance('current', 'MEMBER'),
        apiService.getIPTheftDetections(),
        apiService.getRevenueViolations(),
        apiService.getLegalStatus('current')
      ])

      if (templatesResult.success) setTemplates(templatesResult.data)
      if (complianceResult.success) setCompliance(complianceResult.data)
      if (ipTheftResult.success) setIpTheftDetections(ipTheftResult.data)
      if (revenueResult.success) setRevenueViolations(revenueResult.data)
      if (statusResult.success) setLegalStatus(statusResult.data)

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load legal protection data')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-blue-600 bg-blue-100'
      case 'MINIMAL': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading legal protection data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Error</AlertTitle>
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Legal Protections</h1>
          <p className="text-gray-600 mt-1">Comprehensive worldwide IP protection and enforcement system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <Badge className={getRiskLevelColor(legalStatus?.riskLevel || 'MINIMAL')}>
            {legalStatus?.riskLevel || 'MINIMAL'} RISK
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {legalStatus && legalStatus.riskLevel === 'CRITICAL' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">CRITICAL LEGAL RISK DETECTED</AlertTitle>
          <AlertDescription className="text-red-700">
            Immediate action required. Multiple violations detected with significant legal exposure.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {compliance ? `${compliance.completed}/${compliance.totalRequired}` : '0/0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {compliance?.isCompliant ? 'Fully Compliant' : 'Non-Compliant'}
            </p>
            {compliance && (
              <Progress 
                value={(compliance.completed / compliance.totalRequired) * 100} 
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP Theft Detections</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{legalStatus?.ipTheft.totalDetections || 0}</div>
            <p className="text-xs text-muted-foreground">
              {legalStatus?.ipTheft.criticalDetections || 0} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Violations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{legalStatus?.revenueViolations.totalViolations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(legalStatus?.revenueViolations.totalAmount || 0)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Damages</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((legalStatus?.ipTheft.totalDamages || 0) + (legalStatus?.revenueViolations.totalDamages || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Liquidated damages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="templates">Legal Templates</TabsTrigger>
          <TabsTrigger value="ip-theft">IP Theft</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Violations</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
        </TabsList>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal Compliance Status</CardTitle>
              <CardDescription>
                Track your compliance with critical legal protection agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {compliance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Compliance</span>
                    <Badge className={compliance.isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {compliance.isCompliant ? 'Compliant' : 'Non-Compliant'}
                    </Badge>
                  </div>
                  
                  <Progress value={(compliance.completed / compliance.totalRequired) * 100} className="w-full" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{compliance.completed}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{compliance.pending}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{compliance.violations}</div>
                      <div className="text-sm text-gray-600">Violations</div>
                    </div>
                  </div>

                  {compliance.missingDocuments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Missing Documents</h4>
                      <div className="space-y-2">
                        {compliance.missingDocuments.map((doc) => (
                          <div key={doc.documentId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm">{doc.documentName}</span>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Sign
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No compliance data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Legal Protection Templates</CardTitle>
              <CardDescription>
                Essential legal documents for worldwide IP protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{template.type}</Badge>
                        {template.isRequired && (
                          <Badge className="bg-red-100 text-red-800">Required</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Version {template.version} • {template.jurisdiction} • {template.survivalPeriod} years
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Liquidated Damages: {formatCurrency(template.liquidatedDamages)}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Theft Tab */}
        <TabsContent value="ip-theft" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Theft Detections</CardTitle>
              <CardDescription>
                Monitor and track intellectual property theft violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ipTheftDetections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Damages</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipTheftDetections.map((detection) => (
                      <TableRow key={detection.id}>
                        <TableCell>{detection.user?.name || 'Unknown'}</TableCell>
                        <TableCell>{detection.detectionType}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(detection.severity)}>
                            {detection.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{detection.status}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(detection.damages)}</TableCell>
                        <TableCell>{new Date(detection.detectedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No IP theft detections found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Violations Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sharing Violations</CardTitle>
              <CardDescription>
                Track revenue sharing circumvention attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueViolations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Damages</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueViolations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell>{violation.user?.name || 'Unknown'}</TableCell>
                        <TableCell>{violation.violationType}</TableCell>
                        <TableCell>{formatCurrency(violation.amount)}</TableCell>
                        <TableCell>{formatCurrency(violation.liquidatedDamages)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{violation.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(violation.detectedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No revenue violations found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enforcement Tab */}
        <TabsContent value="enforcement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enforcement Actions</CardTitle>
              <CardDescription>
                Monitor enforcement actions and legal proceedings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {legalStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{legalStatus.enforcement.totalActions}</div>
                      <div className="text-sm text-gray-600">Total Actions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{legalStatus.enforcement.pendingActions}</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{legalStatus.enforcement.executedActions}</div>
                      <div className="text-sm text-gray-600">Executed</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Available Enforcement Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Lock className="h-4 w-4 mr-2" />
                        Immediate Suspension
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Gavel className="h-4 w-4 mr-2" />
                        Legal Action
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Asset Seizure
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Injunctive Relief
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No enforcement data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedLegalProtectionsDashboard
