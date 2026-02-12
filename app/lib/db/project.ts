import { prisma } from './prisma'
import type { Project, ProjectStatus } from '@prisma/client'

/**
 * Helper to calculate estimated completion date based on timeline
 */
export function calculateEstimatedCompletion(timeline: string): Date {
  const now = new Date()
  switch (timeline) {
    case 'ASAP':
      return new Date(now.setMonth(now.getMonth() + 1))
    case '1-3 months':
      return new Date(now.setMonth(now.getMonth() + 3))
    case '3-6 months':
      return new Date(now.setMonth(now.getMonth() + 6))
    case '6+ months':
      return new Date(now.setMonth(now.getMonth() + 12))
    default:
      return new Date(now.setMonth(now.getMonth() + 3)) // Default to 3 months
  }
}

/**
 * Generate project name from questionnaire data
 */
export function generateProjectName(companyName: string, services: string[]): string {
  if (services.length === 0) {
    return `${companyName} - Consultation`
  }
  return `${companyName} - ${services[0]}`
}

/**
 * Generate project description from questionnaire data
 */
export function generateProjectDescription(data: {
  interestedServices: string[]
  budget: string
  companySize: string
  automationTechnologies: string[]
  additionalInfo: string
  otherTechnology?: string
}): string {
  const parts = []

  if (data.interestedServices.length > 0) {
    parts.push(`Services: ${data.interestedServices.join(', ')}`)
  }

  if (data.budget) {
    parts.push(`Budget: ${data.budget}`)
  }

  if (data.companySize) {
    parts.push(`Company Size: ${data.companySize}`)
  }

  if (data.automationTechnologies.length > 0) {
    parts.push(`Technologies: ${data.automationTechnologies.join(', ')}`)
  }

  if (data.otherTechnology) {
    parts.push(`Other Technology: ${data.otherTechnology}`)
  }

  if (data.additionalInfo) {
    parts.push(`\nAdditional Information:\n${data.additionalInfo}`)
  }

  return parts.join('\n')
}

/**
 * Create initial project from questionnaire submission
 */
export async function createProjectFromQuestionnaire(
  userId: string,
  questionnaireData: {
    companyName: string
    interestedServices: string[]
    automationTechnologies: string[]
    otherTechnology?: string
    budget: string
    companySize: string
    timeline: string
    additionalInfo: string
  }
): Promise<Project> {
  const name = generateProjectName(
    questionnaireData.companyName,
    questionnaireData.interestedServices
  )

  const description = generateProjectDescription({
    interestedServices: questionnaireData.interestedServices,
    budget: questionnaireData.budget,
    companySize: questionnaireData.companySize,
    automationTechnologies: questionnaireData.automationTechnologies,
    additionalInfo: questionnaireData.additionalInfo,
    otherTechnology: questionnaireData.otherTechnology,
  })

  const estimatedCompletion = calculateEstimatedCompletion(questionnaireData.timeline)

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status: 'PLANNING',
      progress: 0,
      startDate: new Date(),
      estimatedCompletion,
      assignedTeam: [],
      userId,
    },
  })

  return project
}
