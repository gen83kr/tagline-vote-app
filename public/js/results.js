// URL에서 투표 ID 가져오기
function getVoteId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// 결과 로드
async function loadResults() {
  const voteId = getVoteId();

  if (!voteId) {
    showError('잘못된 접근입니다.');
    return;
  }

  try {
    const response = await fetch(`/api/votes/${voteId}/results`);

    if (!response.ok) {
      const error = await response.json();
      showError(error.error || '결과를 불러올 수 없습니다.');
      return;
    }

    const voteData = await response.json();
    displayResults(voteData);
  } catch (error) {
    showError('결과를 불러오는데 실패했습니다.');
  }
}

// 색상 팔레트 생성
function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40',
    '#36A2EB', '#FFCE56', '#9966FF', '#FF6384', '#4BC0C0'
  ];

  // 1위는 금색으로 강조
  const palette = [...colors];
  palette[0] = '#FFD700'; // Gold color for winner

  return palette.slice(0, count);
}

// 파이 차트 생성
let chartInstance = null;

function createPieChart(sortedMembers) {
  const ctx = document.getElementById('resultsChart');

  // 기존 차트가 있으면 제거
  if (chartInstance) {
    chartInstance.destroy();
  }

  // 득표수가 0인 멤버는 차트에서 제외
  const membersWithVotes = sortedMembers.filter(m => m.votes > 0);

  if (membersWithVotes.length === 0) {
    ctx.parentElement.innerHTML = '<p class="empty-message">아직 투표가 없습니다.</p>';
    return;
  }

  const labels = membersWithVotes.map(m => m.name);
  const data = membersWithVotes.map(m => m.votes);
  const colors = generateColors(membersWithVotes.length);

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  const isWinner = i === 0;

                  return {
                    text: `${isWinner ? '🏆 ' : ''}${label}: ${value}표 (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i,
                    fontColor: isWinner ? '#FFD700' : '#666'
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value}표 (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// 결과 표시
function displayResults(voteData) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('resultsDisplay').style.display = 'block';

  // 제목 및 메타 정보
  document.getElementById('voteTitle').textContent = voteData.title;
  document.getElementById('votePeriod').innerHTML = `
    📅 기간: ${new Date(voteData.createdAt).toLocaleDateString('ko-KR')} ~
    ${new Date(voteData.closedAt).toLocaleDateString('ko-KR')}
  `;
  document.getElementById('voterCount').innerHTML = `
    👥 참여 인원: ${voteData.voters.length}명
  `;

  // 득표 결과 (득표순 정렬)
  const sortedMembers = [...voteData.members].sort((a, b) => b.votes - a.votes);
  const maxVotes = sortedMembers[0]?.votes || 0;

  // 파이 차트 생성
  createPieChart(sortedMembers);

  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = sortedMembers.map((member, index) => {
    const isWinner = index === 0 && member.votes > 0;
    const percentage = maxVotes > 0 ? (member.votes / maxVotes) * 100 : 0;

    return `
      <div class="result-item ${isWinner ? 'result-winner' : ''}">
        <div class="result-rank">
          ${isWinner ? '🏆' : `${index + 1}위`}
        </div>
        <div class="result-info">
          <div class="result-name">${member.name}</div>
          <div class="result-bar-container">
            <div class="result-bar" style="width: ${percentage}%"></div>
          </div>
        </div>
        <div class="result-votes">
          ${member.votes}표
        </div>
      </div>
    `;
  }).join('');

  // 무기명 투표 - 참여자 세부 정보는 표시하지 않음
}

// 에러 메시지 표시
function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('errorMessage').style.display = 'block';
  document.getElementById('errorText').textContent = message;
}

// 페이지 로드 시 실행
loadResults();
