/* "How well do you know us?": a quiz to play together, made only of facts from their own story. */
(function (MM) {
  'use strict';
  const $ = (id) => document.getElementById(id);

  // [question, right answer, three wrong answers, a line shown after answering]
  const Q = [
    ['Where did it really start?', 'A physics lesson at a friend\'s house', ['On the bus after college', 'At a café on the Corniche', 'At a wedding'], 'Thanaweya Amma, 2021. He came for Newton. He left in love.'],
    ['When is Mariem\'s birthday?', '13 July', ['18 July', '16 October', '12 December'], 'Born 13 July 2002.'],
    ['When is Mohamed\'s birthday?', '18 July', ['13 July', '15 August', '21 October'], 'Born 18 July 2003, five days and one year after her.'],
    ['Who is older?', 'Mariem, by a year', ['Mohamed, by a year', 'They\'re the same age', 'Mohamed, by five days'], 'She has never once let him forget it.'],
    ['What did they study?', 'He: Computer Engineering. She: Medicine.', ['Both Medicine', 'He: Medicine. She: Engineering.', 'Both Engineering'], 'Faculty of Medicine, Alexandria University, for her.'],
    ['Where did he go for a month in 2022?', 'Sharm El Sheikh', ['Dahab', 'Cairo', 'Sahel'], 'Thirty days of sun for him, thirty days of missing him for her.'],
    ['Their first trip, just the two of them?', 'A conference at the stadium in Cairo', ['A weekend in Sharm', 'Sahel', 'Luxor and Aswan'], '2023. She fell asleep in his arms the whole way.'],
    ['How many hours apart were they when he studied in the States?', 'Seven', ['Five', 'Nine', 'Twelve'], 'Good morning at his midnight. She called every single day.'],
    ['What is his company called?', 'U3 AI', ['MM Studio', 'Alex AI', 'Yousry Tech'], 'It started on a single desk.'],
    ['When did they read the Fatiha?', '15 August 2025', ['16 October 2025', 'January 2025', '21 October 2026'], 'He saved until there was just enough.'],
    ['What did he give her at the Fatiha?', 'An iPhone 13 Pro', ['A gold bracelet', 'A watch', 'A necklace with her name'], 'Just enough savings, a lot of love, and an iPhone 13 Pro.'],
    ['When did they get engaged?', '16 October 2025', ['15 August 2025', '13 July 2026', '21 October 2026'], 'A garden, a photo session, a ring and dinner for two.'],
    ['Whose car took them out on the engagement night?', 'Hossam\'s maroon Lanos', ['His own car', 'A taxi', 'Ahmed\'s car'], 'Family history now.'],
    ['Who said "Never, ever upset her"?', 'Teta Yousr', ['Hossam', 'Yara', 'Mervat'], 'She trusted him with her granddaughter.'],
    ['What were they watching on the couch for their first kiss?', 'The Stranger Things finale', ['A football match', 'A Hamaki concert', 'An old Egyptian film'], 'The most beautiful feeling of his life.'],
    ['Their favourite singers, live?', 'Tul8te and Hamaki', ['Amr Diab and Tamer Hosny', 'Wegz and Marwan Pablo', 'Cairokee and Sherine'], 'Dancing from the heart, singing every word.'],
    ['Where was her birthday in 2026?', 'On a yacht, alone at sea', ['At the fanciest hotel', 'At home with family', 'On the beach in Sahel'], '13 July 2026. Just the two of them.'],
    ['What did he give her on the yacht?', 'A necklace with her name', ['An iPhone 13 Pro', 'A ring', 'A bouquet of roses'], 'Her name, in gold.'],
    ['Where did they celebrate one year engaged?', 'The fanciest hotel in Alexandria', ['On a yacht', 'At home', 'In Cairo'], '16 October 2026, one year to the day.'],
    ['When did they find their home?', '21 October 2026', ['16 October 2026', '12 December 2026', '15 August 2025'], 'Two days later, it was theirs.'],
    ['How many exams did he drive her to?', 'Ten', ['Five', 'Seven', 'Twelve'], 'He waited outside every single time.'],
    ['And after each exam?', 'The cinema', ['Koshari', 'The beach', 'Straight home to sleep'], 'Popcorn after every exam.'],
    ['When does Dr. Mariem graduate?', '12 December 2026, at 12 o\'clock', ['16 October 2026', '13 July 2026', '1 January 2027'], 'The smartest doctor he has ever met.'],
    ['What did dates look like with zero money?', 'Koshari, kebda and fries', ['Sushi and pizza', 'Fancy restaurants', 'Only coffee'], 'And somehow the best dates of their lives.'],
    ['Her parents\' names?', 'Hossam and Yara', ['Ahmed and Mervat', 'Mohamed and Yousr', 'Hossam and Mervat'], 'He sat with them in January 2025 with nothing but a promise.'],
    ['His parents\' names?', 'Ahmed and Mervat', ['Hossam and Yara', 'Ahmed and Yara', 'Yousry and Mervat'], 'They sat beside him when he asked for her hand.'],
    ['Her brother\'s name?', 'Mohamed', ['Ahmed', 'Omar', 'Youssef'], 'Yes, another Mohamed.'],
    ['Which city is their home in?', 'Alexandria', ['Cairo', 'Sahel', 'Giza'], 'Every corner chosen together.'],
  ];
  const TITLES = [[10, 'Soulmates. You know every page.'], [8, 'Inseparable.'], [5, 'Still learning each other. That\'s the fun part.'], [0, 'Time to replay our story together.']];

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  const Z = (MM.Quiz = {});
  Z.QUESTIONS = Q;
  Z.start = function () {
    Z.list = shuffle(Q.slice()).slice(0, 10);
    Z.i = 0; Z.score = 0;
    Z.show();
  };
  Z.show = function () {
    const box = $('quiz-body');
    if (Z.i >= Z.list.length) return Z.finish();
    const [q, right, wrong, note] = Z.list[Z.i];
    const opts = shuffle([right].concat(wrong));
    box.innerHTML = '<div class="quiz-top"><span class="eyebrow">Question ' + (Z.i + 1) + ' of ' + Z.list.length + '</span><span class="quiz-hearts">' + '♥'.repeat(Z.score) + '<i>' + '♥'.repeat(Z.i - Z.score) + '</i></span></div><h3 class="quiz-q"></h3><div class="quiz-opts"></div><p class="quiz-note muted" hidden></p><button class="btn primary quiz-next" hidden>Next</button>';
    box.querySelector('.quiz-q').textContent = q;
    const wrap = box.querySelector('.quiz-opts');
    opts.forEach((o) => {
      const b = document.createElement('button'); b.className = 'btn quiz-opt'; b.textContent = o;
      b.addEventListener('click', () => {
        if (box.dataset.done === '1') return;
        box.dataset.done = '1';
        const ok = o === right;
        if (ok) Z.score++;
        wrap.querySelectorAll('button').forEach((x) => { x.disabled = true; if (x.textContent === right) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
        const n = box.querySelector('.quiz-note'); n.hidden = false; n.textContent = (ok ? 'Yes! ' : 'It was: ' + right + '. ') + note;
        MM.Audio.sfx(ok ? 'memory' : 'pop');
        const nx = box.querySelector('.quiz-next'); nx.hidden = false; nx.textContent = Z.i + 1 >= Z.list.length ? 'See our score' : 'Next'; nx.focus();
      });
      wrap.appendChild(b);
    });
    box.dataset.done = '0';
    box.querySelector('.quiz-next').addEventListener('click', () => { Z.i++; Z.show(); });
  };
  Z.finish = function () {
    const box = $('quiz-body'), s = Z.score, n = Z.list.length;
    MM.save.stats = MM.save.stats || {};
    const best = Math.max(MM.save.stats.quizBest || 0, s);
    MM.save.stats.quizBest = best; MM.writeSave();
    MM.Extras.bump('quizzes');
    const title = TITLES.find((t) => s >= t[0])[1];
    box.innerHTML = '<div class="quiz-end"><div class="quiz-score"></div><h3 class="quiz-q"></h3><p class="muted"></p><div class="row" style="justify-content:center"><button class="btn primary" data-q="again">Play again</button><button class="btn" data-act="back">Done</button></div></div>';
    box.querySelector('.quiz-score').textContent = s + ' / ' + n;
    box.querySelector('.quiz-q').textContent = title;
    box.querySelector('p').textContent = 'Your best: ' + best + ' / ' + n + '. There are ' + Q.length + ' questions, so every round is a little different.';
    box.querySelector('[data-q="again"]').addEventListener('click', () => Z.start());
    MM.Audio.sfx(s >= 8 ? 'complete' : 'memory');
  };
})(window.MM);
