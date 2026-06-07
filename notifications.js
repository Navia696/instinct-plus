// notifications.js - универсальные уведомления для всех страниц

let notificationUnsubscribe = null;
let currentUserId = null;

// ========== ФУНКЦИЯ ОТПРАВКИ УВЕДОМЛЕНИЙ ==========
async function sendNotification(toUserId, type, fromUserId, postId = null, message = null) {
    if (!toUserId || toUserId === currentUserId) return;
    
    try {
        const fromUserSnap = await db.ref(`users/${fromUserId}`).once('value');
        const fromUser = fromUserSnap.val() || {};
        const fromName = fromUser.nickname || fromUser.name || 'Користувач';
        
        let notificationMessage = '';
        
        switch(type) {
            case 'like':
                notificationMessage = `${fromName} лайкнув ваш пост`;
                break;
            case 'comment':
                const commentText = message ? message.substring(0, 50) : '';
                notificationMessage = `${fromName} прокоментував: "${commentText}"`;
                break;
            case 'match':
                notificationMessage = `💘 У вас новий мeтч з ${fromName}! Напишіть першим`;
                break;
            case 'message':
                const msgText = message ? message.substring(0, 50) : '';
                notificationMessage = `${fromName}: ${msgText}`;
                break;
        }
        
        await db.ref(`notifications/${toUserId}`).push({
            message: notificationMessage,
            type: type,
            fromUserId: fromUserId,
            postId: postId || null,
            read: false,
            createdAt: Date.now()
        });
        
        console.log(`✅ Уведомление отправлено: ${notificationMessage}`);
    } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
    }
}
// ================================================

function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    }
}

function loadNotifications() {
    if (!currentUserId) return;
    
    const notificationsRef = db.ref(`notifications/${currentUserId}`).orderByChild('createdAt').limitToLast(30);
    
    if (notificationUnsubscribe) {
        notificationUnsubscribe();
    }
    
    notificationUnsubscribe = notificationsRef.on('value', (snapshot) => {
        const notifications = [];
        snapshot.forEach(child => {
            notifications.push({ id: child.key, ...child.val() });
        });
        notifications.reverse();
        
        const unreadCount = notifications.filter(n => !n.read).length;
        updateNotificationBadge(unreadCount);
        
        const list = document.getElementById('notificationsList');
        if (list) {
            list.innerHTML = '';
            if (notifications.length === 0) {
                list.innerHTML = '<div style="padding:15px; color:#999; text-align:center;">📭 Немає сповіщень</div>';
            } else {
                notifications.forEach(notif => {
                    const div = document.createElement('div');
                    div.className = `notification-item ${notif.read ? '' : 'unread'}`;
                    div.innerHTML = `
                        <div>${escapeHtml(notif.message)}</div>
                        <div class="notification-time">${getTimeAgo(notif.createdAt)}</div>
                    `;
                    div.onclick = async () => {
                        await db.ref(`notifications/${currentUserId}/${notif.id}`).update({ read: true });
                        if (notif.type === 'match' && notif.fromUserId) {
                            sessionStorage.setItem('openChatWith', notif.fromUserId);
                            location.href = 'chat.html';
                        } else if (notif.type === 'like' && notif.fromUserId) {
                            sessionStorage.setItem('viewingUserId', notif.fromUserId);
                            location.href = 'profile.html';
                        } else if (notif.type === 'message' && notif.fromUserId) {
                            sessionStorage.setItem('openChatWith', notif.fromUserId);
                            location.href = 'chat.html';
                        } else if (notif.type === 'comment' && notif.postId) {
                            location.href = 'home.html';
                        }
                        div.classList.remove('unread');
                        loadNotifications();
                    };
                    list.appendChild(div);
                });
            }
        }
    });
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'щойно';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'щойно';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} хв тому`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} год тому`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн тому`;
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function initNotifications(userId) {
    currentUserId = userId;
    loadNotifications();
    
    db.ref(`notifications/${userId}`).on('child_added', () => {
        loadNotifications();
    });
}

function toggleNotifications(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
            loadNotifications();
        }
    }
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notificationsDropdown');
    const bell = document.querySelector('.notification-bell');
    if (bell && dropdown && !bell.contains(e.target) && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});