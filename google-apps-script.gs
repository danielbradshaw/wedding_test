// ============================================================================
// Wedding Photo Upload - Google Apps Script Backend (Anne & Jesse)
// ============================================================================
// Step 1: Create a Google Drive folder (e.g., "Anne & Jesse Wedding Memories 2026")
// Step 2: Open folder, copy Folder ID from browser URL bar (e.g. drive.google.com/drive/folders/<FOLDER_ID>)
// Step 3: Go to https://script.google.com/ -> New project
// Step 4: Paste this entire code into Code.gs
// Step 5: Replace FOLDER_ID below with your Google Drive Folder ID
// Step 6: Deploy -> New deployment -> Select type: "Web app"
//         - Execute as: "Me (your account)"
//         - Who has access: "Anyone"
// Step 7: Click "Deploy", grant permissions, and copy the Web App URL!

const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    let targetFolder = DriveApp.getFolderById(FOLDER_ID);
    
    // Extract file extension (.jpg, .png, .mov, etc.)
    let ext = '.jpg';
    if (data.fileName && data.fileName.lastIndexOf('.') !== -1) {
      ext = data.fileName.substring(data.fileName.lastIndexOf('.'));
    }
    
    // Format timestamp (YYYY-MM-DD_HH-MM-SS)
    const timestamp = getFormattedTimestamp();
    
    // Format guest name or default to 'Guest'
    let guestStr = 'Guest';
    if (data.guestName && data.guestName.trim() !== '') {
      guestStr = data.guestName.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
    }
    
    // Formatted Filename Example: Aunt_Maria_2026-09-12_18-45-30.jpg
    const finalFileName = `${guestStr}_${timestamp}${ext}`;
    
    const contentType = data.mimeType || 'image/jpeg';
    const decodedData = Utilities.base64Decode(data.fileData);
    const blob = Utilities.newBlob(decodedData, contentType, finalFileName);
    
    const file = targetFolder.createFile(blob);
    
    // Save metadata details in File Description
    let descriptionParts = [];
    if (data.guestName) descriptionParts.push('Uploaded by: ' + data.guestName);
    if (data.message) descriptionParts.push('Wish/Note: ' + data.message);
    descriptionParts.push('Uploaded at: ' + new Date().toLocaleString());
    file.setDescription(descriptionParts.join(' | '));
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      fileName: finalFileName,
      fileId: file.getId(),
      fileUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Anne & Jesse Wedding Upload Endpoint is Active!'
  })).setMimeType(ContentService.MimeType.JSON);
}
