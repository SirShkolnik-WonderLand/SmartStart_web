'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  RotateCcw, 
  Check, 
  X, 
  FileText, 
  Clock,
  Shield,
  AlertCircle
} from 'lucide-react'

interface DigitalSignatureCanvasProps {
  documentId: string
  documentType: string
  onSignatureComplete: (signatureData: string) => void
  onCancel: () => void
  isReadOnly?: boolean
  existingSignature?: string
}

export default function DigitalSignatureCanvas({
  documentId,
  documentType,
  onSignatureComplete,
  onCancel,
  isReadOnly = false,
  existingSignature
}: DigitalSignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!existingSignature)
  const [signatureData, setSignatureData] = useState(existingSignature || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (existingSignature) {
      loadExistingSignature()
    }
  }, [existingSignature])

  const loadExistingSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !existingSignature) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = existingSignature
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    setHasSignature(true)
  }

  const clearSignature = () => {
    if (isReadOnly) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSignatureData('')
  }

  const saveSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/png')
    setSignatureData(dataURL)
    setIsSubmitting(true)

    try {
      await onSignatureComplete(dataURL)
    } catch (error) {
      console.error('Error saving signature:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `signature-${documentType}-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      'PPA': 'bg-blue-100 text-blue-800',
      'MNDA': 'bg-green-100 text-green-800',
      'CONTRACT': 'bg-purple-100 text-purple-800',
      'AGREEMENT': 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Digital Signature</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getDocumentTypeColor(documentType)}>
                    {documentType}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Document ID: {documentId}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                Secure & Encrypted
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Signature Canvas */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {isReadOnly ? 'Signature Preview' : 'Sign Here'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isReadOnly 
                  ? 'This document has been digitally signed'
                  : 'Use your mouse or touchpad to sign in the box below'
                }
              </p>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                className="border border-gray-300 rounded-lg cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ 
                  cursor: isReadOnly ? 'default' : 'crosshair',
                  opacity: isReadOnly ? 0.8 : 1
                }}
              />
              
              {!hasSignature && !isReadOnly && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">✍️</div>
                    <p className="text-lg">Sign here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Controls */}
            {!isReadOnly && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    disabled={!hasSignature}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSignature}
                    disabled={!hasSignature}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={saveSignature}
                    disabled={!hasSignature || isSubmitting}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Sign Document'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Signature Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Signature Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Document Type:</span>
                <span className="ml-2">{documentType}</span>
              </div>
              <div>
                <span className="font-medium">Signature Method:</span>
                <span className="ml-2">Digital Drawing</span>
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>
                <span className="ml-2">{new Date().toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">
                  {hasSignature ? (
                    <Badge className="bg-green-100 text-green-800">
                      Signed
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Legal Notice</p>
                <p>
                  By signing this document, you acknowledge that this digital signature 
                  has the same legal effect as a handwritten signature and is legally binding.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
