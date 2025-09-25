// ===== NOTES MODULE =====
let appNotes = [];

// Initialize notes data structure
if (!window.appData) window.appData = {};
if (!window.appData.notes) window.appData.notes = [];

(function initNotes() {
    // Load notes from localStorage on init
    loadNotesFromStorage();
    renderNotesList();
})();

// Generate unique ID for notes
function generateNoteId() {
    return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create new note
function createNote() {
    const chatLink = document.getElementById('chatLink')?.value.trim();
    const orderCode = document.getElementById('orderCode')?.value.trim();
    const noteContent = document.getElementById('noteContent')?.value.trim();
    
    // Validation
    if (!chatLink) {
        showNotification('Vui lòng nhập link chat!', 'error');
        return;
    }
    if (!orderCode) {
        showNotification('Vui lòng nhập mã đơn hàng!', 'error');
        return;
    }
    if (!noteContent) {
        showNotification('Vui lòng nhập nội dung ghi chú!', 'error');
        return;
    }
    
    // Validate URL format
    try {
        new URL(chatLink);
    } catch (e) {
        showNotification('Link chat không hợp lệ! Vui lòng nhập URL đúng định dạng.', 'error');
        return;
    }
    
    // Create note object
    const note = {
        id: generateNoteId(),
        chatLink: chatLink,
        orderCode: orderCode,
        content: noteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to notes array
    window.appData.notes.unshift(note); // Add to beginning
    
    // Clear form
    clearNoteForm();
    
    // Re-render list
    renderNotesList();
    
    // Save to localStorage
    saveNotesToStorage();
    
    showNotification('Đã tạo ghi chú thành công!', 'success');
}
window.createNote = createNote;

// Clear note form
function clearNoteForm() {
    const fields = ['chatLink', 'orderCode', 'noteContent'];
    fields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
}
window.clearNoteForm = clearNoteForm;

// Copy current chat link
function copyCurrentChatLink() {
    const chatLink = document.getElementById('chatLink')?.value.trim();
    if (!chatLink) {
        showNotification('Chưa có link để copy!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(chatLink).then(() => {
        showNotification('Đã copy link chat!', 'success');
    }).catch(() => {
        showNotification('Không thể copy link!', 'error');
    });
}
window.copyCurrentChatLink = copyCurrentChatLink;

// Copy note chat link
function copyNoteChatLink(noteId) {
    const note = window.appData.notes.find(n => n.id === noteId);
    if (!note) {
        showNotification('Không tìm thấy ghi chú!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(note.chatLink).then(() => {
        showNotification('Đã copy link chat!', 'success');
    }).catch(() => {
        showNotification('Không thể copy link!', 'error');
    });
}
window.copyNoteChatLink = copyNoteChatLink;

// Complete note (delete with success message)
function completeNote(noteId) {
    const note = window.appData.notes.find(n => n.id === noteId);
    if (!note) {
        showNotification('Không tìm thấy ghi chú!', 'error');
        return;
    }
    
    if (!confirm(`Đánh dấu hoàn thành ghi chú "${note.orderCode}"?\nGhi chú sẽ bị xóa khỏi danh sách.`)) return;
    
    window.appData.notes = window.appData.notes.filter(n => n.id !== noteId);
    renderNotesList();
    saveNotesToStorage();
    showNotification(`✅ Đã hoàn thành ghi chú ${note.orderCode}!`, 'success');
}
window.completeNote = completeNote;

// Delete note
function deleteNote(noteId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    
    window.appData.notes = window.appData.notes.filter(n => n.id !== noteId);
    renderNotesList();
    saveNotesToStorage();
    showNotification('Đã xóa ghi chú!', 'success');
}
window.deleteNote = deleteNote;

// Get status icon based on order code
function getStatusIcon(orderCode) {
    const code = orderCode.toLowerCase();
    if (code.includes('dh') || code.includes('order')) return '🛍️';
    if (code.includes('sp') || code.includes('product')) return '📦';
    if (code.includes('kh') || code.includes('customer')) return '👤';
    if (code.includes('hd') || code.includes('invoice')) return '🧾';
    return '📋';
}

// Get platform icon from chat link
function getPlatformIcon(chatLink) {
    const link = chatLink.toLowerCase();
    if (link.includes('facebook') || link.includes('m.me')) return '💙';
    if (link.includes('zalo')) return '🔵';
    if (link.includes('telegram')) return '✈️';
    if (link.includes('whatsapp')) return '💚';
    if (link.includes('instagram')) return '📸';
    return '💬';
}

// Format date for display
function formatNoteDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render notes list
function renderNotesList() {
    const container = document.getElementById('notesList');
    const countElement = document.getElementById('notesCount');
    
    if (!container) return;
    
    const notes = window.appData.notes || [];
    
    // Update count
    if (countElement) {
        countElement.textContent = `${notes.length} ghi chú`;
    }
    
    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h4>Chưa có ghi chú</h4>
                <p>Tạo ghi chú đầu tiên cho khách hàng</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notes.map((note, index) => {
        const statusIcon = getStatusIcon(note.orderCode);
        const platformIcon = getPlatformIcon(note.chatLink);
        
        return `
        <div class="note-item animate-fade-in" data-note-id="${note.id}" style="animation-delay: ${index * 0.1}s">
            <div class="note-header">
                <div class="note-info">
                    <div class="note-order-code">
                        ${statusIcon} ${note.orderCode}
                        <span class="note-status-badge">Active</span>
                    </div>
                    <div class="note-time">${formatNoteDate(note.createdAt)}</div>
                </div>
                <div class="note-actions">
                    <button class="btn-icon-small pulse-on-hover" onclick="copyNoteChatLink('${note.id}')" title="Copy link chat">
                        <span class="btn-icon">📋</span>
                    </button>
                    <button class="btn-icon-small btn-success bounce-on-hover" onclick="completeNote('${note.id}')" title="Đánh dấu hoàn thành">
                        <span class="btn-icon">✅</span>
                    </button>
                </div>
            </div>
            
            <div class="note-content">
                <div class="note-text">${note.content.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="note-footer">
                <div class="note-chat-link">
                    <span class="link-label">${platformIcon} Chat:</span>
                    <a href="${note.chatLink}" target="_blank" class="chat-link" title="Mở chat">
                        ${note.chatLink.length > 45 ? note.chatLink.substring(0, 45) + '...' : note.chatLink}
                    </a>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Add stagger animation to new notes
    setTimeout(() => {
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.add('animate-loaded');
        });
    }, 100);
}

// Save notes to localStorage
function saveNotesToStorage() {
    try {
        const dataToSave = {
            ...window.appData,
            notes: window.appData.notes,
            metadata: {
                ...window.appData.metadata,
                lastUpdated: new Date().toISOString()
            }
        };
        localStorage.setItem('pdc_app_data', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error saving notes to localStorage:', error);
        showNotification('Lỗi lưu ghi chú!', 'error');
    }
}

// Load notes from localStorage
function loadNotesFromStorage() {
    try {
        const saved = localStorage.getItem('pdc_app_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.notes && Array.isArray(parsed.notes)) {
                window.appData.notes = parsed.notes;
            }
        }
    } catch (error) {
        console.error('Error loading notes from localStorage:', error);
        window.appData.notes = [];
    }
}

// Update notes tab (called from main app)
function updateNotesTab() {
    renderNotesList();
}
window.updateNotesTab = updateNotesTab;
