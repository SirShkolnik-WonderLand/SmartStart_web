'use client'

import { useState } from 'react'
import { Users, Search, Plus, X, CheckCircle } from 'lucide-react'
import { VentureCreationData } from '../types/venture-creation.types'
import { PROFESSIONS, SKILLS } from '../constants/venture-options'

interface TeamSkillsStepProps {
  data: VentureCreationData
  updateData: (updates: Partial<VentureCreationData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function TeamSkillsStep({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}: TeamSkillsStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfessions, setShowProfessions] = useState(false)
  const [showSkills, setShowSkills] = useState(false)

  const addLookingFor = (profession: string) => {
    if (!data.lookingFor.includes(profession)) {
      updateData({ lookingFor: [...data.lookingFor, profession] })
    }
    setShowProfessions(false)
    setSearchTerm('')
  }

  const removeLookingFor = (profession: string) => {
    updateData({ 
      lookingFor: data.lookingFor.filter(p => p !== profession) 
    })
  }

  const addRequiredSkill = (skill: string) => {
    if (!data.requiredSkills.includes(skill)) {
      updateData({ requiredSkills: [...data.requiredSkills, skill] })
    }
    setShowSkills(false)
    setSearchTerm('')
  }

  const removeRequiredSkill = (skill: string) => {
    updateData({ 
      requiredSkills: data.requiredSkills.filter(s => s !== skill) 
    })
  }

  const addPreferredSkill = (skill: string) => {
    if (!data.preferredSkills.includes(skill)) {
      updateData({ preferredSkills: [...data.preferredSkills, skill] })
    }
    setShowSkills(false)
    setSearchTerm('')
  }

  const removePreferredSkill = (skill: string) => {
    updateData({ 
      preferredSkills: data.preferredSkills.filter(s => s !== skill) 
    })
  }

  const filteredProfessions = PROFESSIONS.filter(profession =>
    profession.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSkills = SKILLS.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Team & Skills</h2>
        <p className="text-foreground-muted">What roles and skills do you need for your venture?</p>
      </div>

      <div className="space-y-8">
        {/* Looking For */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Roles You're Looking For
          </label>
          
          {/* Selected Roles */}
          <div className="flex flex-wrap gap-2 mb-3">
            {data.lookingFor.map((profession) => (
              <span
                key={profession}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {profession}
                <button
                  onClick={() => removeLookingFor(profession)}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Role */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowProfessions(true)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setShowProfessions(!showProfessions)}
                className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown */}
            {showProfessions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredProfessions.map((profession) => (
                  <button
                    key={profession}
                    onClick={() => addLookingFor(profession)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{profession}</span>
                    {data.lookingFor.includes(profession) && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Required Skills
          </label>
          
          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {data.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeRequiredSkill(skill)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Required Skill */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for required skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSkills(true)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setShowSkills(!showSkills)}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown */}
            {showSkills && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addRequiredSkill(skill)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{skill}</span>
                    {data.requiredSkills.includes(skill) && (
                      <CheckCircle className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preferred Skills */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Preferred Skills (Nice to Have)
          </label>
          
          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {data.preferredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removePreferredSkill(skill)}
                  className="hover:text-blue-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Preferred Skill */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for preferred skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSkills(true)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setShowSkills(!showSkills)}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 text-foreground-muted hover:text-foreground transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
