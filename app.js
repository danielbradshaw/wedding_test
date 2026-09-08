// Wedding Photo Share - Frontend JavaScript App

let selectedFiles = [];
// Deployed Google Apps Script Endpoint URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNQmi1WGONsgrPbMwM_R7qvJLcAANH50MsEVk5ulZAQ_f299fnb9f9Tq4kdOmL27Qykg/exec';

let qrCodeInstance = null;
let currentStream = null;
let currentFacingMode = 'environment'; // 'user' or 'environment'

document.addEventListener('DOMContentLoaded', () => {
  setupDropzone();
  initQRCode();
});

// Navigation Tabs
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

  if (tabName === 'upload') {
    document.getElementById('tab-upload-btn').classList.add('active');
    document.getElementById('tab-upload').classList.remove('hidden');
  } else {
    document.getElementById('tab-qr-btn').classList.add('active');
    document.getElementById('tab-qr').classList.remove('hidden');
    generateQRCode();
  }
}

// Helper: Formatted Timestamp (YYYY-MM-DD_HH-MM-SS)
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

// Drag and Drop & File Input Setup
function setupDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files);
    handleFilesAdded(files);
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFilesAdded(files);
    fileInput.value = ''; // Reset input
  });
}

function handleFilesAdded(files) {
  const validFiles = files.filter(file => {
    const isImageOrVideo = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isImageOrVideo) {
      alert(`Skipped unsupported file format: ${file.name}`);
    }
    return isImageOrVideo;
  });

  selectedFiles.push(...validFiles);
  updateQueueUI();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateQueueUI();
}

function clearQueue() {
  selectedFiles = [];
  updateQueueUI();
}

function updateQueueUI() {
  const queueSection = document.getElementById('file-queue-section');
  const previewGrid = document.getElementById('file-preview-grid');
  const fileCountSpan = document.getElementById('file-count');

  if (selectedFiles.length === 0) {
    queueSection.classList.add('hidden');
    return;
  }

  queueSection.classList.remove('hidden');
  fileCountSpan.textContent = selectedFiles.length;
  previewGrid.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const previewCard = document.createElement('div');
    previewCard.className = 'preview-card';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'preview-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => removeFile(index);

    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      previewCard.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      previewCard.appendChild(video);
    }

    previewCard.appendChild(removeBtn);
    previewGrid.appendChild(previewCard);
  });
}

// LIVE CAMERA FUNCTIONS
async function openCameraModal() {
  const modal = document.getElementById('camera-modal');
  modal.classList.remove('hidden');
  await startCameraStream();
}

async function startCameraStream() {
  stopCameraStream();
  const video = document.getElementById('camera-video');

  try {
    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (err) {
    console.error('Camera access error:', err);
    alert('Unable to access camera. Please make sure camera permissions are allowed in your browser settings.');
    closeCameraModal();
  }
}

function stopCameraStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

function switchCamera() {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  startCameraStream();
}

function closeCameraModal() {
  stopCameraStream();
  document.getElementById('camera-modal').classList.add('hidden');
}

function takeCameraSnapshot() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      const guestNameInput = document.getElementById('guest-name').value.trim();
      const guestStr = guestNameInput ? guestNameInput.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') : 'Guest';
      const timestamp = getFormattedTimestamp();
      
      // Formatted Filename: e.g. Aunt_Maria_2026-09-12_18-45-30.jpg
      const filename = `${guestStr}_${timestamp}.jpg`;
      
      const file = new File([blob], filename, { type: 'image/jpeg' });
      handleFilesAdded([file]);
      closeCameraModal();
    }
  }, 'image/jpeg', 0.92);
}

// Upload Process
async function startUpload() {
  if (selectedFiles.length === 0) return;

  const guestName = document.getElementById('guest-name').value.trim();
  const guestMessage = document.getElementById('guest-message').value.trim();

  document.getElementById('file-queue-section').classList.add('hidden');
  document.getElementById('dropzone').classList.add('hidden');
  document.getElementById('progress-container').classList.remove('hidden');

  const totalFiles = selectedFiles.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = selectedFiles[i];
    const percent = Math.round(((i + 1) / totalFiles) * 100);
    
    updateProgress(`Uploading file ${i + 1} of ${totalFiles}: ${file.name}...`, percent);

    try {
      await uploadFileToAppsScript(file, guestName, guestMessage);
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err);
      alert(`Error uploading ${file.name}. Continuing with remaining files.`);
    }
  }

  // Complete!
  document.getElementById('progress-container').classList.add('hidden');
  document.getElementById('success-banner').classList.remove('hidden');

  // Trigger celebration confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function uploadFileToAppsScript(file, guestName, guestMessage) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result.split(',')[1];
      
      // Format custom filename with guest name & timestamp if not already set
      const timestamp = getFormattedTimestamp();
      const guestStr = guestName ? guestName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') : 'Guest';
      
      let ext = '.jpg';
      if (file.name && file.name.lastIndexOf('.') !== -1) {
        ext = file.name.substring(file.name.lastIndexOf('.'));
      }

      let formattedFileName = file.name;
      if (!file.name.includes(guestStr) || !file.name.includes('_202')) {
        formattedFileName = `${guestStr}_${timestamp}${ext}`;
      }

      const payload = {
        fileName: formattedFileName,
        mimeType: file.type,
        fileData: base64Data,
        guestName: guestName,
        message: guestMessage
      };

      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });

        const result = await response.json();
        if (result.status === 'success') {
          resolve(result);
        } else {
          reject(new Error(result.message || 'Apps Script returned error status'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

function updateProgress(message, percent) {
  document.getElementById('progress-status').textContent = message;
  document.getElementById('progress-percent').textContent = `${percent}%`;
  document.getElementById('progress-bar-fill').style.width = `${percent}%`;
}

function resetUploadForm() {
  selectedFiles = [];
  document.getElementById('file-input').value = '';
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-message').value = '';
  
  document.getElementById('success-banner').classList.add('hidden');
  document.getElementById('dropzone').classList.remove('hidden');
  updateQueueUI();
}

// QR Code Generation
function initQRCode() {
  const container = document.getElementById('qrcode-container');
  if (!container) return;

  const currentUrl = window.location.href;
  document.getElementById('website-url-input').value = currentUrl.startsWith('file:') 
    ? 'https://anne-and-jesse-wedding.vercel.app' 
    : currentUrl;
}

function generateQRCode() {
  const container = document.getElementById('qrcode-container');
  if (!container) return;
  container.innerHTML = '';

  const url = document.getElementById('website-url-input').value.trim() || 'https://anne-and-jesse-wedding.vercel.app';

  if (typeof QRCode !== 'undefined') {
    qrCodeInstance = new QRCode(container, {
      text: url,
      width: 180,
      height: 180,
      colorDark : "#1E2823",
      colorLight : "#FFFFFF",
      correctLevel : QRCode.CorrectLevel.H
    });
  }
}

function updateCardText() {
  const val = document.getElementById('hashtag-input').value.trim();
  document.querySelector('.card-hashtag').textContent = val;
}

function downloadQRCode() {
  const img = document.querySelector('#qrcode-container img');
  if (img && img.src) {
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'anne-and-jesse-wedding-qr.png';
    a.click();
  } else {
    alert('QR Code image generating... try again in a second!');
  }
}
