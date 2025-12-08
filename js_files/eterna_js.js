// ETERNA - JavaScript Functionality

// ==================== GLOBAL UTILITIES ====================
/**
 * Constructs the proper media path based on environment and file path
 */
function getMediaPath(filePath) {
  if (!filePath) return '';
  
  // If already a full URL or starts with http, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If path starts with ../, it's already relative from html_files, return as is
  if (filePath.startsWith('../')) {
    return filePath;
  }
  
  // If path starts with /, it's an absolute server path, return as is
  if (filePath.startsWith('/')) {
    return filePath;
  }
  
  // Otherwise, it's a relative path from project root (e.g., "uploads/capsules/7/file.jpg")
  // Add ../ to make it relative from html_files directory
  return '../' + filePath;
}

/**
 * Closes the edit modal with a fade-out animation
 */
function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) {
    // Add fade out animation
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease-in-out';
    
    // Remove after animation completes
    setTimeout(() => {
      modal.remove();
    }, 200);
  }
  
  // Close any open SweetAlert dialogs
  if (typeof Swal !== 'undefined') {
    Swal.close();
  }
}

// Make the function available globally
window.closeEditModal = closeEditModal;

// ==================== INITIALIZATION ====================
// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  initializeSlideshow();
  loadUserData();
});

// ==================== INITIALIZATION ====================
function initializeApp() {
  // Check if user is logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateNavForLoggedInUser(currentUser);
  }
  
  // Initialize memory grid if on view_capsule page
  if (document.getElementById('memoriesGrid')) {
    loadMemories();
  }
  
  // Initialize dashboard if on dashboard page
  if (document.getElementById('dashboard')) {
    loadDashboardData();
  }
  
  // Load latest memory if on home page
  if (document.getElementById('latestMemoryPreview')) {
    console.log('Found latestMemoryPreview element, calling loadLatestMemory');
    loadLatestMemory();
    
    // Add click event listener to the panel
    const latestMemoryPanel = document.getElementById('latestMemoryPanel');
    if (latestMemoryPanel) {
      console.log('✓ latestMemoryPanel found, adding click listener');
      latestMemoryPanel.addEventListener('click', function(e) {
        console.log('========== PANEL CLICKED ==========');
        console.log('Event target:', e.target);
        console.log('Event target ID:', e.target.id);
        console.log('Event target className:', e.target.className);
        console.log('Current target:', e.currentTarget);
        console.log('Calling viewLatestMemory...');
        viewLatestMemory();
      });
    } else {
      console.log('✗ latestMemoryPanel NOT found');
    }
  }
  
  // Load timeline if on timeline page
  if (document.getElementById('timelineContainer')) {
    loadTimeline();
  }
  
  // Load stats if on stats page
  if (document.querySelector('.stat-number')) {
    loadStats();
  }
}

// ==================== USER AUTHENTICATION ====================
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPass').value;
  
  try {
    const response = await fetch('../php_files/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Set current user in localStorage
      localStorage.setItem('eternaCurrentUser', JSON.stringify(result.user));
      
      // Show SweetAlert success popup
      Swal.fire({
        icon: 'success',
        title: `Welcome back, ${result.user.firstName}!`,
        text: 'Redirecting you to home page...',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      }).then(() => {
        // Redirect to home page
        window.location.href = 'home.html';
      });
    } else {
      // Show error popup
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: result.message,
        confirmButtonColor: '#d4af37'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Login failed. Please try again.',
      confirmButtonColor: '#d4af37'
    });
  }
}

async function handleSignup(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPass').value;
  const confirmPass = document.getElementById('confirmPass').value;
  
  // Client-side validation
  if (password !== confirmPass) {
    Swal.fire({
      icon: 'error',
      title: 'Passwords do not match',
      text: 'Please make sure both passwords are the same.',
      confirmButtonColor: '#d4af37'
    });
    return;
  }
  
  if (password.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Password too short',
      text: 'Password must be at least 6 characters long.',
      confirmButtonColor: '#d4af37'
    });
    return;
  }
  
  try {
    const response = await fetch('../php_files/signup.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show SweetAlert success popup
      Swal.fire({
        icon: 'success',
        title: 'Signup Successful!',
        text: `Welcome to ETERNA, ${firstName}! Redirecting you to login...`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      }).then(() => {
        // Redirect to login page
        window.location.href = 'login.html';
      });
    } else {
      // Show error popup
      Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: result.message,
        confirmButtonColor: '#d4af37'
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Signup failed. Please try again.',
      confirmButtonColor: '#d4af37'
    });
  }
}

function handleLogout() {
  Swal.fire({
    title: 'Log Out?',
    text: 'Are you sure you want to log out?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d4af37',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, log out',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('eternaCurrentUser');
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully.',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      }).then(() => {
        window.location.href = 'home.html';
      });
    }
  });
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('eternaCurrentUser') || 'null');
  } catch (error) {
    console.warn('localStorage access blocked:', error);
    return null;
  }
}

function updateNavForLoggedInUser(user) {
  const navAuth = document.querySelector('.nav-auth');
  const navLinks = document.querySelector('.nav-links');
  
  if (navAuth && user) {
    navAuth.innerHTML = `
      <a href="profile.html"><i class="fas fa-user-circle"></i> ${user.firstName}</a>
      <a href="#" onclick="handleLogout(); return false;"><i class="fas fa-sign-out-alt"></i> Log out</a>
    `;
  }
  
  // Show dashboard link when logged in
  if (navLinks && user) {
    const dashboardLink = navLinks.querySelector('a[href="dashboard.html"]');
    if (dashboardLink) {
      dashboardLink.style.display = 'inline-block';
    }
  }
}

// ==================== CAPSULE MANAGEMENT ====================
// ==================== IMPROVED MEDIA UPLOAD WITH MULTIPLE FILES ====================

// Store all selected files globally
let selectedFiles = [];

// Toggle future date picker visibility
function toggleFutureDatePicker() {
  const privacy = document.getElementById('memPrivacy').value;
  const futureDateGroup = document.getElementById('futureDateGroup');
  const unlockDateTime = document.getElementById('unlockDateTime');
  
  if (privacy === 'future') {
    futureDateGroup.style.display = 'block';
    unlockDateTime.required = true;
    // Set minimum date to current date/time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    unlockDateTime.min = now.toISOString().slice(0, 16);
  } else {
    futureDateGroup.style.display = 'none';
    unlockDateTime.required = false;
  }
}

// Make function globally available
window.toggleFutureDatePicker = toggleFutureDatePicker;

function previewMedia(event) {
  const previewContainer = document.getElementById('mediaPreview');
  const newFiles = Array.from(event.target.files);
  
  // Add new files to existing files array
  selectedFiles = [...selectedFiles, ...newFiles];
  
  // Clear and rebuild the entire preview
  previewContainer.innerHTML = '';
  
  // Preview all files
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const previewItem = document.createElement('div');
      previewItem.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #ddd;';
      previewItem.setAttribute('data-file-index', index);
      
      if (file.type.startsWith('image/')) {
        previewItem.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 150px; object-fit: cover;">
          <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">
            <i class="fas fa-image"></i>
          </div>
        `;
      } else if (file.type.startsWith('video/')) {
        previewItem.innerHTML = `
          <video src="${e.target.result}" style="width: 100%; height: 150px; object-fit: cover;"></video>
          <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">
            <i class="fas fa-video"></i>
          </div>
        `;
      } else if (file.type.startsWith('audio/')) {
        previewItem.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="fas fa-music" style="font-size: 3rem; color: white;"></i>
          </div>
          <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">
            <i class="fas fa-volume-up"></i>
          </div>
        `;
      }
      
      // Add remove button
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.style.cssText = 'position: absolute; top: 5px; left: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;';
      removeBtn.onclick = () => removeFile(index);
      previewItem.appendChild(removeBtn);
      
      // Add file name
      const fileName = document.createElement('div');
      fileName.style.cssText = 'padding: 0.5rem; background: #f8f9fa; font-size: 0.75rem; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      fileName.textContent = file.name;
      previewItem.appendChild(fileName);
      
      previewContainer.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
  });
  
  // Clear the file input so the same file can be added again if needed
  event.target.value = '';
}

function removeFile(index) {
  // Remove file from array
  selectedFiles.splice(index, 1);
  
  // Rebuild preview
  const previewContainer = document.getElementById('mediaPreview');
  previewContainer.innerHTML = '';
  
  // Re-trigger preview for all remaining files
  selectedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewItem = document.createElement('div');
      previewItem.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #ddd;';
      previewItem.setAttribute('data-file-index', idx);
      
      if (file.type.startsWith('image/')) {
        previewItem.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 150px; object-fit: cover;">
          <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">
            <i class="fas fa-image"></i>
          </div>
        `;
      } else if (file.type.startsWith('video/')) {
        previewItem.innerHTML = `
          <video src="${e.target.result}" style="width: 100%; height: 150px; object-fit: cover;"></video>
          <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">
            <i class="fas fa-video"></i>
          </div>
        `;
      } else if (file.type.startsWith('audio/')) {
        previewItem.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="fas fa-music" style="font-size: 3rem; color: white;"></i>
          </div>
          <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">
            <i class="fas fa-volume-up"></i>
          </div>
        `;
      }
      
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.style.cssText = 'position: absolute; top: 5px; left: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;';
      removeBtn.onclick = () => removeFile(idx);
      previewItem.appendChild(removeBtn);
      
      const fileName = document.createElement('div');
      fileName.style.cssText = 'padding: 0.5rem; background: #f8f9fa; font-size: 0.75rem; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      fileName.textContent = file.name;
      previewItem.appendChild(fileName);
      
      previewContainer.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
  });
}

async function handleCreateMemory(event) {
  event.preventDefault();
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    Swal.fire({
      icon: 'error',
      title: 'Not Logged In',
      text: 'Please log in to create capsules',
      confirmButtonColor: '#d4af37'
    }).then(() => {
      window.location.href = 'login.html';
    });
    return;
  }
  
  const title = document.getElementById('memTitle').value;
  const date = document.getElementById('memDate').value;
  const location = document.getElementById('memLocation').value;
  const text = document.getElementById('memText').value;
  const privacy = document.getElementById('memPrivacy').value;
  const unlockDateTime = document.getElementById('unlockDateTime')?.value;
  
  // Validate future date if selected
  if (privacy === 'future' && !unlockDateTime) {
    Swal.fire({
      icon: 'error',
      title: 'Unlock Date Required',
      text: 'Please set when this future message should be unlocked',
      confirmButtonColor: '#d4af37'
    });
    return;
  }
  
  // Show loading
  Swal.fire({
    title: 'Creating your capsule...',
    html: 'Please wait while we preserve your memory',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // First, create the capsule
    console.log('Sending capsule creation request...');
    const response = await fetch('../php_files/create_capsule.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        title,
        date,
        location,
        text,
        privacy,
        unlock_date_time: unlockDateTime || null
      })
    });
    
    console.log('Response received:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Result:', result);
    
    if (result.success) {
      const capsuleId = result.capsule_id;
      
      // Upload all selected files (using the global selectedFiles array)
      if (selectedFiles.length > 0) {
        await uploadMedia(capsuleId, selectedFiles);
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Capsule Created!',
        html: `<div style="text-align: center;">
          <i class="fas fa-capsules" style="font-size: 3rem; color: #d4af37; margin-bottom: 1rem;"></i>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Your memory has been preserved</p>
          <p style="color: #666;">"${title}" is now safely stored with ${selectedFiles.length} media file(s)</p>
        </div>`,
        showConfirmButton: true,
        confirmButtonText: 'View My Capsules',
        confirmButtonColor: '#d4af37',
        showCancelButton: true,
        cancelButtonText: 'Create Another',
        cancelButtonColor: '#6c757d'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = 'view_capsule.html';
        } else {
          // Reset form and clear selected files
          document.getElementById('createMemoryForm').reset();
          document.getElementById('mediaPreview').innerHTML = '';
          selectedFiles = []; // Clear the files array
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Capsule',
        text: result.message,
        confirmButtonColor: '#d4af37'
      });
    }
  } catch (error) {
    console.error('Create capsule error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to create capsule. Please try again.',
      confirmButtonColor: '#d4af37'
    });
  }
}


async function uploadMedia(capsuleId, files) {
  const formData = new FormData();
  formData.append('capsule_id', capsuleId);
  
  // Add all files from the selectedFiles array
  files.forEach((file) => {
    formData.append('media[]', file);
  });
  
  try {
    const response = await fetch('../php_files/upload_media.php', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('Media upload failed:', result.message);
      if (result.errors && result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
      }
    } else {
      console.log('Upload successful:', result.message);
      console.log('Uploaded files:', result.files);
    }
    
    return result;
  } catch (error) {
    console.error('Media upload error:', error);
    return { success: false, message: error.message };
  }
}
// ==================== LOAD MEMORIES FUNCTION ====================
let allCapsules = []; // Store all capsules globally for filtering
let currentFilter = 'all'; // Track current filter

async function loadMemories(filter = 'all') {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const memoriesGrid = document.getElementById('memoriesGrid');
  if (!memoriesGrid) return;
  
  try {
    // Only fetch from server if we don't have the data yet
    if (allCapsules.length === 0 || filter === 'all') {
      const response = await fetch(`../php_files/get_capsules.php?user_id=${currentUser.id}`);
      const result = await response.json();
      
      if (!result.success) {
        showNotification('Failed to load capsules', 'error');
        return;
      }
      
      allCapsules = result.capsules || [];
    }
    
    // Apply filter
    let filteredCapsules = allCapsules;
    if (filter !== 'all') {
      filteredCapsules = allCapsules.filter(c => c.capsule_type === filter);
    }
    
    if (filteredCapsules.length === 0) {
      const filterText = filter === 'all' ? 'capsules' : `${filter} capsules`;
      memoriesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <i class="fas fa-inbox" style="font-size: 4rem; color: var(--gold); opacity: 0.5;"></i>
          <p style="margin-top: 1rem; color: #666;">No ${filterText} yet.</p>
        </div>
      `;
      return;
    }
    
    memoriesGrid.innerHTML = filteredCapsules.map(capsule => createMemoryCard(capsule)).join('');
    
    // Use event delegation for better performance
    initializeCardActions();
    
  } catch (error) {
    console.error('Load capsules error:', error);
    showNotification('Failed to load capsules', 'error');
  }
}

// Filter memories by type
function filterMemories(type) {
  currentFilter = type;
  
  // Update active button
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Find and activate the clicked button
  event.target.classList.add('active');
  
  // Load memories with filter
  loadMemories(type);
}

function createMemoryCard(capsule) {
  const privacyBadge = capsule.capsule_type === 'private' ? 'badge-private' : 
                       capsule.capsule_type === 'shared' ? 'badge-shared' : 'badge-future';
  const privacyLabel = capsule.capsule_type.charAt(0).toUpperCase() + capsule.capsule_type.slice(1);
  
  // Check if capsule is a locked future message
  const isLocked = capsule.capsule_type === 'future' && capsule.open_date && new Date(capsule.open_date) > new Date();
  
  // Check if capsule has media - use the last uploaded media for preview
  let cardImageContent = '';
  
  if (isLocked) {
    // Show locked overlay for future capsules
    cardImageContent = `
      <div style="width: 100%; height: 100%; background: linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(144, 135, 196, 0.3) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
        <i class="fas fa-lock" style="font-size: 3rem; color: var(--gold); margin-bottom: 0.5rem;"></i>
        <p style="font-weight: 600; color: var(--deep-blue);">Locked</p>
        <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">Unlocks on</p>
        <p style="font-size: 0.9rem; font-weight: 600; color: var(--gold);">${formatDateTime(capsule.open_date)}</p>
      </div>
    `;
  } else if (capsule.media && capsule.media.length > 0) {
    // Get the last media item (most recently uploaded)
    const lastMedia = capsule.media[capsule.media.length - 1];
    const mediaPath = getMediaPath(lastMedia.file_path);
    
    if (lastMedia.media_type === 'image') {
      cardImageContent = `<img src="${mediaPath}" alt="${capsule.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image card-icon\\'></i>';">`;
    } else if (lastMedia.media_type === 'video') {
      cardImageContent = `<video style="width: 100%; height: 100%; object-fit: cover;" preload="metadata">
                           <source src="${mediaPath}#t=0.5" type="${lastMedia.mime_type || 'video/mp4'}">
                         </video>
                         <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; color: white; opacity: 0.8; pointer-events: none;"></i>`;
    } else if (lastMedia.media_type === 'audio') {
      cardImageContent = `<i class="fas fa-music card-icon"></i>`;
    } else {
      cardImageContent = `<i class="fas fa-file card-icon"></i>`;
    }
  } else {
    // Fallback to icon if no media
    const icon = capsule.location_name?.toLowerCase().includes('mountain') ? 'fa-mountain' :
                 capsule.title.toLowerCase().includes('birthday') ? 'fa-birthday-cake' :
                 capsule.title.toLowerCase().includes('concert') ? 'fa-music' :
                 'fa-camera';
    cardImageContent = `<i class="fas ${icon} card-icon"></i>`;
  }
  
  const clickHandler = isLocked ? `onclick="showLockedMessage('${capsule.title}', '${capsule.open_date}')"` : `onclick="openCapsuleDetail(${capsule.capsule_id})"`;
  
  return `
    <div class="memory-card ${isLocked ? 'locked-capsule' : ''}" data-memory-id="${capsule.capsule_id}" ${clickHandler} style="cursor: pointer;">
      <div class="card-img">
        ${cardImageContent}
      </div>
      <div class="card-content">
        <h4>${capsule.title} ${isLocked ? '<i class="fas fa-lock" style="font-size: 0.9rem; color: var(--gold); margin-left: 0.5rem;"></i>' : ''}</h4>
        <p class="card-date"><i class="fas fa-calendar"></i> ${formatDate(capsule.date_of_memory)}</p>
        <p class="card-desc">${isLocked ? 'This message is locked until the unlock date' : (capsule.story_text || '').substring(0, 80)}${(!isLocked && (capsule.story_text || '').length > 80) ? '...' : ''}</p>
        <span class="badge ${privacyBadge}">${privacyLabel}</span>
      </div>
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="action-btn ${isLocked ? 'disabled' : 'edit-btn'}" title="${isLocked ? 'Cannot edit locked capsule' : 'Edit'}" data-capsule-id="${capsule.capsule_id}" ${isLocked ? 'disabled' : ''}>
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn share-btn" title="Share" data-capsule-id="${capsule.capsule_id}">
          <i class="fas fa-share-alt"></i>
        </button>
        <button class="action-btn delete-btn" title="Delete" data-capsule-id="${capsule.capsule_id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// ==================== EVENT DELEGATION FOR CARD ACTIONS ====================
function initializeCardActions() {
  const memoriesGrid = document.getElementById('memoriesGrid');
  if (!memoriesGrid) return;
  
  // Use event delegation for better performance with dynamic content
  memoriesGrid.addEventListener('click', function(e) {
    const target = e.target;
    
    // Find the closest button element (in case they click the icon inside the button)
    const button = target.closest('.action-btn');
    if (!button) return;
    
    const card = button.closest('.memory-card');
    if (!card) return;
    
    const capsuleId = parseInt(card.dataset.memoryId);
    
    e.preventDefault();
    e.stopPropagation();
    
    if (button.classList.contains('edit-btn')) {
      console.log('Edit button clicked for capsule:', capsuleId);
      openEditModal(capsuleId);
    } 
    else if (button.classList.contains('share-btn')) {
      console.log('Share button clicked for capsule:', capsuleId);
      shareCapsule(capsuleId);
    }
    else if (button.classList.contains('delete-btn')) {
      console.log('Delete button clicked for capsule:', capsuleId);
      deleteMemory(capsuleId);
    }
  });
}

// ==================== EDIT CAPSULE MODAL ====================
// ==================== EDIT CAPSULE MODAL ====================
// Add this global array to track media to delete
// Add this global array to track media to delete
async function openEditModal(capsuleId) {
  console.log('Opening edit modal for capsule:', capsuleId);
  
  // Reset media tracking arrays
  mediaToDelete = [];
  editSelectedFiles = [];
  
  try {
    // Show loading state
    const loadingSwal = Swal.fire({
      title: 'Loading...',
      text: 'Fetching capsule data',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Fetch capsule data
    const response = await fetch(`../php_files/get_capsule_for_edit.php?capsule_id=${capsuleId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from server');
    }
    
    await loadingSwal.close();
    
    if (!result.success) {
      showNotification(result.message || 'Failed to load capsule', 'error');
      return;
    }
    
    const capsule = result.capsule;
    console.log('Capsule data loaded:', capsule);
    
    // Create edit modal with media management
    const modalHTML = `
      <div id="editModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div class="modal-content" style="background: white; border-radius: 12px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
          
          <!-- Modal Header -->
          <div class="modal-header" style="padding: 1.5rem 2rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; color: #333;">
              <i class="fas fa-edit" style="color: #d4af37;"></i> Edit Capsule
            </h2>
            <button class="close-modal" onclick="window.closeEditModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
          </div>
          
          <!-- Edit Form -->
          <div class="modal-body" style="padding: 2rem;">
            <form id="editCapsuleForm">
              
              <!-- Title -->
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="editTitle" style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">Title *</label>
                <input type="text" id="editTitle" value="${capsule.title || ''}" required 
                       placeholder="Give your memory a title" 
                       style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
              </div>
              
              <!-- Description -->
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="editDescription" style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">Description</label>
                <textarea id="editDescription" rows="3" 
                          placeholder="Describe your memory..." 
                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical;">${capsule.description || ''}</textarea>
              </div>
              
              <!-- Date and Location Row -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                  <label for="editDate" style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">Date of Memory</label>
                  <input type="date" id="editDate" value="${capsule.date_of_memory || ''}" 
                         style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                </div>
                
                <div class="form-group">
                  <label for="editLocation" style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">Location</label>
                  <input type="text" id="editLocation" value="${capsule.location_name || ''}" 
                         placeholder="Where did this happen?" 
                         style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                </div>
              </div>
              
              <!-- Story -->
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="editText" style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">Your Story</label>
                <textarea id="editText" rows="6" 
                          placeholder="Tell us about this memory..." 
                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical;">${capsule.story_text || ''}</textarea>
              </div>
              
              <!-- Privacy -->
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="editPrivacy" style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">Privacy</label>
                <select id="editPrivacy" 
                        style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                  <option value="private" ${capsule.capsule_type === 'private' ? 'selected' : ''}>Private</option>
                  <option value="shared" ${capsule.capsule_type === 'shared' ? 'selected' : ''}>Shared</option>
                  <option value="future" ${capsule.capsule_type === 'future' ? 'selected' : ''}>Future</option>
                </select>
              </div>
              
              <!-- IMPROVED MEDIA SECTION -->
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333;">
                  Media Files
                </label>
                
                <!-- Existing Media -->
                <div id="existingMediaContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                  ${capsule.media && capsule.media.length > 0 ? capsule.media.map(media => {
                    const displayPath = getMediaPath(media.file_path);
                    
                    console.log('Media path:', displayPath); // For debugging
                    
                    return `
                    <div class="existing-media-item" data-media-id="${media.media_id}" style="position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #f5f5f5; border: 2px solid #ddd;">
                      ${media.media_type === 'image' 
                        ? `<img src="${displayPath}" 
                                alt="${media.file_name}" 
                                onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E';"
                                style="width: 100%; height: 100%; object-fit: cover;">`
                        : media.media_type === 'video'
                        ? `<video src="${displayPath}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                           <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; color: white; opacity: 0.8;"></i>`
                        : media.media_type === 'audio'
                        ? `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-music" style="font-size: 2.5rem; color: white;"></i>
                           </div>`
                        : `<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                            <i class="fas fa-file" style="font-size: 2rem; color: #999;"></i>
                           </div>`
                      }
                      <button type="button" class="remove-existing-media" data-media-id="${media.media_id}" 
                              style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.9); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 10;">
                        <i class="fas fa-times"></i>
                      </button>
                      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 0.25rem; font-size: 0.7rem; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${media.file_name}
                      </div>
                    </div>
                  `}).join('') : '<p style="color: #999; font-style: italic; grid-column: 1/-1;">No media files yet</p>'}
                </div>
                
                <!-- Add New Media Button -->
                <div style="margin-top: 1rem;">
                  <input type="file" id="editMediaInput" multiple accept="image/*,video/*,audio/*" style="display: none;">
                  <button type="button" onclick="document.getElementById('editMediaInput').click()" 
                          style="width: 100%; padding: 0.75rem; border: 2px dashed #d4af37; background: transparent; border-radius: 6px; cursor: pointer; color: #d4af37; font-weight: 500; transition: all 0.3s;">
                    <i class="fas fa-plus"></i> Add More Media
                  </button>
                </div>
                
                <!-- New Media Preview -->
                <div id="editMediaPreview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
                </div>
              </div>
              
              <!-- Form Actions -->
              <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
                <button type="button" onclick="window.closeEditModal()" 
                        style="padding: 0.75rem 1.5rem; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; color: #666; font-size: 1rem;">
                  Cancel
                </button>
                <button type="submit" 
                        style="padding: 0.75rem 1.5rem; background: #d4af37; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                  <i class="fas fa-save"></i> Update Capsule
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('editModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize media handlers
    initializeEditMediaHandlers(capsuleId);
    
    // Add form submit handler
    const form = document.getElementById('editCapsuleForm');
    form.addEventListener('submit', function(e) {
      handleEditCapsule(e, capsuleId);
    });
    
    // Initialize modal close on outside click
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeEditModal();
        }
      });
    }
    
  } catch (error) {
    console.error('Open edit modal error:', error);
    Swal.close();
    
    Swal.fire({
      icon: 'error',
      title: 'Failed to Load Capsule',
      html: `
        <div style="text-align: left;">
          <p>There was an error loading the capsule data:</p>
          <p style="color: #666; font-size: 0.9rem; background: #f8f9fa; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem;">
            ${error.message}
          </p>
        </div>
      `,
      confirmButtonColor: '#d4af37'
    });
  }
}

// Initialize media handlers for edit modal
function initializeEditMediaHandlers(capsuleId) {
  // Handle file input change
  const mediaInput = document.getElementById('editMediaInput');
  if (mediaInput) {
    mediaInput.addEventListener('change', previewEditMedia);
  }
  
  // Handle removing existing media
  document.querySelectorAll('.remove-existing-media').forEach(btn => {
    btn.addEventListener('click', function() {
      const mediaId = parseInt(this.dataset.mediaId);
      removeExistingMedia(mediaId);
    });
  });
}

// Preview new media files in edit modal
function previewEditMedia(event) {
  const previewContainer = document.getElementById('editMediaPreview');
  const newFiles = Array.from(event.target.files);
  
  // Add to editSelectedFiles array
  editSelectedFiles = [...editSelectedFiles, ...newFiles];
  
  // Clear and rebuild preview
  previewContainer.innerHTML = '';
  
  editSelectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const previewItem = document.createElement('div');
      previewItem.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #4CAF50; aspect-ratio: 1;';
      previewItem.setAttribute('data-file-index', index);
      
      if (file.type.startsWith('image/')) {
        previewItem.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 5px; left: 5px; background: rgba(76, 175, 80, 0.9); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
            NEW
          </div>
        `;
      } else if (file.type.startsWith('video/')) {
        previewItem.innerHTML = `
          <video src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;"></video>
          <div style="position: absolute; top: 5px; left: 5px; background: rgba(76, 175, 80, 0.9); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
            NEW
          </div>
          <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; color: white; opacity: 0.8;"></i>
        `;
      } else if (file.type.startsWith('audio/')) {
        previewItem.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="fas fa-music" style="font-size: 2.5rem; color: white;"></i>
          </div>
          <div style="position: absolute; top: 5px; left: 5px; background: rgba(76, 175, 80, 0.9); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
            NEW
          </div>
        `;
      }
      
      // Add remove button
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.type = 'button';
      removeBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.9); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
      removeBtn.onclick = () => removeEditFile(index);
      previewItem.appendChild(removeBtn);
      
      // Add file name
      const fileName = document.createElement('div');
      fileName.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 0.25rem; font-size: 0.7rem; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      fileName.textContent = file.name;
      previewItem.appendChild(fileName);
      
      previewContainer.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
  });
  
  event.target.value = '';
}

// Remove file from new uploads
function removeEditFile(index) {
  editSelectedFiles.splice(index, 1);
  
  // Rebuild preview
  const event = { target: { files: editSelectedFiles } };
  const previewContainer = document.getElementById('editMediaPreview');
  previewContainer.innerHTML = '';
  
  editSelectedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Same preview code as above
      const previewItem = document.createElement('div');
      previewItem.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #4CAF50; aspect-ratio: 1;';
      
      if (file.type.startsWith('image/')) {
        previewItem.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else if (file.type.startsWith('video/')) {
        previewItem.innerHTML = `<video src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;"></video>`;
      } else if (file.type.startsWith('audio/')) {
        previewItem.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="fas fa-music" style="font-size: 2.5rem; color: white;"></i></div>`;
      }
      
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.type = 'button';
      removeBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.9); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;';
      removeBtn.onclick = () => removeEditFile(idx);
      previewItem.appendChild(removeBtn);
      
      previewContainer.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
  });
}

// Remove existing media (mark for deletion)
function removeExistingMedia(mediaId) {
  // Add to deletion array
  if (!mediaToDelete.includes(mediaId)) {
    mediaToDelete.push(mediaId);
  }
  
  // Remove from UI
  const mediaItem = document.querySelector(`.existing-media-item[data-media-id="${mediaId}"]`);
  if (mediaItem) {
    mediaItem.style.opacity = '0.5';
    mediaItem.style.transform = 'scale(0.9)';
    mediaItem.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      mediaItem.remove();
      
      // Check if no existing media left
      const container = document.getElementById('existingMediaContainer');
      if (container && container.querySelectorAll('.existing-media-item').length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic; grid-column: 1/-1;">No media files yet</p>';
      }
    }, 300);
  }
  
  console.log('Marked for deletion:', mediaToDelete);
}

// Updated handleEditCapsule with media handling
async function handleEditCapsule(event, capsuleId) {
  event.preventDefault();
  
  const title = document.getElementById('editTitle').value;
  const description = document.getElementById('editDescription').value;
  const date = document.getElementById('editDate').value;
  const location = document.getElementById('editLocation').value;
  const text = document.getElementById('editText').value;
  const privacy = document.getElementById('editPrivacy').value;
  
  // Show loading
  Swal.fire({
    title: 'Updating...',
    html: 'Saving changes to your capsule',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  
  try {
    // 1. Update capsule data
    const updateResponse = await fetch('../php_files/edit_capsule.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        capsule_id: capsuleId,
        title: title,
        description: description,
        date_of_memory: date,
        location_name: location,
        story_text: text,
        capsule_type: privacy
      })
    });
    
    const updateResult = await updateResponse.json();
    
    if (!updateResult.success) {
      throw new Error(updateResult.message);
    }
    
    // 2. Delete marked media files
    if (mediaToDelete.length > 0) {
      const deleteResponse = await fetch('../php_files/delete_media.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_ids: mediaToDelete
        })
      });
      
      const deleteResult = await deleteResponse.json();
      console.log('Delete media result:', deleteResult);
    }
    
    // 3. Upload new media files
    if (editSelectedFiles.length > 0) {
      const uploadResult = await uploadMedia(capsuleId, editSelectedFiles);
      console.log('Upload result:', uploadResult);
    }
    
    await Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Your capsule has been updated successfully',
      confirmButtonColor: '#d4af37'
    });
    
    // Reset tracking arrays
    mediaToDelete = [];
    editSelectedFiles = [];
    
    closeEditModal();
    loadMemories();
    
  } catch (error) {
    console.error('Edit error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.message,
      confirmButtonColor: '#d4af37'
    });
  }
}
// ==================== SHARE CAPSULE FUNCTION ====================
async function shareCapsule(capsuleId) {
  try {
    const response = await fetch(`../php_files/get_capsule.php?id=${capsuleId}`);
    const capsule = await response.json();
    
    if (!capsule) {
      throw new Error('Capsule not found');
    }

    const result = await Swal.fire({
      title: 'Share Capsule',
      html: `
        <div class="share-dialog">
          <p>Share <strong>${capsule.title}</strong> with others</p>
          <div class="form-group">
            <label for="shareEmail">Email Address</label>
            <input type="email" id="shareEmail" class="swal2-input" placeholder="Enter email address">
          </div>
          <div class="form-group">
            <label for="shareMessage">Message (optional)</label>
            <textarea id="shareMessage" class="swal2-textarea" placeholder="Add a personal message"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Send',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const email = document.getElementById('shareEmail').value;
        const message = document.getElementById('shareMessage').value;
        
        if (!email) {
          Swal.showValidationMessage('Please enter an email address');
          return false;
        }
        
        try {
          const shareResponse = await fetch('../php_files/share_capsule.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              capsule_id: capsuleId,
              email: email,
              message: message
            })
          });
          
          return shareResponse.json();
        } catch (error) {
          Swal.showValidationMessage('Failed to share capsule');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      if (result.value.success) {
        Swal.fire(
          'Shared!',
          `"${capsule.title}" has been shared successfully.`,
          'success'
        );
      } else {
        throw new Error(result.value.message || 'Failed to share capsule');
      }
    }
  } catch (error) {
    console.error('Share error:', error);
    Swal.fire(
      'Error!',
      error.message || 'Failed to share capsule. Please try again.',
      'error'
    );
  }
}

// ==================== DELETE MEMORY FUNCTION ====================
async function deleteMemory(capsuleId) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This capsule will be permanently deleted!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    try {
      const card = document.querySelector(`.memory-card[data-memory-id="${capsuleId}"]`);
      if (card) {
        card.classList.add('deleting');
      }

      console.log('Attempting to delete capsule:', capsuleId);

      const response = await fetch('../php_files/delete_capsule.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: sends session cookie
        body: JSON.stringify({ 
          capsule_id: capsuleId
        })
      });
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (data.success) {
        // Remove the card with animation
        setTimeout(() => {
          if (card) card.remove();
          
          // Check if no memories left
          const memoriesGrid = document.getElementById('memoriesGrid');
          if (memoriesGrid && memoriesGrid.children.length === 0) {
            memoriesGrid.innerHTML = `
              <div class="no-memories" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: var(--gold); opacity: 0.5;"></i>
                <p style="margin-top: 1rem; color: #666;">No capsules found</p>
                <a href="create_memory.html" class="btn btn-primary">
                  <i class="fas fa-plus"></i> Create Your First Memory
                </a>
              </div>
            `;
          }
        }, 300);

        await Swal.fire(
          'Deleted!',
          'Your capsule has been deleted.',
          'success'
        );
      } else {
        if (card) card.classList.remove('deleting');
        throw new Error(data.message || 'Failed to delete capsule');
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Show helpful error message
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        html: `
          <p>${error.message}</p>
          <small style="color: #666;">
            If you see "must be logged in", try refreshing the page and logging in again.
          </small>
        `,
        confirmButtonColor: '#d4af37'
      });
    }
  }
}
// ==================== DASHBOARD ====================
async function loadDashboardData() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Update user name
  const userName = document.getElementById('userName');
  if (userName) {
    userName.textContent = currentUser.firstName;
  }
  
  try {
    // Fetch capsules from database
    const response = await fetch(`../php_files/get_capsules.php?user_id=${currentUser.id}`);
    const result = await response.json();
    
    if (result.success) {
      const capsules = result.capsules || [];
      const sharedCapsules = capsules.filter(c => c.capsule_type === 'shared');
      const futureCapsules = capsules.filter(c => c.capsule_type === 'future');
      
      // Update stat tiles
      const statsTile = document.querySelector('.tile:has(.fa-chart-line)');
      if (statsTile) {
        statsTile.querySelector('p').textContent = `${capsules.length} capsules preserved`;
      }
      
      const sharedTile = document.querySelector('.tile:has(.fa-users)');
      if (sharedTile) {
        sharedTile.querySelector('p').textContent = `${sharedCapsules.length} shared capsules`;
      }
      
      const futureTile = document.querySelector('.tile:has(.fa-hourglass-half)');
      if (futureTile) {
        futureTile.querySelector('p').textContent = `${futureCapsules.length} future messages`;
      }
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

function loadUserData() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Update profile page if exists
  const profileName = document.querySelector('.profile-header-info h2');
  if (profileName) {
    profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  }
  
  const profileEmail = document.querySelector('.profile-email');
  if (profileEmail) {
    profileEmail.innerHTML = `<i class="fas fa-envelope"></i> ${currentUser.email}`;
  }
  
  const profileJoined = document.querySelector('.profile-joined');
  if (profileJoined) {
    const joinDate = new Date(currentUser.joinDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    profileJoined.innerHTML = `<i class="fas fa-calendar"></i> Member since ${joinDate}`;
  }
  
  // Load latest memory for home page
  loadLatestMemory();
}

// ==================== LATEST MEMORY FOR HOME PAGE ====================
async function loadLatestMemory() {
  const currentUser = getCurrentUser();
  
  console.log('loadLatestMemory called');
  console.log('Current user:', currentUser);
  
  const latestMemoryPreview = document.getElementById('latestMemoryPreview');
  if (!latestMemoryPreview) {
    console.log('latestMemoryPreview element not found');
    return;
  }
  
  // Show loading state
  latestMemoryPreview.innerHTML = `
    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--gold); margin-bottom: 8px;"></i>
    <p>Loading...</p>
  `;
  
  if (!currentUser) {
    // Not logged in - show signup message
    console.log('User not logged in');
    latestMemoryPreview.innerHTML = `
      <i class="fas fa-user-plus" style="font-size: 2rem; color: var(--gold); margin-bottom: 8px;"></i>
      <p>Log in to see your memories</p>
    `;
    return;
  }
  
  try {
    const userId = currentUser.userId || currentUser.id; // Support both userId and id
    const apiUrl = `../php_files/get_capsules.php?user_id=${userId}`;
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('Capsules API Response:', data); // Debug log
    console.log('Number of capsules:', data.capsules ? data.capsules.length : 0); // Debug log
    
    if (data.success && data.capsules && data.capsules.length > 0) {
      console.log('All capsules:', data.capsules); // Debug log
      
      // Get the first PRIVATE capsule (not future/locked ones)
      const latestCapsule = data.capsules.find(c => c.capsule_type === 'private');
      
      if (!latestCapsule) {
        // No private capsules found
        latestMemoryPreview.innerHTML = `
          <i class="fas fa-user-lock" style="font-size: 2rem; color: var(--gold); margin-bottom: 8px;"></i>
          <p>No private memories yet</p>
        `;
        return;
      }
      
      // Store the latest capsule ID globally for the view button
      window.latestCapsuleId = latestCapsule.capsule_id;
      
      // Check if capsule has media
      let previewContent = '';
      if (latestCapsule.media && latestCapsule.media.length > 0) {
        const lastMedia = latestCapsule.media[latestCapsule.media.length - 1];
        const mediaPath = getMediaPath(lastMedia.file_path);
        
        console.log('Media path:', mediaPath); // Debug log
        
        if (lastMedia.media_type === 'image') {
          previewContent = `<img src="${mediaPath}" alt="${latestCapsule.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="console.error('Image failed to load:', this.src)">`;
        } else if (lastMedia.media_type === 'video') {
          previewContent = `<i class="fas fa-video" style="font-size: 3rem; color: var(--gold);"></i>`;
        } else if (lastMedia.media_type === 'audio') {
          previewContent = `<i class="fas fa-music" style="font-size: 3rem; color: var(--gold);"></i>`;
        }
      } else {
        previewContent = `<i class="fas fa-camera" style="font-size: 2rem; color: var(--gold);"></i>`;
      }
      
      console.log('Setting preview content for:', latestCapsule.title); // Debug log
      
      latestMemoryPreview.innerHTML = `
        ${previewContent}
        <p><strong>${latestCapsule.title}</strong> • ${formatDate(latestCapsule.date_of_memory)}</p>
      `;
    } else {
      console.log('No capsules found or API returned error'); // Debug log
      // No capsules yet - show message
      latestMemoryPreview.innerHTML = `
        <i class="fas fa-plus-circle" style="font-size: 2rem; color: var(--gold); margin-bottom: 8px;"></i>
        <p>No memories yet. Create your first capsule!</p>
      `;
      window.latestCapsuleId = null;
    }
  } catch (error) {
    console.error('Error loading latest memory:', error);
    latestMemoryPreview.innerHTML = `
      <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #999; margin-bottom: 8px;"></i>
      <p>Unable to load memories</p>
    `;
  }
}

function viewLatestMemory() {
  console.log('========== viewLatestMemory CALLED ==========');
  console.log('window.latestCapsuleId:', window.latestCapsuleId);
  console.log('typeof latestCapsuleId:', typeof window.latestCapsuleId);
  
  if (window.latestCapsuleId) {
    console.log('✓ Valid capsule ID found:', window.latestCapsuleId);
    console.log('Calling openCapsuleDetail...');
    openCapsuleDetail(window.latestCapsuleId);
  } else {
    console.log('✗ No capsule ID found');
    console.log('Redirecting to view_capsule.html');
    window.location.href = 'view_capsule.html';
  }
}

// Make function globally available
window.viewLatestMemory = viewLatestMemory;

// ==================== SLIDESHOW ====================
function initializeSlideshow() {
  const slideshow = document.getElementById('memory-slideshow');
  if (!slideshow) return;
  
  const images = [
   "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  ];
  
  let currentIndex = 0;
  
  function changeSlide() {
    currentIndex = (currentIndex + 1) % images.length;
    slideshow.style.backgroundImage = `url(${images[currentIndex]})`;
  }
  
  // Set initial image
  slideshow.style.backgroundImage = `url(${images[0]})`;
  
  // Change image every 5 seconds
  setInterval(changeSlide, 5000);
}

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function showLockedMessage(title, openDate) {
  const unlockDate = new Date(openDate);
  const now = new Date();
  const timeRemaining = unlockDate - now;
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  let timeRemainingText = '';
  if (days > 0) {
    timeRemainingText = `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    timeRemainingText = `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  Swal.fire({
    icon: 'info',
    title: '<i class="fas fa-lock" style="color: #d4af37;"></i> Capsule Locked',
    html: `
      <div style="text-align: center; padding: 1rem;">
        <h3 style="color: var(--deep-blue); margin-bottom: 1rem;">${title}</h3>
        <p style="font-size: 1.1rem; color: #666; margin-bottom: 1.5rem;">This future message is sealed until:</p>
        <div style="background: linear-gradient(135deg, #f0e6c8 0%, #e8e2d4 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
          <i class="fas fa-calendar-alt" style="font-size: 2rem; color: var(--gold); margin-bottom: 0.5rem;"></i>
          <p style="font-size: 1.3rem; font-weight: 600; color: var(--deep-blue);">${formatDateTime(openDate)}</p>
        </div>
        <p style="color: #888; font-size: 0.95rem;">Time remaining: <strong>${timeRemainingText}</strong></p>
        <p style="color: #666; margin-top: 1rem; font-style: italic;">This capsule will automatically unlock when the time arrives.</p>
      </div>
    `,
    confirmButtonText: 'Got it',
    confirmButtonColor: '#d4af37',
    customClass: {
      popup: 'locked-capsule-popup'
    }
  });
}

// Make function globally available
window.showLockedMessage = showLockedMessage;

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ==================== TIMELINE LOADING ====================
async function loadTimeline() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  const timelineContainer = document.getElementById('timelineContainer');
  if (!timelineContainer) return;
  
  try {
    const userId = currentUser.userId || currentUser.id;
    const response = await fetch(`../php_files/get_capsules.php?user_id=${userId}`);
    const data = await response.json();
    
    if (!data.success || !data.capsules || data.capsules.length === 0) {
      timelineContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #666;">
          <i class="fas fa-inbox" style="font-size: 3rem; color: var(--gold); opacity: 0.5;"></i>
          <p style="margin-top: 1rem;">No memories yet. Start creating your timeline!</p>
        </div>
      `;
      return;
    }
    
    // Build timeline HTML - one item per capsule, chronologically
    timelineContainer.innerHTML = data.capsules.map(capsule => {
      const isLocked = capsule.capsule_type === 'future' && capsule.open_date && new Date(capsule.open_date) > new Date();
      const year = new Date(capsule.date_of_memory).getFullYear();
      
      return `
        <div class="timeline-item" onclick="${isLocked ? `showLockedMessage('${capsule.title}', '${capsule.open_date}')` : `openCapsuleDetail(${capsule.capsule_id})`}" style="cursor: pointer;">
          <div class="timeline-marker ${isLocked ? 'locked' : ''}"></div>
          <div class="timeline-content">
            <h3>${capsule.title} ${isLocked ? '<i class="fas fa-lock" style="font-size: 0.9rem; color: var(--gold);"></i>' : ''}</h3>
            <p class="timeline-date" style="color: var(--gold); font-weight: 500; margin-bottom: 0.5rem;">
              <i class="fas fa-calendar"></i> ${formatDate(capsule.date_of_memory)}
            </p>
            <p>${isLocked ? '🔒 Locked until ' + formatDateTime(capsule.open_date) : (capsule.story_text || 'No description').substring(0, 100)}${(!isLocked && (capsule.story_text || '').length > 100) ? '...' : ''}</p>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading timeline:', error);
    timelineContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #999;"></i>
        <p style="margin-top: 1rem;">Unable to load timeline</p>
      </div>
    `;
  }
}

// ==================== STATS LOADING ====================
async function loadStats() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const userId = currentUser.userId || currentUser.id;
    const response = await fetch(`../php_files/get_capsules.php?user_id=${userId}`);
    const data = await response.json();
    
    if (!data.success) return;
    
    const capsules = data.capsules || [];
    const totalCapsules = capsules.length;
    const privateCapsules = capsules.filter(c => c.capsule_type === 'private').length;
    const sharedCapsules = capsules.filter(c => c.capsule_type === 'shared').length;
    const futureCapsules = capsules.filter(c => c.capsule_type === 'future').length;
    const lockedCapsules = capsules.filter(c => c.capsule_type === 'future' && c.open_date && new Date(c.open_date) > new Date()).length;
    
    // Count total media
    let totalMedia = 0;
    capsules.forEach(c => {
      if (c.media && c.media.length > 0) {
        totalMedia += c.media.length;
      }
    });
    
    // Update stat numbers if elements exist
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
      statNumbers[0].textContent = totalCapsules;
      statNumbers[1].textContent = totalMedia;
      statNumbers[2].textContent = lockedCapsules;
      statNumbers[3].textContent = sharedCapsules;
    }
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ==================== PROFILE TABS ====================
function switchTab(tabName) {
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.profile-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  event.target.closest('.profile-tab').classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});



//==================== OpenCapsuleDetail Function ======================

// Global variable for carousel
let currentSlideIndex = 0;

// Open detailed capsule view
async function openCapsuleDetail(capsuleId) {
  console.log('========== openCapsuleDetail CALLED ==========');
  console.log('capsuleId parameter:', capsuleId);
  
  try {
    // Show loading
    console.log('Showing SweetAlert loading modal...');
    Swal.fire({
      title: 'Loading...',
      text: 'Fetching capsule details',
      allowOutsideClick: false,
      didOpen: () => {
        console.log('SweetAlert loading modal opened');
        Swal.showLoading();
      }
    });

    // Fetch full capsule data
    const apiUrl = `../php_files/get_capsule_for_edit.php?capsule_id=${capsuleId}`;
    console.log('Fetching capsule from:', apiUrl);
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response text (first 200 chars):', responseText.substring(0, 200));
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Parsed result:', result);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }
    
    if (!result.success) {
      console.error('API returned error:', result.message);
      throw new Error(result.message || 'Failed to load capsule');
    }
    
    const capsule = result.capsule;
    console.log('Capsule loaded successfully:', capsule.title);
    
    console.log('Closing SweetAlert...');
    Swal.close();
    
    // Create detailed view modal
    console.log('Creating modal HTML...');
    const modalHTML = createCapsuleDetailModal(capsule);
    
    // Remove existing detail modal if any
    const existingModal = document.getElementById('capsuleDetailModal');
    if (existingModal) {
      console.log('Removing existing modal...');
      existingModal.remove();
    }
    
    // Add modal to body
    console.log('Adding modal to body...');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal added successfully');
    
    // Verify modal is in DOM
    const verifyModal = document.getElementById('capsuleDetailModal');
    console.log('Modal in DOM:', verifyModal ? 'YES' : 'NO');
    
    if (verifyModal) {
      const styles = window.getComputedStyle(verifyModal);
      console.log('Modal display:', styles.display);
      console.log('Modal opacity:', styles.opacity);
      console.log('Modal z-index:', styles.zIndex);
      console.log('Modal position:', styles.position);
      
      // Force display if hidden
      verifyModal.style.display = 'flex';
      verifyModal.style.opacity = '1';
      console.log('Modal display forced to flex and opacity to 1');
    }
    
    // Initialize carousel
    if (capsule.media && capsule.media.length > 0) {
      initializeCarousel(capsule.media);
    }
    
    // Add event listeners
    const modal = document.getElementById('capsuleDetailModal');
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeCapsuleDetail();
      }
    });
    
    // Close button
    const closeBtn = modal.querySelector('.close-detail-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCapsuleDetail);
    }
    
    // Edit button
    const editBtn = modal.querySelector('.detail-btn.edit');
    if (editBtn) {
      editBtn.addEventListener('click', function() {
        closeCapsuleDetail();
        setTimeout(() => openEditModal(capsuleId), 300);
      });
    }
    
    // Delete button
    const deleteBtn = modal.querySelector('.detail-btn.delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
        closeCapsuleDetail();
        setTimeout(() => deleteMemory(capsuleId), 300);
      });
    }
    
  } catch (error) {
    console.error('========== ERROR in openCapsuleDetail ==========');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
      confirmButtonColor: '#d4af37'
    });
  }
}

// Create the detailed modal HTML
function createCapsuleDetailModal(capsule) {
  const privacyBadge = capsule.capsule_type === 'private' ? 'Private' : 
                       capsule.capsule_type === 'shared' ? 'Shared' : 'Future';
  
  const privacyIcon = capsule.capsule_type === 'private' ? 'fa-lock' : 
                      capsule.capsule_type === 'shared' ? 'fa-users' : 'fa-clock';
  
  const createdDate = formatDetailDate(capsule.created_at);
  const memoryDate = capsule.date_of_memory ? formatDetailDate(capsule.date_of_memory) : 'Not specified';
  
  return `
    <div id="capsuleDetailModal" class="capsule-detail-modal">
      <div class="capsule-detail-content">
        
        <!-- Header -->
        <div class="capsule-detail-header">
          <div>
            <h2>${capsule.title}</h2>
            <div class="meta">
              <span><i class="fas fa-calendar"></i> ${memoryDate}</span>
              ${capsule.location_name ? `<span><i class="fas fa-map-marker-alt"></i> ${capsule.location_name}</span>` : ''}
              <span><i class="fas ${privacyIcon}"></i> ${privacyBadge}</span>
            </div>
          </div>
          <button class="close-detail-modal">&times;</button>
        </div>
        
        <!-- Media Carousel -->
        ${capsule.media && capsule.media.length > 0 ? `
          <div class="media-carousel-container">
            <div class="media-counter">
              <span id="currentSlide">1</span> / ${capsule.media.length}
            </div>
            
            <div class="media-carousel" id="mediaCarousel">
              ${capsule.media.map((media, index) => {
                const displayPath = getMediaPath(media.file_path);
                
                return `
                  <div class="media-slide" data-slide-index="${index}">
                    ${media.media_type === 'image' 
                      ? `<img src="${displayPath}" alt="${media.file_name}">`
                      : media.media_type === 'video'
                      ? `<video src="${displayPath}" controls></video>`
                      : media.media_type === 'audio'
                      ? `<div class="audio-placeholder">
                          <i class="fas fa-music"></i>
                          <audio src="${displayPath}" controls style="width: 80%;"></audio>
                          <p style="margin-top: 1rem;">${media.file_name}</p>
                        </div>`
                      : `<div class="audio-placeholder">
                          <i class="fas fa-file"></i>
                          <p>${media.file_name}</p>
                        </div>`
                    }
                  </div>
                `;
              }).join('')}
            </div>
            
            ${capsule.media.length > 1 ? `
              <button class="carousel-nav prev" onclick="changeSlide(-1)">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="carousel-nav next" onclick="changeSlide(1)">
                <i class="fas fa-chevron-right"></i>
              </button>
              
              <div class="carousel-indicators">
                ${capsule.media.map((_, index) => `
                  <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                          onclick="goToSlide(${index})"></button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="no-media-placeholder">
            <i class="fas fa-image"></i>
            <p>No media files attached</p>
          </div>
        `}
        
        <!-- Body -->
        <div class="capsule-detail-body">
          
          <!-- Info Grid -->
          <div class="detail-info-grid">
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <div class="info-item-content">
                <strong>Created On</strong>
                <span>${createdDate}</span>
              </div>
            </div>
            
            ${capsule.location_name ? `
              <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div class="info-item-content">
                  <strong>Location</strong>
                  <span>${capsule.location_name}</span>
                </div>
              </div>
            ` : ''}
            
            <div class="info-item">
              <i class="fas ${privacyIcon}"></i>
              <div class="info-item-content">
                <strong>Privacy</strong>
                <span>${privacyBadge}</span>
              </div>
            </div>
            
            ${capsule.media && capsule.media.length > 0 ? `
              <div class="info-item">
                <i class="fas fa-paperclip"></i>
                <div class="info-item-content">
                  <strong>Attachments</strong>
                  <span>${capsule.media.length} file(s)</span>
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Description -->
          ${capsule.description ? `
            <div class="detail-section">
              <h3><i class="fas fa-info-circle"></i> Description</h3>
              <p>${capsule.description}</p>
            </div>
          ` : ''}
          
          <!-- Story -->
          ${capsule.story_text ? `
            <div class="detail-section">
              <h3><i class="fas fa-book"></i> Your Story</h3>
              <p style="white-space: pre-wrap;">${capsule.story_text}</p>
            </div>
          ` : ''}
          
        </div>
        
        <!-- Footer -->
        <div class="capsule-detail-footer">
          <div class="detail-actions">
            <button class="detail-btn edit">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="detail-btn delete">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
          <button class="detail-btn close" onclick="closeCapsuleDetail()">
            Close
          </button>
        </div>
        
      </div>
    </div>
  `;
}

// Initialize media carousel
function initializeCarousel(media) {
  currentSlideIndex = 0;
  updateCarousel();
}

// Change slide
function changeSlide(direction) {
  const carousel = document.getElementById('mediaCarousel');
  if (!carousel) return;
  
  const slides = carousel.querySelectorAll('.media-slide');
  const totalSlides = slides.length;
  
  currentSlideIndex += direction;
  
  // Loop around
  if (currentSlideIndex < 0) {
    currentSlideIndex = totalSlides - 1;
  } else if (currentSlideIndex >= totalSlides) {
    currentSlideIndex = 0;
  }
  
  updateCarousel();
}

// Go to specific slide
function goToSlide(index) {
  currentSlideIndex = index;
  updateCarousel();
}

// Update carousel display
function updateCarousel() {
  const carousel = document.getElementById('mediaCarousel');
  if (!carousel) return;
  
  const slides = carousel.querySelectorAll('.media-slide');
  const indicators = document.querySelectorAll('.carousel-indicator');
  const counter = document.getElementById('currentSlide');
  
  // Update transform
  carousel.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  
  // Update counter
  if (counter) {
    counter.textContent = currentSlideIndex + 1;
  }
  
  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlideIndex);
  });
  
  // Pause all videos and audios
  slides.forEach((slide, index) => {
    const video = slide.querySelector('video');
    const audio = slide.querySelector('audio');
    
    if (index !== currentSlideIndex) {
      if (video) video.pause();
      if (audio) audio.pause();
    }
  });
}

// Close detail modal
function closeCapsuleDetail() {
  const modal = document.getElementById('capsuleDetailModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Format date for detail view
function formatDetailDate(dateString) {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Make functions available globally
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;
window.closeCapsuleDetail = closeCapsuleDetail;



// ==================== PROFILE PAGE FUNCTIONS ====================


// Load profile data when page loads
async function loadProfileData() {
  try {
    const response = await fetch('../php_files/get_profile.php', {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const user = result.user;
    
    // Update profile header
    const profileFullName = document.getElementById('profileFullName');
    const profileEmail = document.getElementById('profileEmail');
    const memberSince = document.getElementById('memberSince');
    const navUserName = document.getElementById('navUserName');
    
    if (profileFullName) profileFullName.textContent = `${user.first_name} ${user.last_name}`;
    if (profileEmail) profileEmail.textContent = user.email;
    if (memberSince) memberSince.textContent = user.member_since;
    if (navUserName) navUserName.textContent = user.first_name;
    
    // Update profile picture
    const profilePic = document.getElementById('profilePicture');
    if (profilePic) {
      if (user.profile_picture) {
        profilePic.src = '../' + user.profile_picture;
      } else {
        profilePic.src = `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&size=200&background=d4af37&color=1c2a3a&bold=true`;
      }
    }
    
    // Update stats
    if (user.stats) {
      const totalMemories = document.getElementById('totalMemories');
      const sharedMemories = document.getElementById('sharedMemories');
      const futureMemories = document.getElementById('futureMemories');
      
      if (totalMemories) totalMemories.textContent = user.stats.total_capsules || 0;
      if (sharedMemories) sharedMemories.textContent = user.stats.shared_count || 0;
      if (futureMemories) futureMemories.textContent = user.stats.future_count || 0;
    }
    
    // Update form fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const bio = document.getElementById('bio');
    const birthdate = document.getElementById('birthdate');
    const location = document.getElementById('location');
    
    if (firstName) firstName.value = user.first_name || '';
    if (lastName) lastName.value = user.last_name || '';
    if (bio) bio.value = user.bio || '';
    if (birthdate) birthdate.value = user.birth_date || '';
    if (location) location.value = user.location || '';
    
  } catch (error) {
    console.error('Load profile error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Failed to Load Profile',
      text: error.message,
      confirmButtonColor: '#d4af37'
    }).then(() => {
      // Redirect to login if not authenticated
      if (error.message.includes('logged in')) {
        window.location.href = 'login.html';
      }
    });
  }
}

// Upload profile picture
async function uploadProfilePicture(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid File',
      text: 'Please select an image file',
      confirmButtonColor: '#d4af37'
    });
    return;
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'File Too Large',
      text: 'Image must be less than 5MB',
      confirmButtonColor: '#d4af37'
    });
    return;
  }
  
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  // Show loading
  Swal.fire({
    title: 'Uploading...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  
  try {
    const response = await fetch('../php_files/upload_profile_picture.php', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update profile picture immediately
      document.getElementById('profilePicture').src = '../' + result.file_path;
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Profile picture updated',
        confirmButtonColor: '#d4af37'
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: error.message,
      confirmButtonColor: '#d4af37'
    });
  }
}

// Update profile information
async function handleUpdateProfile(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const bio = document.getElementById('bio').value;
  const birthdate = document.getElementById('birthdate').value;
  const location = document.getElementById('location').value;
  
  // Show loading
  Swal.fire({
    title: 'Updating...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  
  try {
    const response = await fetch('../php_files/update_profile.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        birth_date: birthdate,
        location: location
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update display name
      document.getElementById('profileFullName').textContent = `${firstName} ${lastName}`;
      document.getElementById('navUserName').textContent = firstName;
      
      // Update localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.firstName = firstName;
        currentUser.lastName = lastName;
        localStorage.setItem('eternaCurrentUser', JSON.stringify(currentUser));
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: result.message,
        confirmButtonColor: '#d4af37'
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Update error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.message,
      confirmButtonColor: '#d4af37'
    });
  }
}

// Update password
async function handleUpdatePassword(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('currentPass').value;
  const newPassword = document.getElementById('newPass').value;
  
  // Show loading
  Swal.fire({
    title: 'Updating Password...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  
  try {
    const response = await fetch('../php_files/update_password.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Clear form
      document.getElementById('passwordForm').reset();
      
      Swal.fire({
        icon: 'success',
        title: 'Password Updated!',
        text: 'Your password has been changed successfully',
        confirmButtonColor: '#d4af37'
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Password update error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.message,
      confirmButtonColor: '#d4af37'
    });
  }
}

// Switch profile tabs
function switchTab(tabName) {
  // Remove active from all tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.profile-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Add active to selected tab
  event.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// Initialize profile page if on profile page
if (window.location.pathname.includes('profile.html')) {
  document.addEventListener('DOMContentLoaded', loadProfileData);
}