import { google } from 'googleapis'
import { Readable } from 'stream'

/**
 * Google Drive Integration Utility Library
 * Provides functions for file upload, download, and management using Google Drive API
 */

// Initialize Google Drive client with service account authentication
export function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({ version: 'v3', auth })
}

/**
 * Get or create a customer-specific folder in Google Drive
 * Organizes files by unique company ID (prevents conflicts with same company names)
 * @param companyId - Unique company identifier
 * @param companyName - Company name for display in Google Drive
 * @returns Google Drive folder ID
 */
export async function getCustomerFolder(companyId: string, companyName: string): Promise<string> {
  const drive = getDriveClient()
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

  if (!parentFolderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID environment variable is not set')
  }

  // Use companyId for unique identification, with company name for readability
  const folderName = `${companyName} (${companyId})`

  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!
  }

  // Create new folder if doesn't exist
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  })

  return folder.data.id!
}

/**
 * Get or create a subfolder within a customer's Google Drive folder
 * @param customerFolderId - Customer's folder ID in Google Drive
 * @param subfolderName - Name of the subfolder (e.g., "Billing", "Technical")
 * @returns Google Drive subfolder ID
 */
export async function getSubfolder(customerFolderId: string, subfolderName: string): Promise<string> {
  const drive = getDriveClient()

  // Search for existing subfolder
  const response = await drive.files.list({
    q: `name='${subfolderName}' and '${customerFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!
  }

  // Create new subfolder if doesn't exist
  const folder = await drive.files.create({
    requestBody: {
      name: subfolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [customerFolderId],
    },
    fields: 'id',
  })

  return folder.data.id!
}

/**
 * Upload a file to a customer's Google Drive folder
 * @param companyId - Unique company identifier
 * @param companyName - Company name of the customer
 * @param fileName - Name of the file to upload
 * @param fileBuffer - File content as Buffer
 * @param mimeType - MIME type of the file
 * @param subfolderName - Optional subfolder name (e.g., "Billing", "Technical")
 * @returns Object containing fileId and webViewLink
 */
export async function uploadFile(
  companyId: string,
  companyName: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  subfolderName?: string
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient()
  let folderId = await getCustomerFolder(companyId, companyName)

  // If subfolder is specified, get or create it
  if (subfolderName) {
    folderId = await getSubfolder(folderId, subfolderName)
  }

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: 'id, webViewLink',
  })

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
  }
}

/**
 * Generate a download link for a file in Google Drive
 * Returns webContentLink for direct download
 * @param fileId - Google Drive file ID
 * @returns Download URL
 */
export async function getDownloadLink(fileId: string): Promise<string> {
  const drive = getDriveClient()

  try {
    // Get file metadata with webContentLink
    const response = await drive.files.get({
      fileId,
      fields: 'webContentLink, webViewLink',
    })

    // Return webContentLink for direct download, fallback to webViewLink
    return response.data.webContentLink || response.data.webViewLink || ''
  } catch (error) {
    console.error('Error getting download link:', error)
    throw new Error('Failed to generate download link from Google Drive')
  }
}

/**
 * Delete a file from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDriveClient()

  try {
    await drive.files.delete({ fileId })
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error)
    throw new Error('Failed to delete file from Google Drive')
  }
}

/**
 * Get file metadata from Google Drive
 * @param fileId - Google Drive file ID
 * @returns File metadata including name, size, mimeType
 */
export async function getFileMetadata(fileId: string) {
  const drive = getDriveClient()

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, size, mimeType, createdTime, modifiedTime',
    })

    return response.data
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw new Error('Failed to get file metadata from Google Drive')
  }
}
