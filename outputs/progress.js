(() => {
  const page = location.pathname.split('/').pop().toLowerCase();
  const pages = {
    '10sinif_biyoloji_senaryo4_calisma_alani.html': { course: 'biology', key: 'bioScenario4Done2026', topicQuiz: true },
    '10sinif_kimya_senaryo4_calisma_alani.html': { course: 'chemistry', key: 'kimyaScenario4Done2026', topicQuiz: true },
    '10sinif_fizik_senaryo4_calisma_alani.html': { course: 'physics', key: 'physicsScenario4Done2026', topicQuiz: true },
    '10sinif_sayfa94_calisma_alani.html': { course: 'math', key: 'math94-progress-v3', topicQuiz: true },
    '10sinif_almanca_neue_stadt_calisma_alani.html': { course: 'german', key: 'deutsch-thema5-s1-done' },
    '10sinif_metin_tahlilleri_calisma_alani.html': { course: 'literature', key: 'tde-metin-tahlili-done' },
    '10sinif_edebiyat_ortak_yazili_calisma_alani.html': { course: 'tdeExam', key: 'tde-ortak-sinav-2026' },
    '10sinif_tarih_senaryo_calisma_alani.html': { course: 'history', key: 'tarihScenario2026Done', topicQuiz: true },
    '10sinif_felsefe_sayfa56_calisma_alani.html': { course: 'philosophy', key: 'philosophy56Done', topicQuiz: true }
  };
  const config = pages[page];
  if (!config) return;

  if (config.course === 'literature') {
    try {
      const migrationKey = 'tde-metin-tahlili-manual-progress-v1';
      if (localStorage.getItem(migrationKey) !== '1') {
        done.clear();
        localStorage.setItem(config.key, '[]');
        localStorage.setItem(migrationKey, '1');
      }
    } catch (_) {}
  }

  const topicIds = () => config.course === 'math'
    ? D.flatMap(group => group.subs).map(topic => topic.id)
    : sections.map(topic => topic.id);
  const completedIds = () => done instanceof Set ? [...done] : [...done];

  function publishProgress() {
    const ids = topicIds();
    const completed = [...new Set(completedIds())].filter(id => ids.includes(id));
    const progress = { completed, total: ids.length };
    try {
      const all = JSON.parse(localStorage.getItem('dersMerkeziProgress') || '{}');
      all[config.course] = progress;
      localStorage.setItem('dersMerkeziProgress', JSON.stringify(all));
    } catch (_) {}
    const message = { type: 'ders-merkezi-progress', course: config.course, progress };
    if (window.parent && window.parent !== window) window.parent.postMessage(message, '*');
    if (window.opener && !window.opener.closed) window.opener.postMessage(message, '*');
  }

  function decorateNavigation() {
    if (config.course === 'math' || config.course === 'german' || config.course === 'literature') return;
    const root = document.getElementById('navigation') || document.getElementById('nav');
    if (!root) return;
    const ids = topicIds();
    const checked = new Set(completedIds());
    [...root.querySelectorAll('button')].slice(0, ids.length).forEach((button, index) => {
      button.classList.toggle('topic-done', checked.has(ids[index]));
      if (checked.has(ids[index])) button.setAttribute('aria-label', `${button.innerText.trim()} — tamamlandı`);
      else button.removeAttribute('aria-label');
    });
  }

  function currentTopicId() {
    return config.course === 'math' ? activeSub : active;
  }

  function quizIsComplete() {
    if (config.course === 'math') {
      const topic = subById(activeSub);
      return !!topic && topic.quiz.length > 0 && topic.quiz.every((_, index) => currentQuizResults[index] !== undefined);
    }
    const questions = [...document.querySelectorAll('#main .question')];
    return questions.length > 0 && questions.every(question => question.dataset.answered === '1');
  }

  function toggleTopic(id) {
    const ids = topicIds();
    if (!ids.includes(id)) return;
    const values = new Set(completedIds());
    if (values.has(id)) values.delete(id);
    else values.add(id);
    if (done instanceof Set) {
      done.clear();
      values.forEach(value => done.add(value));
    } else {
      done.splice(0, done.length, ...values);
    }
    try { localStorage.setItem(config.key, JSON.stringify([...values])); } catch (_) {}
    if (typeof nav === 'function') nav();
    if (config.course === 'math' && typeof content === 'function') content();
    else if (typeof render === 'function') render();
    decorateNavigation();
    publishProgress();
  }

  function addFinishControl() {
    const main = document.getElementById('main');
    if (!main) return;
    main.querySelector('.topic-finish')?.remove();
    const id = currentTopicId();
    if (!id || !topicIds().includes(id) || (config.course === 'german' && id === 'exam')) return;
    const checked = new Set(completedIds()).has(id);
    const canMark = !config.topicQuiz || checked || (config.course === 'math' ? activeMode === 'quiz' : mode === 'quiz') && quizIsComplete();
    const wrap = document.createElement('section');
    wrap.className = 'topic-finish';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'topic-finish-button';
    button.disabled = !canMark;
    button.textContent = checked ? '✓ Konu bitti — işareti kaldır' : canMark ? '□ Bu konuyu bitti olarak işaretle' : 'Önce kısa testteki tüm soruları yanıtla';
    button.addEventListener('click', () => toggleTopic(id));
    wrap.append(button);
    if (checked) {
      const note = document.createElement('p');
      note.textContent = 'Bu konu sol menüde tamamlandı olarak işaretlendi.';
      wrap.append(note);
    }
    main.append(wrap);
  }

  function updateHomeLink() {
    const link = [...document.querySelectorAll('a')].find(anchor => anchor.classList.contains('home') || anchor.classList.contains('mobile-home') || anchor.textContent.toLocaleLowerCase('tr').includes('ders merkezine dön'));
    const target = link || document.createElement('a');
    target.href = 'index.html';
    target.textContent = '← Ders merkezine dön';
    target.classList.add('hub-home');
    if (!link) document.querySelector('.wrap')?.prepend(target);
  }

  function wrapFunction(name, callback) {
    const original = window[name];
    if (typeof original !== 'function' || original.__progressWrapped) return;
    const wrapped = function (...args) {
      const result = original.apply(this, args);
      callback();
      return result;
    };
    wrapped.__progressWrapped = true;
    window[name] = wrapped;
  }

  const style = document.createElement('style');
  style.textContent = `
    .hub-home{display:inline-flex!important;align-items:center;min-height:42px;margin:0 0 11px;padding:7px 12px;border:1px solid var(--line,#dfe6ef);border-radius:10px;background:var(--paper,#fff);color:var(--blue,#3457d6);text-decoration:none;font-weight:750}
    .hub-home:focus-visible,.topic-finish-button:focus-visible{outline:3px solid #9baaff;outline-offset:2px}
    #navigation button.topic-done::after,#nav button.topic-done::after{content:'  ✓';color:var(--teal,#087f73);font-weight:900}
    .topic-finish{margin:18px 0 6px;padding:14px;border:1px solid #cfe6dc;border-radius:13px;background:#f0faf5}
    .topic-finish-button{min-height:46px;border:0;border-radius:10px;padding:10px 14px;background:#167963;color:white;font-weight:800}
    .topic-finish-button:disabled{background:#e9edf1;color:#687487;cursor:not-allowed}
    .topic-finish p{margin:8px 0 0;color:#176b56;font-size:.9rem}
    @media(max-width:700px){.hub-home{min-height:46px}.topic-finish{position:relative}}
  `;
  document.head.append(style);
  updateHomeLink();
  wrapFunction('nav', () => { decorateNavigation(); publishProgress(); });
  wrapFunction('render', () => { decorateNavigation(); addFinishControl(); publishProgress(); });
  wrapFunction('content', () => { decorateNavigation(); addFinishControl(); publishProgress(); });
  wrapFunction('answer', addFinishControl);
  wrapFunction('checkAnswer', addFinishControl);
  if (typeof nav === 'function') nav();
  decorateNavigation();
  addFinishControl();
  publishProgress();
})();
