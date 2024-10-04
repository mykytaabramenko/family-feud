console.clear();

const app = {
  scoreAfterRewardOfOneTeam: 0,
  awardedTeamNumber: null,
  questionHidden: true,
  faceOff: false,
  audience: false,
  version: 1,
  role: "player",
  socket: io.connect(),
  jsonFile: "../public/data/FamilyFeud_Questions.json",
  currentQ: 0,
  wrong: 0,
  board: $(`<div class='gameBoard'>

                <!--- Scores --->
                <div class='score' id='boardScore'>0</div>
                <div class='score' id='team1' >0</div>
                <div class='score' id='team2' >0</div>

                <!--- Main Board --->
                <div id='middleBoard'>

                    <!--- Question --->
                    <div id="question" class='questionHolder'>
                        <span class='question'></span>
                    </div>

                    <!--- Answers --->
                    <div class='colHolder'>
                    </div>

                </div>
                <!--- Wrong --->
                <div class='wrongX wrongBoard'>
                    <img class="cross" alt="not on board" src="/public/img/Wrong.svg"/>
                    <img class="cross" alt="not on board" src="/public/img/Wrong.svg"/>
                    <img class="cross" alt="not on board" src="/public/img/Wrong.svg"/>
                </div>

                <!--- Buttons --->
                <div class='btnHolder hide' id="host">
                    <div id='hostBTN'     class='button'>Be the host</div>
                    <div id='awardTeam1'  class='button' data-team='1'>Award Team 1</div>
                    <div id='newQuestion' class='button'>New Question</div>
                    <div id='audience' class='button'>Audience</div>
                    <div id="wrong"       class='button wrongX'>
                        <img alt="not on board" src="/public/img/Wrong.svg"/>
                    </div>
                    <div id='resetScore' class='button'>Reset score</div>
                    <div id='faceOff' class='button'>Face off</div>
                    <div id='awardTeam2'  class='button' data-team='2' >Award Team 2</div>
                </div>

                </div>`),

  // Utility functions
  jsonLoaded: (data) => {
    app.allData = data;
    app.questions = data.map((item) => item.question);
    app.makeQuestion(app.currentQ);
    app.board.find(".host").hide();
    $("body").append(app.board);
  },

  // Action functions
  makeQuestion: (eNum) => {
    app.scoreAfterRewardOfOneTeam = 0;
    app.awardedTeamNumber = null;
    const qAnswr = app.allData[eNum].options;

    const boardScore = app.board.find("#boardScore");
    const question = app.board.find(".question");
    const holderMain = app.board.find(".colHolder");

    boardScore.html(0);
    app.questionHidden = true;
    question.html("");
    holderMain.empty();

    app.wrong = 0;
    const wrong = app.board.find(".wrongBoard");
    $(wrong).find("img").hide();
    $(wrong).hide();

    qNum = 10;

    for (let i = 0; i < qNum; i++) {
      let aLI;
      if (qAnswr[i]) {
        aLI = $(`<div class='cardHolder'>
                            <div class='card' data-id='${i}'>
                                <div class='front'>
                                    <span class='DBG'>${i + 1}</span>
                                    <span class='answer'>${qAnswr[i][0]}</span>
                                </div>
                                <div class='back DBG'>
                                    <span>${qAnswr[i][0]}</span>
                                    <b class='LBG'>${qAnswr[i][1]}</b>
                                </div>
                            </div>
                        </div>`);
      } else {
        aLI = $(`<div class='cardHolder empty'><div></div></div>`);
      }

      var parentDiv = holderMain; //(i < (qNum / 2)) ? col1 : col2;
      aLI.on(
        "click",
        {
          trigger: "flipCard",
          num: i,
        },
        app.talkSocket,
      );
      $(aLI).appendTo(parentDiv);
    }

    const cardHolders = app.board.find(".cardHolder");
    const cards = app.board.find(".card");
    const backs = app.board.find(".back");
    const cardSides = app.board.find(".card>div");

    TweenLite.set(cardHolders, {
      perspective: 800,
    });
    TweenLite.set(cards, {
      transformStyle: "preserve-3d",
    });
    TweenLite.set(backs, {
      rotationX: 180,
    });
    TweenLite.set(cardSides, {
      backfaceVisibility: "hidden",
    });
    cards.data("flipped", false);
  },
  getBoardScore: () => {
    const boardScore = app.board.find("#boardScore");
    const currentScore = {
      var: boardScore.html(),
    };
    if (app.awardedTeamNumber) {
      TweenMax.to(currentScore, 1, {
        var: app.scoreAfterRewardOfOneTeam,
        onUpdate: function () {
          boardScore.html(Math.round(currentScore.var));
        },
        ease: Power3.easeOut,
      });
      return;
    }
    const cards = app.board.find(".card");
    let score = 0;

    function tallyScore() {
      if ($(this).data("flipped")) {
        const value = $(this).find("b").html();
        score += parseInt(value);
      }
    }
    $.each(cards, tallyScore);
    TweenMax.to(currentScore, 1, {
      var: score,
      onUpdate: function () {
        boardScore.html(Math.round(currentScore.var));
      },
      ease: Power3.easeOut,
    });
  },
  awardPoints: (num) => {
    const boardScore = app.board.find("#boardScore");
    const currentScore = {
      var: parseInt(boardScore.html()),
    };
    const team = app.board.find("#team" + num);
    const teamScore = {
      var: parseInt(team.html()),
    };
    const teamScoreUpdated = teamScore.var + currentScore.var;
    TweenMax.to(teamScore, 1, {
      var: teamScoreUpdated,
      onUpdate: function () {
        team.html(Math.round(teamScore.var));
      },
      ease: Power3.easeOut,
    });

    TweenMax.to(currentScore, 1, {
      var: 0,
      onUpdate: function () {
        boardScore.html(Math.round(currentScore.var));
      },
      ease: Power3.easeOut,
    });
    app.awardedTeamNumber = num;
    app.scoreAfterRewardOfOneTeam = 0;
  },
  changeQuestion: () => {
    const numberOfQuestions = app.questions.length;
    app.currentQ++;
    if (app.currentQ < numberOfQuestions) {
      app.makeQuestion(app.currentQ);
    } else {
      console.warn("There are no more questions!");
    }
  },
  makeHost: () => {
    app.role = "host";
    app.board.find(".hide").removeClass("hide");
    app.board.addClass("showHost");
    app.socket.emit("talking", {
      trigger: "hostAssigned",
    });
  },
  flipCard: (n) => {
    const card = $('[data-id="' + n + '"]');
    let flipped = $(card).data("flipped");
    if (!flipped) $("#correct")[0].play();

    if (app.awardedTeamNumber) {
      const value = $(card).find("b").html();
      if (flipped) {
        app.scoreAfterRewardOfOneTeam -= parseInt(value);
      } else app.scoreAfterRewardOfOneTeam += parseInt(value);
    }
    const cardRotate = flipped ? 0 : -180;
    TweenLite.to(card, 1, {
      rotationX: cardRotate,
      ease: Back.easeOut,
    });
    flipped = !flipped;
    $(card).data("flipped", flipped);
    app.getBoardScore();
  },
  wrongAnswer: () => {
    const wrong = app.board.find(".wrongBoard");

    if (app.faceOff || app.audience) {
      app.wrong = 1;
      app.showCrosses(wrong);
      return;
    }
    if (app.wrong === 3) {
      app.wrong = 1;
    } else {
      app.wrong++;
    }

    app.showCrosses(wrong);
  },

  showCrosses(wrong) {
    if (app.wrong === 1) {
      const crosses = app.board.find(".cross");
      Object.values(crosses).forEach((_, i) =>
        $(wrong)
          .find("img:nth-child(" + i + ")")
          .hide(),
      );
    }

    $("#wrong")[0].play();
    $(wrong)
      .find("img:nth-child(" + app.wrong + ")")
      .show();

    $(wrong).show();
    setTimeout(() => {
      $(wrong).hide();
    }, 1000);
  },

  resetScore: () => {
    app.scoreAfterRewardOfOneTeam = 0;
    const team1 = app.board.find("#team1");
    const team2 = app.board.find("#team2");

    const team1Score = {
      var: team1.html(),
    };
    const team2Score = {
      var: team2.html(),
    };

    TweenMax.to(team1Score, 1, {
      var: 0,
      onUpdate: () => team1.html(Math.round(team1Score.var)),
      ease: Power3.easeOut,
    });

    TweenMax.to(team2Score, 1, {
      var: 0,
      onUpdate: () => team2.html(Math.round(team2Score.var)),
      ease: Power3.easeOut,
    });
  },

  toggleFaceOff: () => {
    app.faceOff = !app.faceOff;
    app.wrong = 0;
    const faceOffButton = app.board.find("#faceOff");
    faceOffButton.toggleClass("active");
  },

  toggleAudience: () => {
    app.audience = !app.audience;
    app.wrong = 0;
    const audience = app.board.find("#audience");
    audience.toggleClass("active");
  },
  toggleQuestion: () => {
    const question = app.board.find(".question");
    if (app.questionHidden) {
      const questionText = app.questions[app.currentQ];
      question.html(questionText.replace(/&x22;/gi, '"'));
      app.questionHidden = false;
    } else {
      question.html("");
      app.questionHidden = true;
    }
  },

  // Socket Test
  talkSocket: (e) => {
    if (app.role === "host") app.socket.emit("talking", e.data);
  },
  listenSocket: (data) => {
    switch (data.trigger) {
      case "newQuestion":
        app.changeQuestion();
        break;
      case "awardTeam1":
        app.awardPoints(1);
        break;
      case "awardTeam2":
        app.awardPoints(2);
        break;
      case "flipCard":
        app.flipCard(data.num);
        break;
      case "hostAssigned":
        app.board.find("#hostBTN").remove();
        break;
      case "wrong":
        app.wrongAnswer();
        break;
      case "resetScore":
        app.resetScore();
        break;
      case "faceOff":
        app.toggleFaceOff();
        break;
      case "audience":
        app.toggleAudience();
        break;
      case "showOrHideQuestion":
        app.toggleQuestion();
        break;
    }
  },

  // Inital function
  init: () => {
    $.getJSON(app.jsonFile, app.jsonLoaded);

    app.board.find("#hostBTN").on("click", app.makeHost);
    app.board
      .find("#awardTeam1")
      .on("click", { trigger: "awardTeam1" }, app.talkSocket);
    app.board
      .find("#awardTeam2")
      .on("click", { trigger: "awardTeam2" }, app.talkSocket);
    app.board
      .find("#resetScore")
      .on("click", { trigger: "resetScore" }, app.talkSocket);
    app.board
      .find("#faceOff")
      .on("click", { trigger: "faceOff" }, app.talkSocket);
    app.board
      .find("#audience")
      .on("click", { trigger: "audience" }, app.talkSocket);
    app.board
      .find("#question")
      .on("click", { trigger: "showOrHideQuestion" }, app.talkSocket);
    app.board
      .find("#newQuestion")
      .on("click", { trigger: "newQuestion" }, app.talkSocket);
    app.board.find("#wrong").on("click", { trigger: "wrong" }, app.talkSocket);

    app.socket.on("listening", app.listenSocket);
  },
};
app.init();
