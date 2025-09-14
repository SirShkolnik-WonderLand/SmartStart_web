'use client'

import { VentureCreationProvider, VentureCreationForm } from './creation'
import { Venture } from '@/lib/api-comprehensive'

interface MultiStepVentureFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (venture: Venture) => void
  initialData?: Partial<Venture>
}

export default function MultiStepVentureForm({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialData 
}: MultiStepVentureFormProps) {
  return (
    <VentureCreationProvider onSuccess={onSuccess} onClose={onClose}>
      <VentureCreationForm
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </VentureCreationProvider>
  )
}
