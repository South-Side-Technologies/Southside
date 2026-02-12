import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Local file storage utility
 * Saves files to disk organized by company folder structure
 */

const STORAGE_ROOT = join(process.cwd(), 'public', 'uploads')

/**
 * Get or create a customer folder path
 * @param companyId - Unique company identifier
 * @param companyName - Company name for display
 * @returns Path to company folder
 */
export async function getCustomerFolder(companyId: string, companyName: string): Promise<string> {
  const folderPath = join(STORAGE_ROOT, `${companyName}-${companyId}`)

  // Ensure folder exists
  if (!existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true })
  }

  return folderPath
}

/**
 * Get or create a subfolder within a customer's folder
 * @param customerFolderPath - Path to customer folder
 * @param subfolderName - Name of the subfolder (e.g., "Billing", "Technical")
 * @returns Path to subfolder
 */
export async function getSubfolder(customerFolderPath: string, subfolderName: string): Promise<string> {
  const subfolderPath = join(customerFolderPath, subfolderName)

  // Ensure subfolder exists
  if (!existsSync(subfolderPath)) {
    await mkdir(subfolderPath, { recursive: true })
  }

  return subfolderPath
}

/**
 * Save a file to local storage
 * @param companyId - Unique company identifier
 * @param companyName - Company name of the customer
 * @param fileName - Name of the file to save
 * @param fileBuffer - File content as Buffer
 * @param subfolderName - Optional subfolder name (e.g., "Billing", "Technical")
 * @returns Object containing fileName and downloadPath (relative URL path)
 */
export async function uploadFile(
  companyId: string,
  companyName: string,
  fileName: string,
  fileBuffer: Buffer,
  subfolderName?: string
): Promise<{ fileName: string; downloadPath: string }> {
  let folderPath = await getCustomerFolder(companyId, companyName)

  // If subfolder is specified, get or create it
  if (subfolderName) {
    folderPath = await getSubfolder(folderPath, subfolderName)
  }

  // Generate unique filename to avoid collisions
  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}-${fileName}`
  const filePath = join(folderPath, uniqueFileName)

  // Save file to disk
  await writeFile(filePath, fileBuffer)

  // Return relative URL path for downloading
  const relativePath = `${companyName}-${companyId}/${subfolderName ? `${subfolderName}/` : ''}${uniqueFileName}`
  const downloadPath = `/uploads/${relativePath}`

  return {
    fileName: uniqueFileName,
    downloadPath,
  }
}

/**
 * Get download link for a file
 * @param downloadPath - The download path stored in database
 * @returns Download URL
 */
export function getDownloadLink(downloadPath: string): string {
  return downloadPath
}
