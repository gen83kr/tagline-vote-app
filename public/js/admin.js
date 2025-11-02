// 멤버 목록 로드
async function loadMembers() {
  try {
    const response = await fetch('/api/members');
    const members = await response.json();

    const membersList = document.getElementById('membersList');
    if (members.length === 0) {
      membersList.innerHTML = '<p class="empty-message">등록된 멤버가 없습니다.</p>';
      return;
    }

    membersList.innerHTML = members.map(member => `
      <div class="member-item">
        <span class="member-name">${member.name}</span>
        <button onclick="deleteMember('${member.id}')" class="btn btn-danger btn-small">삭제</button>
      </div>
    `).join('');
  } catch (error) {
    alert('멤버 목록을 불러오는데 실패했습니다.');
  }
}

// 멤버 추가
async function addMember() {
  const input = document.getElementById('memberInput');
  const name = input.value.trim();

  if (!name) {
    alert('멤버 이름을 입력해주세요.');
    return;
  }

  if (!name.includes('/')) {
    alert('팀이름/닉네임 형식으로 입력해주세요.');
    return;
  }

  try {
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      input.value = '';
      loadMembers();
    } else {
      const error = await response.json();
      alert(error.error || '멤버 추가에 실패했습니다.');
    }
  } catch (error) {
    alert('멤버 추가에 실패했습니다.');
  }
}

// 멤버 삭제
async function deleteMember(id) {
  if (!confirm('정말 삭제하시겠습니까?')) {
    return;
  }

  try {
    const response = await fetch(`/api/members/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadMembers();
    } else {
      alert('멤버 삭제에 실패했습니다.');
    }
  } catch (error) {
    alert('멤버 삭제에 실패했습니다.');
  }
}

// 투표 생성
async function createVote() {
  const month = document.getElementById('monthInput').value;
  const week = document.getElementById('weekInput').value;

  if (!month || !week) {
    alert('월과 주차를 입력해주세요.');
    return;
  }

  try {
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, week })
    });

    if (response.ok) {
      const data = await response.json();

      // QR코드 자동 표시
      await showQRCode(data.id);

      document.getElementById('monthInput').value = '';
      document.getElementById('weekInput').value = '';
      loadVotes();
    } else {
      const error = await response.json();
      alert(error.error || '투표 생성에 실패했습니다.');
    }
  } catch (error) {
    alert('투표 생성에 실패했습니다.');
  }
}

// QR코드 표시
async function showQRCode(voteId) {
  try {
    console.log('[Admin] QR코드 생성 요청:', voteId);
    const response = await fetch(`/api/votes/${voteId}/qrcode`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Admin] QR코드 데이터 수신:', data.url);

    // 모달 생성 및 표시
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
      <div class="qr-modal-content">
        <div class="qr-modal-header">
          <h2>📱 투표 QR코드</h2>
          <button class="qr-close-btn" onclick="closeQRModal()">&times;</button>
        </div>
        <div class="qr-modal-body">
          <div class="qr-code-container">
            <img src="${data.qrCode}" alt="QR Code" id="qrCodeImage">
          </div>
          <div class="qr-info">
            <p>QR코드를 스캔하여 투표하세요</p>
            <p class="qr-url">${data.url}</p>
          </div>
        </div>
        <div class="qr-modal-footer">
          <button onclick="downloadQRCode('${voteId}')" class="btn btn-primary">
            QR코드 다운로드
          </button>
          <button onclick="closeQRModal()" class="btn btn-secondary">
            닫기
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    console.log('[Admin] QR코드 모달 표시됨');

    // 모달 외부 클릭시 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeQRModal();
      }
    });
  } catch (error) {
    console.error('[Admin] QR코드 생성 실패:', error);
    alert('QR코드 생성에 실패했습니다: ' + error.message);
  }
}

// QR코드 모달 닫기
function closeQRModal() {
  const modal = document.querySelector('.qr-modal');
  if (modal) {
    modal.remove();
  }
}

// QR코드 다운로드
async function downloadQRCode(voteId) {
  try {
    const response = await fetch(`/api/votes/${voteId}/qrcode`);
    const data = await response.json();

    if (response.ok) {
      const link = document.createElement('a');
      link.href = data.qrCode;
      link.download = `vote-qrcode-${voteId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('QR코드가 다운로드되었습니다!');
    }
  } catch (error) {
    alert('QR코드 다운로드에 실패했습니다.');
  }
}

// 투표 목록 로드
async function loadVotes() {
  try {
    console.log('[Admin] 투표 목록 로드 시작');
    const response = await fetch('/api/votes-admin');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const votes = await response.json();
    console.log('[Admin] 투표 목록:', votes.length, '개');

    const votesList = document.getElementById('votesList');
    if (votes.length === 0) {
      votesList.innerHTML = '<p class="empty-message">생성된 투표가 없습니다.</p>';
      return;
    }

    votesList.innerHTML = votes.map(vote => {
      const isOpen = vote.status === 'open';
      const voterCount = vote.voters.length;
      console.log(`[Admin] 투표 ${vote.id}: ${vote.title}, 상태: ${vote.status}, 진행중: ${isOpen}`);

      return `
        <div class="vote-item ${isOpen ? 'vote-open' : 'vote-closed'}">
          <div class="vote-header">
            <h3>${vote.title}</h3>
            <span class="status-badge ${isOpen ? 'status-open' : 'status-closed'}">
              ${isOpen ? '진행중' : '종료'}
            </span>
          </div>
          <div class="vote-info">
            <p>📅 생성일: ${new Date(vote.createdAt).toLocaleString('ko-KR')}</p>
            <p>👥 투표 참여: ${voterCount}명</p>
            ${isOpen ? '' : `
              <p>🏁 종료일: ${new Date(vote.closedAt).toLocaleString('ko-KR')}</p>
            `}
          </div>
          <div class="vote-actions">
            ${isOpen ? `
              <button onclick="showQRCode('${vote.id}')" class="btn btn-primary">QR코드 보기</button>
              <button onclick="closeVote('${vote.id}')" class="btn btn-warning">투표 종료</button>
            ` : `
              <button onclick="viewResults('${vote.id}')" class="btn btn-primary">결과 보기</button>
            `}
            <button onclick="deleteVote('${vote.id}')" class="btn btn-danger">삭제</button>
          </div>
        </div>
      `;
    }).join('');

    console.log('[Admin] 투표 목록 렌더링 완료');
  } catch (error) {
    console.error('[Admin] 투표 목록 로드 실패:', error);
    alert('투표 목록을 불러오는데 실패했습니다: ' + error.message);
  }
}

// 투표 종료
async function closeVote(id) {
  if (!confirm('투표를 종료하시겠습니까? 종료 후에는 더 이상 투표할 수 없습니다.')) {
    return;
  }

  try {
    const response = await fetch(`/api/votes/${id}/close`, {
      method: 'POST'
    });

    if (response.ok) {
      alert('투표가 종료되었습니다.');
      loadVotes();
    } else {
      alert('투표 종료에 실패했습니다.');
    }
  } catch (error) {
    alert('투표 종료에 실패했습니다.');
  }
}

// 투표 삭제
async function deleteVote(id) {
  if (!confirm('정말 이 투표를 삭제하시겠습니까?\n삭제된 투표는 복구할 수 없습니다.')) {
    return;
  }

  try {
    console.log('[Admin] 투표 삭제 요청:', id);
    const response = await fetch(`/api/votes/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '투표 삭제에 실패했습니다.');
    }

    const result = await response.json();
    console.log('[Admin] 투표 삭제 완료:', result.message);
    alert('투표가 삭제되었습니다.');
    loadVotes();
  } catch (error) {
    console.error('[Admin] 투표 삭제 실패:', error);
    alert('투표 삭제에 실패했습니다: ' + error.message);
  }
}

// 결과 보기
function viewResults(id) {
  window.location.href = `/results.html?id=${id}`;
}

// Enter 키 이벤트
document.getElementById('memberInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addMember();
  }
});

document.getElementById('weekInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    createVote();
  }
});

// 탭 전환 함수
function switchTab(tabName) {
  // 모든 탭 버튼과 콘텐츠에서 active 클래스 제거
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // 선택된 탭 활성화
  event.target.classList.add('active');
  document.getElementById(tabName + 'Tab').classList.add('active');
}

// 페이지 로드 시 실행
console.log('[Admin] 관리자 페이지 로드됨');
loadMembers();
loadVotes();
