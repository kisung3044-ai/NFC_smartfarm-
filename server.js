// --- 1. 설정 및 데이터 보관소 ---
const CORRECT_ID = 'yudonggun0826';
const CORRECT_PW = '080826gun!';
const USER_ROLE = '작업자'; 

let loggedInUser = null; 

// 데이터를 담을 그릇 (페이지가 켜질 때 저장된 내용을 채워넣음)
const dataStore = {
    'access-log': [],
    'env-data': [],
    'facility-status': [],
    'crop-info': [],
    'pest-record': [],
    'op-record': []
};

// --- 2. 페이지 로드 시 실행 (저장된 데이터 불러오기) ---
window.onload = function() {
    loadAllData(); // 저장된 데이터 불러오기
    
    // (선택사항) 이전에 로그인했다면 바로 대시보드 보여주기
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);
        showDashboard();
        renderAllTables();
    }
};

// LocalStorage에서 데이터를 꺼내와서 dataStore에 채우는 함수
function loadAllData() {
    for (const key in dataStore) {
        const savedData = localStorage.getItem(key);
        if (savedData) {
            dataStore[key] = JSON.parse(savedData);
        }
    }
}

// --- 3. 로그인 및 화면 전환 ---
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const userId = document.getElementById('user-id').value;
    const userPw = document.getElementById('user-pw').value;
    const msg = document.getElementById('login-message');

    if (userId === CORRECT_ID && userPw === CORRECT_PW) {
        loggedInUser = { id: userId, role: USER_ROLE };
        
        // 로그인 정보 유지 (새로고침 해도 로그인 상태 유지)
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

        msg.textContent = '로그인 성공!';
        msg.style.color = '#2ecc71'; 
        
        showDashboard();
        renderAllTables(); // 저장되어 있던 표 그리기
    } else {
        msg.textContent = 'ID 또는 비밀번호가 일치하지 않습니다.';
        msg.style.color = 'red';
    }
});

document.getElementById('logout-btn').addEventListener('click', function() {
    loggedInUser = null;
    localStorage.removeItem('currentUser'); // 로그인 정보 삭제

    document.getElementById('main-dashboard').style.display = 'none';
    document.getElementById('main-dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-screen').classList.add('active');
    
    document.getElementById('user-id').value = '';
    document.getElementById('user-pw').value = '';
    document.getElementById('login-message').textContent = '';
});

function showDashboard() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('hidden');
    
    const dashboard = document.getElementById('main-dashboard');
    dashboard.classList.remove('hidden');
    dashboard.style.display = 'block'; 
    
    document.getElementById('current-user').textContent = `사용자: ${loggedInUser.id} (${loggedInUser.role})`;
}

// 사이드바 메뉴 클릭 시 화면 전환
document.querySelectorAll('#sidebar li').forEach(item => {
    item.addEventListener('click', function() {
        // 기존 활성화 클래스 제거
        document.querySelector('#sidebar li.active').classList.remove('active');
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.add('hidden');
            sec.classList.remove('active');
        });

        // 클릭한 항목 활성화
        this.classList.add('active');
        const targetId = this.getAttribute('data-section');
        const targetSection = document.getElementById(targetId);
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    });
});

// --- 4. 핵심 기능: 데이터 기록 및 영구 저장 ---

function recordData(sectionId, actionType = '') {
    if (!loggedInUser) {
        alert("로그인이 필요합니다.");
        return;
    }

    const now = new Date().toLocaleString();
    let newData = { timestamp: now };
    let isValid = true;
    
    // 각 항목별 입력값 가져오기
    if (sectionId === 'access-log') {
        newData.userId = loggedInUser.id;
        newData.action = actionType;
    } else if (sectionId === 'env-data') {
        newData.temp = document.getElementById('env-temp').value;
        newData.humi = document.getElementById('env-humi').value;
        newData.light = document.getElementById('env-light').value;
        if(!newData.temp || !newData.humi || !newData.light) isValid = false;
    } else if (sectionId === 'facility-status') {
        newData.name = document.getElementById('fac-name').value;
        newData.status = document.getElementById('fac-status').value;
        newData.memo = document.getElementById('fac-memo').value;
        if(!newData.name) isValid = false;
    } else if (sectionId === 'crop-info') {
        newData.name = document.getElementById('crop-name').value;
        newData.stage = document.getElementById('crop-stage').value;
        newData.health = document.getElementById('crop-health').value;
        if(!newData.name) isValid = false;
    } else if (sectionId === 'pest-record') {
        newData.type = document.getElementById('pest-type').value;
        newData.loc = document.getElementById('pest-loc').value;
        newData.severity = document.getElementById('pest-severity').value;
        if(!newData.type) isValid = false;
    } else if (sectionId === 'op-record') {
        newData.task = document.getElementById('op-task').value;
        newData.time = document.getElementById('op-time').value;
        newData.worker = document.getElementById('op-worker').value;
        if(!newData.task) isValid = false;
    }

    if (!isValid) {
        alert("필수 항목을 모두 입력해주세요.");
        return;
    }

    // 1. 데이터 리스트에 추가
    dataStore[sectionId].push(newData);
    
    // 2. 브라우저 저장소(Local Storage)에 영구 저장 (핵심!)
    localStorage.setItem(sectionId, JSON.stringify(dataStore[sectionId]));

    // 3. 화면 갱신
    renderAllTables();
    
    alert("✅ 기록이 저장되었습니다. (새로고침해도 유지됩니다)");
}

// '기록 저장' 버튼용 함수 (수동 저장도 가능하게)
function saveData(sectionId) {
    localStorage.setItem(sectionId, JSON.stringify(dataStore[sectionId]));
    alert("현재 상태가 안전하게 저장되었습니다.");
}

// 현재 시간 1초마다 업데이트
setInterval(() => {
    const timeBox = document.getElementById('access-current-time');
    if (timeBox) timeBox.textContent = new Date().toLocaleString();
}, 1000);
// =========================================================
// [추가] renderAllTables 함수 (기존 함수를 덮어쓰고 삭제 버튼을 추가합니다.)
// =========================================================

function renderAllTables() {
    // 기존의 dataStore 변수와 목록을 사용합니다.
    for (const sectionId in dataStore) {
        const tableBody = document.getElementById(`${sectionId}-table`);
        if (!tableBody) continue;
        
        tableBody.innerHTML = ''; // 초기화

        const list = dataStore[sectionId]; 
        
        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            const row = tableBody.insertRow();
            
            // 데이터 항목별로 행 내용 채우기 (기존 로직과 동일)
            if (sectionId === 'access-log') {
                row.innerHTML = `<td>${data.timestamp}</td><td>${data.userId}</td><td>${data.action}</td>`;
            } else if (sectionId === 'env-data') {
                row.innerHTML = `<td>${data.timestamp}</td><td>${data.temp}°C</td><td>${data.humi}%</td><td>${data.light} Lux</td>`;
            } else if (sectionId === 'facility-status') {
                row.innerHTML = `<td>${data.timestamp}</td><td>${data.name}</td><td>${data.status}</td><td>${data.memo}</td>`;
            } else if (sectionId === 'crop-info') {
                row.innerHTML = `<td>${data.timestamp}</td><td>${data.name}</td><td>${data.stage}</td><td>${data.health}</td>`;
            } else if (sectionId === 'pest-record') {
                row.innerHTML = `<td>${data.timestamp}</td><td>${data.type}</td><td>${data.loc}</td><td>${data.severity}</td>`;
            } else if (sectionId === 'op-record') {
                row.innerHTML = `<td>${data.timestamp}</td><td>${data.task}</td><td>${data.time}분</td><td>${data.worker}명</td>`;
            }
            
            // ⚠️ [삭제 버튼 추가]: 클릭 시 deleteRecord 함수 호출
            row.innerHTML += `<td><button onclick="deleteRecord('${sectionId}', ${i})" class="delete-btn">삭제</button></td>`;
        }
    }
}
// =========================================================
// [추가] deleteRecord 함수 (실제 삭제 처리 로직)
// =========================================================

function deleteRecord(sectionId, index) {
    if (!loggedInUser) {
        alert("로그인이 필요합니다.");
        return;
    }

    // 사용자에게 삭제 확인 받기
    if (confirm("정말로 이 기록을 삭제하시겠습니까?")) {
        // 1. dataStore 배열에서 해당 인덱스의 항목을 제거
        dataStore[sectionId].splice(index, 1);

        // 2. Local Storage에도 변경 사항을 즉시 반영 (영구 삭제)
        localStorage.setItem(sectionId, JSON.stringify(dataStore[sectionId]));

        // 3. 화면을 다시 그려 변경 사항을 즉시 표시
        renderAllTables();
        
        alert("기록이 삭제되었습니다. (새로고침해도 적용됩니다.)");
    }
}
