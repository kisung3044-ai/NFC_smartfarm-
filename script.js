// --- 🔒 보안 시스템: 사용자 및 로그인 관리 ---
const CORRECT_ID = 'yudonggun0826';
const CORRECT_PW = '080826gun!';
const USER_ROLE = '작업자'; 

let loggedInUser = null; 

// 현재 데이터를 저장할 임시 데이터 구조 (페이지가 로드될 때 LocalStorage에서 데이터를 불러옴)
const dataStore = {
    'access-log': [],
    'env-data': [],
    'facility-status': [],
    'crop-info': [],
    'pest-record': [],
    'op-record': []
};

// 페이지 로드 시, LocalStorage의 데이터를 불러와 dataStore에 채우는 함수
function loadDataFromLocalStorage() {
    for (const sectionId in dataStore) {
        const storedData = localStorage.getItem(`smartfarm_data_${sectionId}`);
        if (storedData) {
            dataStore[sectionId] = JSON.parse(storedData);
        }
    }
}

// LocalStorage에 있는 모든 데이터를 해당하는 HTML 테이블에 그려주는 함수
function renderAllTables() {
    for (const sectionId in dataStore) {
        const dataList = dataStore[sectionId];
        const tableBody = document.getElementById(`${sectionId}-table`);
        if (!tableBody) continue; 
        
        // 기존 테이블 내용 비우기
        tableBody.innerHTML = ''; 

        // 최신 기록이 위로 오도록 역순으로 테이블에 삽입
        for (let i = dataList.length - 1; i >= 0; i--) {
            const record = dataList[i];
            const newRow = tableBody.insertRow(0);
            
            // 항목별로 테이블 셀 내용 구성
            if (sectionId === 'access-log') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.userId}</td><td>${record.action}</td>`;
            } else if (sectionId === 'env-data') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.temp}°C</td><td>${record.humi}%</td><td>${record.light} Lux</td>`;
            } else if (sectionId === 'facility-status') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.name}</td><td>${record.status}</td><td>${record.memo}</td>`;
            } else if (sectionId === 'crop-info') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.name}</td><td>${record.stage}</td><td>${record.health}</td>`;
            } else if (sectionId === 'pest-record') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.type}</td><td>${record.loc}</td><td>${record.severity}</td>`;
            } else if (sectionId === 'op-record') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.task}</td><td>${record.time}분</td><td>${record.worker}명</td>`;
            }
        }
    }
}


// --- 💻 초기화 및 이벤트 연결 ---

// 1. 페이지 로드 시 데이터 로드
loadDataFromLocalStorage();


document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const userId = document.getElementById('user-id').value;
    const userPw = document.getElementById('user-pw').value;
    const msg = document.getElementById('login-message');

    if (userId === CORRECT_ID && userPw === CORRECT_PW) {
        loggedInUser = { id: userId, role: USER_ROLE };
        msg.textContent = '로그인 성공!';
        msg.style.color = '#2ecc71'; 
        
        // **로그인 성공 시, LocalStorage의 데이터를 테이블에 그립니다.**
        renderAllTables(); 
        
        showDashboard(); 
    } else {
        msg.textContent = 'ID 또는 비밀번호가 일치하지 않습니다.';
        msg.style.color = 'red';
    }
});

document.getElementById('logout-btn').addEventListener('click', function() {
    // ... (로그아웃 로직 생략)
    loggedInUser = null;
    document.getElementById('main-dashboard').style.display = 'none'; 
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('login-message').textContent = ''; 
    document.getElementById('user-pw').value = ''; 
    document.getElementById('user-id').value = ''; 
});

function showDashboard() {
    // ... (대시보드 표시 로직 생략)
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-dashboard').style.display = 'grid'; 
    document.getElementById('current-user').textContent = `사용자: ${loggedInUser.id} (${loggedInUser.role})`;
}

// --- 🌐 메뉴 전환 시스템 (변경 없음) ---
document.querySelectorAll('#sidebar li').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelector('#sidebar li.active').classList.remove('active');
        this.classList.add('active');

        const targetSectionId = this.getAttribute('data-section');
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(targetSectionId).classList.remove('hidden');
    });
});

// --- 💾 핵심 기능: 기록 및 저장 시스템 (renderTable 호출 추가) ---

function recordData(sectionId, type = '입장') {
    if (!loggedInUser) {
        alert("로그인이 필요합니다.");
        return;
    }

    const now = new Date();
    let record = {
        timestamp: now.toLocaleString()
    };
    let isValid = true; 

    // ... (이하 각 항목별 데이터 수집 로직은 이전과 동일)

    if (sectionId === 'access-log') {
        record.userId = loggedInUser.id;
        record.action = type;
    } else if (sectionId === 'env-data') {
        const temp = document.getElementById('env-temp').value;
        const humi = document.getElementById('env-humi').value;
        const light = document.getElementById('env-light').value;
        if (!temp || !humi || !light) { isValid = false; }
        if (isValid) { record.temp = temp; record.humi = humi; record.light = light; }
    } else if (sectionId === 'facility-status') {
        const name = document.getElementById('fac-name').value;
        const status = document.getElementById('fac-status').value;
        const memo = document.getElementById('fac-memo').value;
        if (!name || !status) { isValid = false; }
        if (isValid) { record.name = name; record.status = status; record.memo = memo; }
    } else if (sectionId === 'crop-info') {
        const name = document.getElementById('crop-name').value;
        const stage = document.getElementById('crop-stage').value;
        const health = document.getElementById('crop-health').value;
        if (!name || !stage || !health) { isValid = false; }
        if (isValid) { record.name = name; record.stage = stage; record.health = health; }
    } else if (sectionId === 'pest-record') {
        const type = document.getElementById('pest-type').value;
        const loc = document.getElementById('pest-loc').value;
        const severity = document.getElementById('pest-severity').value;
        if (!type || !loc || !severity) { isValid = false; }
        if (isValid) { record.type = type; record.loc = loc; record.severity = severity; }
    } else if (sectionId === 'op-record') {
        const task = document.getElementById('op-task').value;
        const time = document.getElementById('op-time').value;
        const worker = document.getElementById('op-worker').value;
        if (!task || !time || !worker) { isValid = false; }
        if (isValid) { record.task = task; record.time = time; record.worker = worker; }
    }

    if (!isValid) {
        alert("모든 필수 항목을 입력해주세요.");
        return;
    }

    dataStore[sectionId].push(record); 
    
    // **데이터 기록 후, 테이블을 다시 그립니다.**
    renderAllTables();

    alert(`'${sectionId}' 항목에 데이터가 기록되었습니다. (저장 버튼을 눌러야 임시 저장됩니다.)`);
}

function saveData(sectionId) {
    if (!loggedInUser) {
        alert("로그인이 필요합니다.");
        return;
    }
    
    // Local Storage에 저장
    localStorage.setItem(`smartfarm_data_${sectionId}`, JSON.stringify(dataStore[sectionId]));

    alert(`'${sectionId}' 기록이 브라우저에 임시 저장되었습니다.`);
}

// 현재 시간 업데이트 기능 (변경 없음)
function updateAccessCurrentTime() {
    const timeElement = document.getElementById('access-current-time');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleString();
    }
}
setInterval(updateAccessCurrentTime, 1000);
updateAccessCurrentTime();
// =========================================================
// [추가] A: renderAllTables 함수 (기존 함수를 덮어쓰고 삭제 버튼을 추가합니다.)
// =========================================================

function renderAllTables() {
    for (const sectionId in dataStore) {
        const dataList = dataStore[sectionId];
        const tableBody = document.getElementById(`${sectionId}-table`);
        if (!tableBody) continue; 
        
        // 기존 테이블 내용 비우기
        tableBody.innerHTML = ''; 

        // 최신 기록이 위로 오도록 역순으로 테이블에 삽입
        // 이 루프의 인덱스 i를 deleteRecord 함수에 넘겨 삭제할 대상을 지정합니다.
        for (let i = dataList.length - 1; i >= 0; i--) { 
            const record = dataList[i];
            const newRow = tableBody.insertRow(0); // 0번에 삽입 (최신순)
            
            // 항목별로 테이블 셀 내용 구성
            if (sectionId === 'access-log') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.userId}</td><td>${record.action}</td>`;
            } else if (sectionId === 'env-data') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.temp}°C</td><td>${record.humi}%</td><td>${record.light} Lux</td>`;
            } else if (sectionId === 'facility-status') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.name}</td><td>${record.status}</td><td>${record.memo}</td>`;
            } else if (sectionId === 'crop-info') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.name}</td><td>${record.stage}</td><td>${record.health}</td>`;
            } else if (sectionId === 'pest-record') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.type}</td><td>${record.loc}</td><td>${record.severity}</td>`;
            } else if (sectionId === 'op-record') {
                newRow.innerHTML = `<td>${record.timestamp}</td><td>${record.task}</td><td>${record.time}분</td><td>${record.worker}명</td>`;
            }

            // ⚠️ [추가된 부분]: 삭제 버튼을 포함하는 셀 추가
            newRow.innerHTML += `<td><button onclick="deleteRecord('${sectionId}', ${i})" class="delete-btn">삭제</button></td>`;
        }
    }
}
// =========================================================
// [추가] B: deleteRecord 함수 (실제 삭제 처리 로직)
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

        // 2. Local Storage에도 변경 사항을 즉시 반영 (영구 삭제, 키 이름 일치)
        localStorage.setItem(`smartfarm_data_${sectionId}`, JSON.stringify(dataStore[sectionId]));

        // 3. 화면을 다시 그려 변경 사항을 즉시 표시
        renderAllTables();
        
        alert("기록이 삭제되었습니다. (새로고침해도 적용됩니다.)");
    }
}
