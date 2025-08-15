// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase, ref, set, update, onValue, get, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyAxfI5QuHkWsH4gFm5dCwNIdnEWEBM-uQ0",
  authDomain: "wansuishan-c0663.firebaseapp.com",
  projectId: "wansuishan-c0663",
  storageBucket: "wansuishan-c0663.firebasestorage.app",
  messagingSenderId: "970889063832",
  appId: "1:970889063832:web:938587550b5f965c320fed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM元素
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const userRoleSpan = document.getElementById('user-role');
const adminPanel = document.getElementById('admin-panel');
const superAdminPanel = document.getElementById('super-admin-panel');
const showList = document.getElementById('show-list');

// 场次信息
const shows = [
    { id: 'zjz1', name: '祝家庄一场', time: '09:00', description: '祝家庄表演一场' },
    { id: 'zjz2', name: '祝家庄二场', time: '11:00', description: '祝家庄表演二场' },
    { id: 'zjz3', name: '祝家庄三场', time: '13:00', description: '祝家庄表演三场' },
    { id: 'dth1', name: '打铁花一场', time: '15:00', description: '打铁花表演一场' },
    { id: 'dth2', name: '打铁花二场', time: '17:00', description: '打铁花表演二场' },
    { id: 'dth3', name: '打铁花三场', time: '19:00', description: '打铁花表演三场' }
];

// 当前用户信息
let currentUser = null;
let currentUserRole = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
// 检查用户认证状态
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            loadUserInfo(user.uid);
            showApp();
        } else {
            showAuth();
        }
    });

    // 登录表单提交事件
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                // 登录成功
                currentUser = userCredential.user;
                loadUserInfo(userCredential.user.uid);
                showApp();
            })
            .catch(error => {
                alert('登录失败: ' + error.message);
            });
    });

    // 注册表单提交事件
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const inviteCode = document.getElementById('invite-code').value;
        
        // 验证邀请码
        validateInviteCode(inviteCode)
            .then(role => {
                if (role) {
                    // 创建用户账户
return createUserWithEmailAndPassword(auth, email, password)
                        .then(userCredential => {
                            // 保存用户信息到数据库
                            const userId = userCredential.user.uid;
return set(ref(database, 'users/' + userId), {
                                email: email,
                                role: role,
                                createdAt: serverTimestamp()
                            }).then(() => {
                                // 标记邀请码已使用
                                return update(ref(database, 'inviteCodes/' + inviteCode), {
                                    used: true,
                                    usedBy: userId,
                                    usedAt: serverTimestamp()
                                });
                            });
                        });
                } else {
                    throw new Error('无效的邀请码');
                }
            })
            .then(() => {
                alert('注册成功！请重新登录。');
                registerForm.reset();
            })
            .catch(error => {
                alert('注册失败: ' + error.message);
            });
    });

    // 登出按钮事件
    logoutBtn.addEventListener('click', function() {
signOut(auth)
            .then(() => {
                currentUser = null;
                currentUserRole = null;
                showAuth();
            })
            .catch(error => {
                alert('登出失败: ' + error.message);
            });
    });
});

// 显示认证界面
function showAuth() {
    authSection.style.display = 'block';
    appSection.style.display = 'none';
}

// 显示应用界面
function showApp() {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    userNameSpan.textContent = currentUser.email;
    userRoleSpan.textContent = getUserRoleDisplay(currentUserRole);
    
    // 根据用户角色显示相应面板
    if (currentUserRole === 'admin') {
        adminPanel.style.display = 'block';
        superAdminPanel.style.display = 'none';
    } else if (currentUserRole === 'superAdmin') {
        adminPanel.style.display = 'block';
        superAdminPanel.style.display = 'block';
    } else {
        adminPanel.style.display = 'none';
        superAdminPanel.style.display = 'none';
    }
    
    // 加载场次信息
    loadShows();
}

// 加载用户信息
function loadUserInfo(userId) {
get(ref(database, 'users/' + userId))
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                currentUserRole = userData.role;
                userNameSpan.textContent = currentUser.email;
                userRoleSpan.textContent = getUserRoleDisplay(currentUserRole);
                
                // 根据用户角色显示相应面板
                if (currentUserRole === 'admin') {
                    adminPanel.style.display = 'block';
                    superAdminPanel.style.display = 'none';
                } else if (currentUserRole === 'superAdmin') {
                    adminPanel.style.display = 'block';
                    superAdminPanel.style.display = 'block';
                } else {
                    adminPanel.style.display = 'none';
                    superAdminPanel.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('加载用户信息失败:', error);
        });
}

// 获取用户角色显示名称
function getUserRoleDisplay(role) {
    switch(role) {
        case 'superAdmin': return '超级管理员';
        case 'admin': return '管理员';
        case 'ticketUser': return '抢票人';
        default: return '未知';
    }
}

// 验证邀请码
function validateInviteCode(code) {
return get(ref(database, 'inviteCodes/' + code))
        .then(snapshot => {
            const codeData = snapshot.val();
            if (codeData && !codeData.used) {
                return codeData.role;
            }
            return null;
        });
}

// 加载场次信息
function loadShows() {
    showList.innerHTML = '';
    
    // 为每个场次创建HTML元素
    shows.forEach(show => {
        const showElement = document.createElement('div');
        showElement.className = 'show-item';
        showElement.innerHTML = `
            <div class="show-header">
                <div class="show-title">${show.name}</div>
                <div class="show-time">${show.time}</div>
            </div>
            <div class="show-description">${show.description}</div>
            <div class="show-actions">
                <div class="availability available">剩余名额: <span id="availability-${show.id}">20</span>/20</div>
                <button class="accept-btn" id="accept-${show.id}" data-show="${show.id}">接受预约</button>
            </div>
        `;
        showList.appendChild(showElement);
        
        // 加载场次预约信息
        loadShowAvailability(show.id);
    });
    
    // 添加预约按钮事件监听器
    document.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', function() {
            const showId = this.getAttribute('data-show');
            acceptShow(showId);
        });
    });
}

// 加载场次预约信息
function loadShowAvailability(showId) {
onValue(ref(database, 'shows/' + showId + '/acceptedUsers'), snapshot => {
        const acceptedUsers = snapshot.val() || {};
        const count = Object.keys(acceptedUsers).length;
        const remaining = 20 - count;
        
        const availabilityElement = document.getElementById(`availability-${showId}`);
        if (availabilityElement) {
            availabilityElement.textContent = remaining;
            availabilityElement.parentElement.className = remaining > 0 ? 'availability available' : 'availability full';
        }
        
        const acceptButton = document.getElementById(`accept-${showId}`);
        if (acceptButton) {
            acceptButton.disabled = remaining <= 0;
            acceptButton.textContent = remaining > 0 ? '接受预约' : '已满';
        }
    });
}

// 接受场次预约
function acceptShow(showId) {
    if (!currentUser) return;
    
// 检查用户是否已经有预约
    get(ref(database, 'userReservations/' + currentUser.uid))
        .then(snapshot => {
            const reservations = snapshot.val() || {};
            if (Object.keys(reservations).length >= 1) {
                alert('您已经有一个预约，不能重复预约！');
                return;
            }
            
// 检查场次是否还有名额
            return get(ref(database, 'shows/' + showId + '/acceptedUsers'))
                .then(snapshot => {
                    const acceptedUsers = snapshot.val() || {};
                    const count = Object.keys(acceptedUsers).length;
                    
                    if (count >= 20) {
                        alert('该场次已满，无法预约！');
                        return;
                    }
                    
// 添加预约
                    const updates = {};
                    updates[`shows/${showId}/acceptedUsers/${currentUser.uid}`] = true;
                    updates[`userReservations/${currentUser.uid}/${showId}`] = true;
                    
                    return update(ref(database), updates)
                        .then(() => {
                            alert('预约成功！');
                        });
                });
        })
        .catch(error => {
            alert('预约失败: ' + error.message);
        });
}

// 初始化数据库（仅超级管理员可用）
function initializeDatabase() {
    if (currentUserRole !== 'superAdmin') return;
    
    // 初始化场次数据
    const updates = {};
    shows.forEach(show => {
        updates[`shows/${show.id}`] = {
            id: show.id,
            name: show.name,
            time: show.time,
            description: show.description,
            maxCapacity: 20
        };
    });
    
update(ref(database), updates)
        .then(() => {
            console.log('数据库初始化完成');
        })
        .catch(error => {
            console.error('数据库初始化失败:', error);
        });
}

// 生成邀请码（仅超级管理员可用）
function generateInviteCode(role) {
    if (currentUserRole !== 'superAdmin') return;
    
    const code = generateRandomCode();
    const newCodeRef = database.ref('inviteCodes/' + code);
    
set(ref(database, 'inviteCodes/' + code), {
        code: code,
        role: role,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        used: false
    })
    .then(() => {
        alert(`邀请码生成成功: ${code}`);
    })
    .catch(error => {
        alert('生成邀请码失败: ' + error.message);
    });
}

// 生成随机邀请码
function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
