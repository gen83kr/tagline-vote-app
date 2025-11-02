const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

// Initialize data files
async function initDataFiles() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(MEMBERS_FILE);
  } catch {
    await fs.writeFile(MEMBERS_FILE, JSON.stringify([]));
  }

  try {
    await fs.access(VOTES_FILE);
  } catch {
    await fs.writeFile(VOTES_FILE, JSON.stringify([]));
  }
}

// Helper functions
async function readMembers() {
  const data = await fs.readFile(MEMBERS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeMembers(members) {
  await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2));
}

async function readVotes() {
  const data = await fs.readFile(VOTES_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeVotes(votes) {
  await fs.writeFile(VOTES_FILE, JSON.stringify(votes, null, 2));
}

// API Routes

// Members API
app.get('/api/members', async (req, res) => {
  try {
    const members = await readMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: '멤버 목록을 불러오는데 실패했습니다.' });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.includes('/')) {
      return res.status(400).json({ error: '팀이름/닉네임 형식으로 입력해주세요.' });
    }

    const members = await readMembers();
    const newMember = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    members.push(newMember);
    await writeMembers(members);
    res.json(newMember);
  } catch (error) {
    res.status(500).json({ error: '멤버 추가에 실패했습니다.' });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let members = await readMembers();
    members = members.filter(m => m.id !== id);
    await writeMembers(members);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '멤버 삭제에 실패했습니다.' });
  }
});

// Votes API
app.post('/api/votes', async (req, res) => {
  try {
    const { title, month, week } = req.body;
    const members = await readMembers();

    if (members.length === 0) {
      return res.status(400).json({ error: '먼저 멤버를 추가해주세요.' });
    }

    const votes = await readVotes();
    const voteId = uuidv4();
    const newVote = {
      id: voteId,
      title: title || `${month}월 ${week}주차 태그라인 선정`,
      month,
      week,
      members: members.map(m => ({ ...m, votes: 0 })),
      voters: [],
      status: 'open', // open, closed
      createdAt: new Date().toISOString(),
      closedAt: null
    };

    votes.push(newVote);
    await writeVotes(votes);
    res.json({ id: voteId, link: `/vote.html?id=${voteId}` });
  } catch (error) {
    res.status(500).json({ error: '투표 생성에 실패했습니다.' });
  }
});

app.get('/api/votes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await readVotes();
    const vote = votes.find(v => v.id === id);

    if (!vote) {
      return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    }

    // 투표 진행 중에는 투표 결과 숨기기
    if (vote.status === 'open') {
      const sanitizedVote = {
        ...vote,
        members: vote.members.map(m => ({ id: m.id, name: m.name }))
      };
      res.json(sanitizedVote);
    } else {
      res.json(vote);
    }
  } catch (error) {
    res.status(500).json({ error: '투표 정보를 불러오는데 실패했습니다.' });
  }
});

app.post('/api/votes/:id/cast', async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedMembers } = req.body;

    if (!selectedMembers || !Array.isArray(selectedMembers)) {
      return res.status(400).json({ error: '잘못된 요청입니다.' });
    }

    if (selectedMembers.length === 0 || selectedMembers.length > 2) {
      return res.status(400).json({ error: '1명 또는 2명을 선택해주세요.' });
    }

    const votes = await readVotes();
    const voteIndex = votes.findIndex(v => v.id === id);

    if (voteIndex === -1) {
      return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    }

    const vote = votes[voteIndex];

    if (vote.status !== 'open') {
      return res.status(400).json({ error: '종료된 투표입니다.' });
    }

    // 투표 처리 (무기명)
    selectedMembers.forEach(memberName => {
      const member = vote.members.find(m => m.name === memberName);
      if (member) {
        member.votes += 1;
      }
    });

    // 익명 투표 기록 (통계 목적)
    vote.voters.push({
      selectedMembers,
      votedAt: new Date().toISOString()
    });

    votes[voteIndex] = vote;
    await writeVotes(votes);

    res.json({ success: true, message: '투표가 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '투표 처리에 실패했습니다.' });
  }
});

app.post('/api/votes/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await readVotes();
    const voteIndex = votes.findIndex(v => v.id === id);

    if (voteIndex === -1) {
      return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    }

    votes[voteIndex].status = 'closed';
    votes[voteIndex].closedAt = new Date().toISOString();
    await writeVotes(votes);

    res.json({ success: true, results: votes[voteIndex] });
  } catch (error) {
    res.status(500).json({ error: '투표 종료에 실패했습니다.' });
  }
});

app.get('/api/votes/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await readVotes();
    const vote = votes.find(v => v.id === id);

    if (!vote) {
      return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    }

    if (vote.status !== 'closed') {
      return res.status(400).json({ error: '진행 중인 투표입니다.' });
    }

    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: '결과를 불러오는데 실패했습니다.' });
  }
});

app.get('/api/archives', async (req, res) => {
  try {
    const votes = await readVotes();
    const closedVotes = votes
      .filter(v => v.status === 'closed')
      .sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt));
    res.json(closedVotes);
  } catch (error) {
    res.status(500).json({ error: '아카이브를 불러오는데 실패했습니다.' });
  }
});

app.get('/api/votes-admin', async (req, res) => {
  try {
    const votes = await readVotes();
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: '투표 목록을 불러오는데 실패했습니다.' });
  }
});

app.delete('/api/votes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let votes = await readVotes();
    const voteToDelete = votes.find(v => v.id === id);

    if (!voteToDelete) {
      return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    }

    votes = votes.filter(v => v.id !== id);
    await writeVotes(votes);
    res.json({ success: true, message: '투표가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '투표 삭제에 실패했습니다.' });
  }
});

app.get('/api/votes/:id/qrcode', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await readVotes();
    const vote = votes.find(v => v.id === id);

    if (!vote) {
      return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    }

    const voteUrl = `${req.protocol}://${req.get('host')}/vote.html?id=${id}`;

    // QR코드를 Data URL로 생성
    const qrCodeDataUrl = await QRCode.toDataURL(voteUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2
    });

    res.json({ qrCode: qrCodeDataUrl, url: voteUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'QR코드 생성에 실패했습니다.' });
  }
});

// Start server
async function start() {
  await initDataFiles();
  app.listen(PORT, () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  태그라인 투표 시스템이 시작되었습니다!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔗 관리자 페이지: http://localhost:${PORT}/admin.html
  📊 아카이브: http://localhost:${PORT}/archive.html

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
}

start();
