// Global variables
let allArchives = [];
let filteredArchives = [];
const API_BASE_URL = 'http://localhost:5000';

// Text-to-Speech variables
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isPlaying = false;
let isPaused = false;
let currentArchive = null;
let currentLanguage = 'en';
let progressInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📚 Archives page loaded');
    
    // Load all archives
    loadAllArchives();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchArchives();
            }
        });
    }
}

// Load all archives
async function loadAllArchives() {
    try {
        showLoading(true);
        
        console.log('🔍 Fetching archives from:', `${API_BASE_URL}/api/archives`);
        
        const response = await fetch(`${API_BASE_URL}/api/archives`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Response data:', data);
        
        if (data.success) {
            allArchives = data.archives || [];
            filteredArchives = [...allArchives];
            
            console.log(`✅ Loaded ${allArchives.length} archives`);
            
            if (allArchives.length > 0) {
                displayArchives(filteredArchives);
            } else {
                console.warn('⚠️ No archives found in database');
                showNoResults();
            }
        } else {
            console.error('❌ API returned success: false');
            showNoResults();
        }
        
    } catch (error) {
        console.error('❌ Error loading archives:', error);
        console.error('Error details:', error.message);
        
        // Show user-friendly error
        const archivesGrid = document.getElementById('archivesGrid');
        if (archivesGrid) {
            archivesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
                    <h3 style="color: #e74c3c; margin-bottom: 15px;">⚠️ Error Loading Archives</h3>
                    <p style="color: rgba(232, 213, 183, 0.7);">${error.message}</p>
                    <p style="color: rgba(232, 213, 183, 0.7); margin-top: 10px;">
                        Please make sure the server is running and archives are seeded.
                    </p>
                    <button onclick="loadAllArchives()" style="margin-top: 20px; padding: 10px 20px; background: #d4af37; border: none; border-radius: 8px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
        
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Search archives
async function searchArchives() {
    try {
        showLoading(true);
        
        const searchInput = document.getElementById('searchInput');
        const searchQuery = searchInput ? searchInput.value.trim() : '';
        
        if (!searchQuery) {
            loadAllArchives();
            return;
        }
        
        const params = new URLSearchParams({ search: searchQuery });
        
        console.log('🔍 Searching archives:', searchQuery);
        
        const response = await fetch(`${API_BASE_URL}/api/archives?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            allArchives = data.archives || [];
            filteredArchives = [...allArchives];
            
            const resultsTitle = document.getElementById('resultsTitle');
            if (resultsTitle) {
                resultsTitle.textContent = `Search Results for "${searchQuery}"`;
            }
            
            if (allArchives.length > 0) {
                displayArchives(filteredArchives);
            } else {
                showNoResults();
            }
        } else {
            showNoResults();
        }
        
    } catch (error) {
        console.error('❌ Error searching archives:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

// Display archives
function displayArchives(archives) {
    const archivesGrid = document.getElementById('archivesGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!archivesGrid) return;
    
    if (!archives || archives.length === 0) {
        archivesGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        if (resultsCount) resultsCount.textContent = '';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    if (resultsCount) {
        resultsCount.textContent = `Found ${archives.length} archive${archives.length !== 1 ? 's' : ''}`;
    }
    
    archivesGrid.innerHTML = archives.map(archive => `
        <div class="archive-card">
            <img src="${archive.coverImage || 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'}" 
                 alt="${archive.monasteryName}" 
                 class="archive-card-image"
                 onerror="this.src='https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'">
            
            <div class="archive-card-content">
                <h3 class="archive-card-title">${archive.monasteryName}</h3>
                
                <div class="archive-card-meta">
                    <span>👁️ ${archive.views || 0} views</span>
                    <span>📥 ${archive.downloads || 0} downloads</span>
                </div>
                
                <div class="archive-card-actions">
                    <button class="archive-action-btn audio-btn" onclick='openAudioGuide(${JSON.stringify(archive).replace(/'/g, "&#39;")})'>
                        🎧 Audio Guide
                    </button>
                    <button class="archive-action-btn" onclick='viewArchive("${archive._id}")'>
                        👁️ View
                    </button>
                    <button class="archive-action-btn" onclick='shareArchive("${archive.monasteryName}", "${archive._id}")'>
                        🔗 Share
                    </button>
                    <button class="archive-action-btn" onclick='downloadArchive("${archive._id}", "pdf")'>
                        📥 Download
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// TEXT-TO-SPEECH AUDIO GUIDE - OPTIMIZED
// ========================================

// Global tracking variables
let speechStartTime = 0;
let totalDuration = 0;
let animationFrameId = null;

// Open Audio Guide Modal
function openAudioGuide(archive) {
    currentArchive = archive;
    currentLanguage = 'en';
    isPlaying = false;
    isPaused = false;
    
    console.log('🎧 Opening audio guide for:', archive.monasteryName);
    
    // Show modal
    const modal = document.getElementById('audioGuideModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Stop any playing speech
    stopAllAudio();
    
    // Update title with monastery name
    const modalTitle = document.querySelector('.audio-title');
    if (modalTitle) {
        modalTitle.textContent = archive.monasteryName;
    }
    
    // Reset UI
    resetUI();
}

// Stop all audio and reset
function stopAllAudio() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Reset UI
function resetUI() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('audioDuration');
    const progressBar = document.getElementById('audioProgress');
    const languageSelect = document.getElementById('audioLanguage');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
    if (durationDisplay) durationDisplay.textContent = '0:00';
    if (progressBar) progressBar.value = 0;
    if (languageSelect) languageSelect.value = currentLanguage;
    if (volumeSlider) volumeSlider.value = 70;
    
    speechStartTime = 0;
    totalDuration = 0;
}

// Toggle Play/Pause
function togglePlayPause() {
    if (!currentArchive) {
        alert('No archive selected');
        return;
    }
    
    if (isPlaying && !isPaused) {
        // Pause
        pauseAudio();
    } else if (isPaused) {
        // Resume
        resumeAudio();
    } else {
        // Start playing
        playAudioGuide();
    }
}

// Pause audio
function pauseAudio() {
    console.log('⏸️ Pausing...');
    speechSynthesis.pause();
    isPaused = true;
    isPlaying = false;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Resume audio
function resumeAudio() {
    console.log('▶️ Resuming...');
    speechSynthesis.resume();
    isPaused = false;
    isPlaying = true;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    // Resume progress tracking
    updateProgressSmooth();
}

// Play Audio Guide using Text-to-Speech
function playAudioGuide() {
    if (!currentArchive) {
        console.error('No archive available');
        alert('No archive content available');
        return;
    }
    
    // Stop any existing speech
    stopAllAudio();
    
    // Get text content
    let text = getContentToRead();
    
    if (!text || text.trim() === '') {
        console.error('No content to read');
        alert('No content available for this monastery. Please add content first.');
        return;
    }
    
    console.log('🎙️ Reading content (' + text.length + ' characters)');
    console.log('First 100 chars:', text.substring(0, 100));
    
    // Create utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    const voiceLangMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ne': 'ne-NP',
        'si': 'en-US'
    };
    currentUtterance.lang = voiceLangMap[currentLanguage] || 'en-US';
    
    // Set voice properties
    const volumeSlider = document.getElementById('volumeSlider');
    currentUtterance.volume = volumeSlider ? volumeSlider.value / 100 : 0.7;
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    
    // Calculate estimated duration (words per minute)
    const wordCount = text.split(/\s+/).length;
    totalDuration = (wordCount / 150) * 60; // 150 WPM in seconds
    
    console.log(`📊 Word count: ${wordCount}, Estimated duration: ${totalDuration.toFixed(1)}s`);
    
    // Event listeners
    currentUtterance.onstart = () => {
        console.log('🎵 Speech started');
        isPlaying = true;
        isPaused = false;
        speechStartTime = Date.now();
        
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        const durationDisplay = document.getElementById('audioDuration');
        if (durationDisplay) {
            durationDisplay.textContent = formatTime(totalDuration);
        }
        
        // Start smooth progress tracking
        updateProgressSmooth();
    };
    
    currentUtterance.onend = () => {
        console.log('🎵 Speech ended');
        isPlaying = false;
        isPaused = false;
        
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        const progressBar = document.getElementById('audioProgress');
        if (progressBar) {
            progressBar.value = 100;
        }
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };
    
    currentUtterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error, event);
        isPlaying = false;
        isPaused = false;
        
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Show specific error message
        let errorMsg = 'Error reading content. ';
        if (event.error === 'interrupted') {
            errorMsg += 'Speech was interrupted.';
        } else if (event.error === 'network') {
            errorMsg += 'Network error occurred.';
        } else {
            errorMsg += 'Please try again.';
        }
        alert(errorMsg);
    };
    
    // Speak
    try {
        speechSynthesis.speak(currentUtterance);
    } catch (error) {
        console.error('Failed to start speech:', error);
        alert('Failed to start audio. Please try again.');
    }
}

// Smooth progress update using requestAnimationFrame
function updateProgressSmooth() {
    if (!isPlaying || isPaused) {
        return;
    }
    
    const elapsed = (Date.now() - speechStartTime) / 1000; // seconds
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    const progressBar = document.getElementById('audioProgress');
    const currentTimeDisplay = document.getElementById('currentTime');
    
    if (progressBar) {
        progressBar.value = progress;
    }
    
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(elapsed);
    }
    
    // Continue animation
    if (elapsed < totalDuration && isPlaying && !isPaused) {
        animationFrameId = requestAnimationFrame(updateProgressSmooth);
    }
}

// Get content to read - IMPROVED
function getContentToRead() {
    if (!currentArchive) return '';
    
    let textParts = [];
    
    // Add title
    if (currentArchive.monasteryName) {
        textParts.push(currentArchive.monasteryName);
    }
    
    // Add main content
    if (currentArchive.content) {
        textParts.push(currentArchive.content);
    }
    
    // Add historical significance
    if (currentArchive.historicalSignificance) {
        textParts.push('Historical Significance: ' + currentArchive.historicalSignificance);
    }
    
    // Add architecture description
    if (currentArchive.architecture && currentArchive.architecture.description) {
        textParts.push('Architecture: ' + currentArchive.architecture.description);
    }
    
    // Add sections
    if (currentArchive.sections && currentArchive.sections.length > 0) {
        currentArchive.sections
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .forEach(section => {
                if (section.sectionTitle && section.sectionContent) {
                    textParts.push(`${section.sectionTitle}. ${section.sectionContent}`);
                }
            });
    }
    
    // Join all parts
    let text = textParts.join('. ');
    
    // Clean up text
    text = text
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\.\s*\./g, '.')
        .trim();
    
    // If still empty, create a default message
    if (!text) {
        text = `${currentArchive.monasteryName || 'This monastery'} is a sacred Buddhist monastery in Sikkim. More information will be added soon.`;
    }
    
    return text;
}

// Rewind - Restart from beginning
function rewind() {
    console.log('⏪ Restarting audio from beginning');
    
    if (!currentArchive) {
        alert('No archive loaded');
        return;
    }
    
    // Stop current playback
    stopAllAudio();
    
    // Reset progress
    resetUI();
    
    // Restart playback
    playAudioGuide();
}

// Forward - Skip to end (since TTS doesn't support seeking)
function forward() {
    console.log('⏭️ Skipping to end');
    
    // Stop playback
    stopAllAudio();
    
    // Reset UI
    isPlaying = false;
    isPaused = false;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('audioProgress');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('audioDuration');
    
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    if (progressBar) {
        progressBar.value = 100;
    }
    
    if (currentTimeDisplay && totalDuration > 0) {
        currentTimeDisplay.textContent = formatTime(totalDuration);
    }
}

// Change language
function changeAudioLanguage() {
    const languageSelect = document.getElementById('audioLanguage');
    if (!languageSelect) return;
    
    const language = languageSelect.value;
    currentLanguage = language;
    
    console.log('🌐 Language changed to:', language);
    
    // If playing, restart with new language
    if (isPlaying || isPaused) {
        stopAllAudio();
        playAudioGuide();
    }
}

// Update volume
function updateVolume() {
    const volumeSlider = document.getElementById('volumeSlider');
    if (!volumeSlider) return;
    
    const volume = volumeSlider.value / 100;
    console.log('🔊 Volume:', Math.round(volume * 100) + '%');
    
    // Volume will apply on next play
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Close Audio Guide
function closeAudioGuide() {
    const modal = document.getElementById('audioGuideModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Stop all audio
    stopAllAudio();
    
    currentArchive = null;
    isPlaying = false;
    isPaused = false;
}


// ========================================
// VIEW ARCHIVE FUNCTIONS
// ========================================

// View Archive
async function viewArchive(archiveId) {
    try {
        console.log('👁️ Viewing archive ID:', archiveId);
        
        // Show loading state
        const modal = document.getElementById('archiveViewModal');
        const modalBody = document.getElementById('archiveViewBody');
        
        if (!modal || !modalBody) {
            console.error('Archive view modal elements not found');
            return;
        }
        
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 80px 20px;">
                <div style="display: inline-block; width: 60px; height: 60px; border: 4px solid rgba(212, 175, 55, 0.2); border-radius: 50%; border-top-color: #d4af37; animation: spin 1s linear infinite;"></div>
                <p style="color: #d4af37; margin-top: 25px; font-size: 18px;">Loading archive...</p>
            </div>
        `;
        modal.classList.add('active');
        
        const response = await fetch(`${API_BASE_URL}/api/archives/${archiveId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = 'Failed to load archive';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Archive data received:', data);
        
        if (!data.success || !data.archive) {
            throw new Error('Invalid response format from server');
        }
        
        const archive = data.archive;
        console.log('✅ Archive loaded:', archive.monasteryName);
        
        // Build archive view HTML
        let viewHTML = `
            <h2 class="archive-view-title">${archive.monasteryName || 'Untitled Archive'}</h2>
            
            ${archive.coverImage ? `
                <img src="${archive.coverImage}" 
                     alt="${archive.monasteryName}" 
                     class="archive-view-image"
                     onerror="this.src='https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800'">
            ` : ''}
            
            <div class="archive-view-text">
                ${archive.content ? `<p>${archive.content}</p>` : '<p>No content available yet. Content will be added soon.</p>'}
            </div>
        `;
        
        // Add metadata section
        if (archive.foundedYear || archive.founder || archive.lineage) {
            viewHTML += `
                <div class="archive-view-section">
                    <h3>Basic Information</h3>
                    ${archive.foundedYear ? `<p><strong>Founded:</strong> ${archive.foundedYear}</p>` : ''}
                    ${archive.founder ? `<p><strong>Founder:</strong> ${archive.founder}</p>` : ''}
                    ${archive.lineage ? `<p><strong>Lineage:</strong> ${archive.lineage}</p>` : ''}
                </div>
            `;
        }
        
        // Add sections if available
        if (archive.sections && archive.sections.length > 0) {
            archive.sections
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .forEach(section => {
                    if (section.sectionTitle && section.sectionContent) {
                        viewHTML += `
                            <div class="archive-view-section">
                                <h3>${section.sectionTitle}</h3>
                                <p>${section.sectionContent}</p>
                            </div>
                        `;
                    }
                });
        }
        
        // Add historical significance
        if (archive.historicalSignificance) {
            viewHTML += `
                <div class="archive-view-section">
                    <h3>Historical Significance</h3>
                    <p>${archive.historicalSignificance}</p>
                </div>
            `;
        }
        
        // Add architecture
        if (archive.architecture) {
            viewHTML += `<div class="archive-view-section"><h3>Architecture</h3>`;
            
            if (archive.architecture.style) {
                viewHTML += `<p><strong>Style:</strong> ${archive.architecture.style}</p>`;
            }
            
            if (archive.architecture.description) {
                viewHTML += `<p>${archive.architecture.description}</p>`;
            }
            
            if (archive.architecture.notableFeatures && archive.architecture.notableFeatures.length > 0) {
                viewHTML += `
                    <h4 style="color: #d4af37; margin-top: 15px; font-size: 18px;">Notable Features:</h4>
                    <ul style="padding-left: 20px; color: rgba(232, 213, 183, 0.9); margin-top: 10px;">
                        ${archive.architecture.notableFeatures.map(f => `<li style="margin-bottom: 8px;">${f}</li>`).join('')}
                    </ul>
                `;
            }
            
            viewHTML += `</div>`;
        }
        
        // Add traditions
        if (archive.traditions && archive.traditions.length > 0) {
            viewHTML += `
                <div class="archive-view-section">
                    <h3>Traditions & Practices</h3>
                    <ul style="padding-left: 20px; color: rgba(232, 213, 183, 0.9);">
                        ${archive.traditions.map(t => `<li style="margin-bottom: 8px;">${t}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add festivals
        if (archive.festivals && archive.festivals.length > 0) {
            viewHTML += `
                <div class="archive-view-section">
                    <h3>Festivals Celebrated</h3>
                    <ul style="padding-left: 20px; color: rgba(232, 213, 183, 0.9);">
                        ${archive.festivals.map(f => `<li style="margin-bottom: 8px;">${f}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add location
        if (archive.location) {
            viewHTML += `
                <div class="archive-view-section">
                    <h3>Location</h3>
                    ${archive.location.address ? `<p><strong>Address:</strong> ${archive.location.address}</p>` : ''}
                    ${archive.location.region ? `<p><strong>Region:</strong> ${archive.location.region}</p>` : ''}
                    ${archive.location.coordinates ? `
                        <p><strong>Coordinates:</strong> ${archive.location.coordinates.latitude}, ${archive.location.coordinates.longitude}</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=${archive.location.coordinates.latitude},${archive.location.coordinates.longitude}" 
                           target="_blank" 
                           style="color: #d4af37; text-decoration: underline; margin-top: 10px; display: inline-block;">
                            📍 View on Google Maps
                        </a>
                    ` : ''}
                </div>
            `;
        }
        
        // Update modal content
        modalBody.innerHTML = viewHTML;
        
    } catch (error) {
        console.error('❌ Error viewing archive:', error);
        console.error('Error stack:', error.stack);
        
        // Show error in modal
        const modalBody = document.getElementById('archiveViewBody');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 80px 20px;">
                    <h3 style="color: #e74c3c; margin-bottom: 15px;">⚠️ Failed to Load Archive</h3>
                    <p style="color: rgba(232, 213, 183, 0.7); margin-bottom: 20px;">${error.message}</p>
                    <button onclick="closeArchiveView()" style="padding: 12px 24px; background: #d4af37; border: none; border-radius: 8px; color: #0a0a0a; font-weight: bold; cursor: pointer;">
                        Close
                    </button>
                </div>
            `;
        }
    }
}

// Close Archive View
function closeArchiveView() {
    const modal = document.getElementById('archiveViewModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Share Archive
function shareArchive(monasteryName, archiveId) {
    const url = `${window.location.origin}/archives?id=${archiveId}`;
    
    if (navigator.share) {
        navigator.share({
            title: `${monasteryName} - Archive`,
            text: `Explore the archive of ${monasteryName}`,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Archive link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert(`Share this link:\n${url}`);
        });
    }
}

// Download Archive
async function downloadArchive(archiveId, format = 'pdf') {
    try {
        console.log(`📥 Downloading archive as ${format.toUpperCase()}...`);
        
        // Show loading state
        const downloadBtn = event.target;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '⏳ Downloading...';
        downloadBtn.disabled = true;
        
        // Fetch download
        const response = await fetch(`${API_BASE_URL}/api/archives/${archiveId}/download/${format}`);
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        // Get filename from response or create one
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `monastery-archive.${format}`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ Download complete:', filename);
        
        // Restore button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
        // Show success message
        alert(`Archive downloaded successfully as ${filename}!`);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Download feature is not yet available. Please try again later.');
        
        // Restore button
        if (event.target) {
            event.target.innerHTML = '📥 Download';
            event.target.disabled = false;
        }
    }
}

// Show loading state
function showLoading(isLoading) {
    const archivesGrid = document.getElementById('archivesGrid');
    const noResults = document.getElementById('noResults');
    
    if (!archivesGrid) return;
    
    if (isLoading) {
        archivesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
                <div style="display: inline-block; width: 60px; height: 60px; border: 4px solid rgba(212, 175, 55, 0.2); border-radius: 50%; border-top-color: #d4af37; animation: spin 1s linear infinite;"></div>
                <p style="color: #d4af37; margin-top: 25px; font-size: 18px;">Loading archives...</p>
            </div>
        `;
        if (noResults) noResults.style.display = 'none';
    }
}

// Show no results
function showNoResults() {
    const archivesGrid = document.getElementById('archivesGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (archivesGrid) archivesGrid.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
    if (resultsCount) resultsCount.textContent = '';
}

// Make functions globally available
window.searchArchives = searchArchives;
window.openAudioGuide = openAudioGuide;
window.closeAudioGuide = closeAudioGuide;
window.togglePlayPause = togglePlayPause;
window.rewind = rewind;
window.forward = forward;
window.changeAudioLanguage = changeAudioLanguage;
window.updateVolume = updateVolume;
window.viewArchive = viewArchive;
window.closeArchiveView = closeArchiveView;
window.shareArchive = shareArchive;
window.downloadArchive = downloadArchive;
