// 아카이브 목록 로드
async function loadArchives() {
  try {
    const response = await fetch('/api/archives');
    const archives = await response.json();

    const archivesList = document.getElementById('archivesList');

    if (archives.length === 0) {
      archivesList.innerHTML = '<p class="empty-message">아카이브된 투표가 없습니다.</p>';
      return;
    }

    archivesList.innerHTML = archives.map(vote => {
      const winner = [...vote.members].sort((a, b) => b.votes - a.votes)[0];
      const voterCount = vote.voters.length;

      return `
        <div class="archive-item" onclick="viewArchive('${vote.id}')">
          <div class="archive-header">
            <h3>${vote.title}</h3>
            <span class="archive-date">
              ${new Date(vote.closedAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <div class="archive-summary">
            <div class="archive-winner">
              <span class="winner-label">🏆 1위</span>
              <span class="winner-name">${winner.name}</span>
              <span class="winner-votes">${winner.votes}표</span>
            </div>
            <div class="archive-meta">
              <span>👥 ${voterCount}명 참여</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    document.getElementById('archivesList').innerHTML = `
      <p class="error-message">아카이브를 불러오는데 실패했습니다.</p>
    `;
  }
}

// 아카이브 상세 보기
function viewArchive(id) {
  window.location.href = `/results.html?id=${id}`;
}

// 페이지 로드 시 실행
loadArchives();
