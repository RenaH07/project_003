// ==== スマホ・タブレットをブロックする ====
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  jsPsych.init({
    timeline: [{
      type: 'html-button-response',
      stimulus: `
        <h3>この実験はパソコン専用です</h3>
        <p>スマートフォンやタブレットではご参加いただけません。</p>
      `,
      choices: ['終了']
    }],
    on_finish: function () {
      jsPsych.endExperiment("モバイル端末でのアクセスが検出されたため、実験を終了しました。");
    }
  });
  // 💥 ここで実験の通常処理を止める！
  throw new Error("モバイルブロック：実験中止");
}

// ==== 自動ID生成 ====
function generateParticipantID(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

const timeline = [];

// ==== イントロダクション ====
timeline.push({
  type: 'html-button-response',
  stimulus: `
    <h2>図形の動きに対する印象アンケート</h2>
    <p>この度はお忙しいところ、本調査にご協力いただき誠にありがとうございます。<br>
    回答を始める前に、以下の点をご確認ください。</p>

     <div style="text-align: left; max-height: 500px; overflow-y: auto; padding: 10px; border: 1px solid #ccc; font-size: 14px;">   
      <h3>本調査の目的</h3>
      <p>本調査は、図形が動いている様子に対する感じ方の傾向を調べることを目的としています。</p>

      <h3>本調査への回答および辞退について</h3>
      <p>本調査への回答は、あなたの自由な意思によるものです。調査への回答を始めた後でも、いつでも回答を中止することができます。<br>
      回答を中止した場合、そのデータは一切使用されません。また、本調査に回答しないこと、あるいは回答を中止することで、あなたが不利益を被ることはありません。<br>
      ただし、報酬の受け取りには、回答の完了が必要です。</p>

      <h3>本調査で得られるデータの取り扱いについて</h3>
      <p>本調査で得られたデータは、すべて個人と紐づけられない形で統計的に処理され、パスワードをかけて厳重に保管されます。<br>
      回答データから回答者個人を特定できないようにする方法として、回答データを匿名化したうえで、回答者とその回答データの対応表を作成しないという手法をとります。<br>
      得られたデータの保管期間は、公益社団法人・日本心理学会の倫理規定に従い、研究公表から5年間とします。保管期限経過後、得られたデータは破棄されます。<br>
      収集される個人情報は報酬のお支払い手続きにのみ使用し、報酬のお支払いが完了した時点で破棄されます。なお、名前・連絡先は取得しません。<br>
      本調査で得られたデータは、学術目的に限定して公表される場合があります。データを公表する際にも、個人が特定できない形で公表を行います。</p>

      <h3>本調査の回答方法について</h3>
      <p>本調査は、オンラインフォーム上のアンケートによって実施されます。回答に正解・不正解はありません。それぞれの質問に、素直にお答えください。<br>
      本調査への回答は、パソコン（Windows、Mac等）から行ってください。本調査には15分程度の回答時間を要します。静穏な環境でご回答ください。<br>

    </div>

      <h3>あなたは、上記の説明をよく読み、調査への参加に同意しますか。</h3>
      <p style="font-weight: bold;">※「同意しない」を選択すると、調査終了ページに移動します。</p>

  `,
  choices: ['同意する', '同意しない'],
  on_finish: function(data){
    if(data.response === 1){
      jsPsych.endExperiment("調査へのご参加、ありがとうございました。<br>今回は同意が得られなかったため、調査は行われませんでした。");
    }
  }
});

// ==== 操作説明 ====
timeline.push({
  type: 'html-button-response',
  stimulus: `
    <h3>操作説明</h3>
    <p>図形が動くアニメーションが表示されます。</p>
    <p>アニメーションの後に表示される質問に回答してください。</p>
  `,
  choices: ['練習を始める']
});

// ==== 非同期開始 ====
startExperiment();

async function startExperiment() {
  // ==== 練習 ====
  const practiceData = await fetch("stimuli/st_m_g_01.json").then(res => res.json());

  timeline.push(
    {
      type: 'html-keyboard-response',
      stimulus: '<canvas id="gameCanvas" width="800" height="600"></canvas>',
      trial_duration: 500,
      choices: jsPsych.NO_KEYS,
      on_load: function () {
        const ctx = document.getElementById('gameCanvas').getContext('2d');
        const pos = practiceData.ball.positions[0];
        ctx.fillStyle = practiceData.canvas.background;
        ctx.fillRect(0, 0, practiceData.canvas.width, practiceData.canvas.height);
        const g = practiceData.goal;
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
        ctx.fill();
        const o = practiceData.obstacle;
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.width, o.height);
        ctx.fillStyle = practiceData.ball.color;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], practiceData.parameters.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      type: 'html-keyboard-response',
      stimulus: '<div style="font-size: 60px;">+</div>',
      trial_duration: 200,
      choices: jsPsych.NO_KEYS
    },
    {
      type: 'html-keyboard-response',
      stimulus: '<canvas id="gameCanvas" width="800" height="600"></canvas>',
      choices: jsPsych.NO_KEYS,
      on_load: function () {
        const ctx = document.getElementById('gameCanvas').getContext('2d');
        let frame = 0;
        function draw() {
          const pos = practiceData.ball.positions[frame];
          if (!pos) return;
          ctx.fillStyle = practiceData.canvas.background;
          ctx.fillRect(0, 0, practiceData.canvas.width, practiceData.canvas.height);
          const g = practiceData.goal;
          ctx.fillStyle = g.color;
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
          ctx.fill();
          const o = practiceData.obstacle;
          ctx.fillStyle = o.color;
          ctx.fillRect(o.x, o.y, o.width, o.height);
          ctx.fillStyle = practiceData.ball.color;
          ctx.beginPath();
          ctx.arc(pos[0], pos[1], practiceData.parameters.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        function loop() {
          if (frame >= practiceData.ball.positions.length) {
            jsPsych.finishTrial();
            return;
          }
          draw();
          frame++;
          requestAnimationFrame(loop);
        }
        loop();
      }
    },
    {
      type: 'survey-likert',
      questions: [
        {
          prompt: "この動きを見てどのように感じましたか？",
          labels: ["とても不快", "", "", "", "", "", "とても心地よい"],
          required: true
        }
      ],
      data: {
        stimulus_file: "st_m_g_01.json",
        question_type: "心地よさ（練習）"
      }
    }
  );

  timeline.push({
    type: 'html-button-response',
    stimulus: `
      <h3>本番開始</h3>
      <p>ここからが本番です。先ほどと同じ形式でアニメーションが表示されます。</p>
      <p>アニメーションの後に表示される質問に回答してください。</p>
    `,
    choices: ['開始する']
  });

  const file_list = [
    "st_s_g_01.json", "st_s_g_02.json",
    "st_m_g_01.json", "st_m_g_02.json",
    "st_f_g_01.json", "st_f_g_02.json",
    "zz_s_g_01.json", "zz_s_g_02.json",
    "zz_m_g_01.json", "zz_m_g_02.json",
    "zz_f_g_01.json", "zz_f_g_02.json",
    "c1_s_g_01.json", "c1_s_g_02.json",
    "c1_m_g_01.json", "c1_m_g_02.json",
    "c1_f_g_01.json", "c1_f_g_02.json",
    "c2_s_g_01.json", "c2_s_g_02.json",
    "c2_m_g_01.json", "c2_m_g_02.json",
    "c2_f_g_01.json", "c2_f_g_02.json",
    "ha_s_g_01.json", "ha_s_g_02.json",
    "ha_m_g_01.json", "ha_m_g_02.json",
    "ha_f_g_01.json", "ha_f_g_02.json",
    "la_s_g_01.json", "la_s_g_02.json",
    "la_m_g_01.json", "la_m_g_02.json",
    "la_f_g_01.json", "la_f_g_02.json"
  ];

  const questions = [
    {
      prompt: "この動きを見てどのように感じましたか？",
      labels: ["とても不快", "", "", "", "", "", "とても心地よい"],
      required: true
    },
    {
      prompt: "この動きはかわいいと思った",
      labels: ["全くそう思わない", "", "", "", "", "", "とてもそう思う"],
      required: true
    }
  ];

  const trials = await Promise.all(file_list.map(f => fetch("stimuli/" + f).then(res => res.json())));
  const shuffled_indices = jsPsych.randomization.shuffle([...Array(file_list.length).keys()]);
  
  
  
  
  shuffled_indices.forEach(i => {
    const trialData = trials[i];
    const filename = file_list[i];
    const question = filename.includes("_01.json") ? questions[0] : questions[1];

    timeline.push(
      {
        type: 'html-keyboard-response',
        stimulus: '<canvas id="gameCanvas" width="800" height="600"></canvas>',
        trial_duration: 500,
        choices: jsPsych.NO_KEYS,
        on_load: function () {
          const ctx = document.getElementById('gameCanvas').getContext('2d');
          const pos = trialData.ball.positions[0];
          ctx.fillStyle = trialData.canvas.background;
          ctx.fillRect(0, 0, trialData.canvas.width, trialData.canvas.height);
          const g = trialData.goal;
          ctx.fillStyle = g.color;
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
          ctx.fill();
          const o = trialData.obstacle;
          ctx.fillStyle = o.color;
          ctx.fillRect(o.x, o.y, o.width, o.height);
          ctx.fillStyle = trialData.ball.color;
          ctx.beginPath();
          ctx.arc(pos[0], pos[1], trialData.parameters.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      {
        type: 'html-keyboard-response',
        stimulus: '<div style="font-size: 60px;">+</div>',
        trial_duration: 200,
        choices: jsPsych.NO_KEYS
      },
      {
        type: 'html-keyboard-response',
        stimulus: '<canvas id="gameCanvas" width="800" height="600"></canvas>',
        choices: jsPsych.NO_KEYS,
        on_load: function () {
          const ctx = document.getElementById('gameCanvas').getContext('2d');
          let frame = 0;
          function draw() {
            const pos = trialData.ball.positions[frame];
            if (!pos) return;
            ctx.fillStyle = trialData.canvas.background;
            ctx.fillRect(0, 0, trialData.canvas.width, trialData.canvas.height);
            const g = trialData.goal;
            ctx.fillStyle = g.color;
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
            ctx.fill();
            const o = trialData.obstacle;
            ctx.fillStyle = o.color;
            ctx.fillRect(o.x, o.y, o.width, o.height);
            ctx.fillStyle = trialData.ball.color;
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], trialData.parameters.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          function loop() {
            if (frame >= trialData.ball.positions.length) {
              jsPsych.finishTrial();
              return;
            }
            draw();
            frame++;
            requestAnimationFrame(loop);
          }
          loop();
        }
      },
      {
        type: 'survey-likert',
        questions: [question],
        data: {
          stimulus_file: filename,
          question_type: question.prompt
        },
        on_load: () => {
          document.querySelectorAll('.jspsych-survey-likert .jspsych-survey-likert-label').forEach(label => {
            label.style.whiteSpace = 'nowrap';
            label.style.fontSize = '14px';
            label.style.width = '130px';
            label.style.display = 'inline-block';
            label.style.textAlign = 'center';
            label.style.verticalAlign = 'top';
          });
          document.querySelectorAll('.jspsych-survey-likert td').forEach(cell => {
            cell.style.width = '130px';
          });
        }
      }
    );
  });

  timeline.push({
    type: 'html-button-response',
    stimulus: `<h2>実験終了</h2><p>ご協力ありがとうございました！</p>`,
    choices: ['完了']
  });

  jsPsych.init({
    timeline: timeline,
    on_finish: function () {
      const participantID = generateParticipantID();
      const allData = jsPsych.data.get().json();

      const payload = {
        id: participantID,
        data: JSON.parse(allData)
      };

      console.log("📤 送信するデータ：", payload);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "experiment-data",
          "data": JSON.stringify(payload)
        })
      })
      .then(() => {
        console.log("✅ Netlifyに送信完了！");
      })
      .catch((error) => {
        console.error("❌ 送信エラー:", error);
      });
    }
  });
}
