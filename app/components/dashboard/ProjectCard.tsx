'use client'

import React from 'react'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'in_progress' | 'review' | 'completed'
  progress: number // 0-100
  startDate: string
  estimatedCompletion?: string
  lastUpdated: string
  assignedTeam?: string[]
}

interface ProjectCardProps {
  project: Project
}

const statusColors = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
}

const statusLabels = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div
      className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-gray-400">{project.description}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[project.status]
          }`}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400 font-medium">Progress</span>
          <span className="text-red-700 font-bold">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Started</span>
          <span className="text-gray-900 font-medium">{project.startDate}</span>
        </div>
        {project.estimatedCompletion && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Est. Completion</span>
            <span className="text-gray-900 font-medium">{project.estimatedCompletion}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Last Updated</span>
          <span className="text-gray-900 font-medium">{project.lastUpdated}</span>
        </div>
      </div>

      {/* Team Members */}
      {project.assignedTeam && project.assignedTeam.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <span className="text-sm text-gray-400 font-medium">Team:</span>
          <div className="flex items-center gap-2 mt-2">
            {project.assignedTeam.map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center text-xs font-semibold"
                title={member}
              >
                {member
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
