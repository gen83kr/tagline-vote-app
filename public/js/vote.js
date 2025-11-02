let voteData = null;
let selectedMembers = [];

// URL에서 투표 ID 가져오기
function getVoteId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// 투표 정보 로드
async function loadVote() {
  const voteId = getVoteId();

  if (!voteId) {
    showError('잘못된 접근입니다.');
    return;
  }

  try {
    const response = await fetch(`/api/votes/${voteId}`);

    if (!response.ok) {
      showError('투표를 찾을 수 없습니다.');
      return;
    }

    voteData = await response.json();

    if (voteData.status !== 'open') {
      showError('이미 종료된 투표입니다.');
      return;
    }

    displayVoteForm();
  } catch (error) {
    showError('투표 정보를 불러오는데 실패했습니다.');
  }
}

// 투표 폼 표시
function displayVoteForm() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('voteForm').style.display = 'block';
  document.getElementById('voteTitle').textContent = voteData.title;

  const memberOptions = document.getElementById('memberOptions');
  memberOptions.innerHTML = voteData.members.map(member => `
    <div class="member-option">
      <label>
        <input
          type="checkbox"
          value="${member.name}"
          onchange="toggleMember('${member.name}')"
        >
        <span class="member-label">${member.name}</span>
      </label>
    </div>
  `).join('');
}

// 멤버 선택/해제
function toggleMember(memberName) {
  const index = selectedMembers.indexOf(memberName);

  if (index > -1) {
    selectedMembers.splice(index, 1);
  } else {
    if (selectedMembers.length >= 2) {
      alert('최대 2명까지만 선택 가능합니다.');
      // 체크박스 해제
      const checkbox = document.querySelector(`input[value="${memberName}"]`);
      checkbox.checked = false;
      return;
    }
    selectedMembers.push(memberName);
  }
}

// 투표 제출
async function submitVote() {
  const voterName = document.getElementById('voterName').value.trim();

  // 유효성 검사
  if (!voterName) {
    alert('이름을 입력해주세요.');
    return;
  }

  if (!voterName.includes('/')) {
    alert('팀이름/닉네임 형식으로 입력해주세요.');
    return;
  }

  if (selectedMembers.length === 0) {
    alert('최소 1명을 선택해주세요.');
    return;
  }

  if (selectedMembers.length > 2) {
    alert('최대 2명까지만 선택 가능합니다.');
    return;
  }

  // 본인 투표 확인
  if (selectedMembers.includes(voterName)) {
    alert('본인은 선택할 수 없습니다.');
    return;
  }

  // 투표 제출
  try {
    const response = await fetch(`/api/votes/${voteData.id}/cast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterName,
        selectedMembers
      })
    });

    const result = await response.json();

    if (response.ok) {
      showComplete();
    } else {
      alert(result.error || '투표에 실패했습니다.');
    }
  } catch (error) {
    alert('투표 처리 중 오류가 발생했습니다.');
  }
}

// 완료 메시지 표시
function showComplete() {
  document.getElementById('voteForm').style.display = 'none';
  document.getElementById('voteComplete').style.display = 'block';
}

// 에러 메시지 표시
function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('errorMessage').style.display = 'block';
  document.getElementById('errorText').textContent = message;
}

// 페이지 로드 시 실행
loadVote();
