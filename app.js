const gameLinks = {
  mahjong: "https://d3pvfi6m7bxu71.cloudfront.net/gs2c/html5Game.do?extGame=1&symbol=vswaysmahwblck&gname=Mahjong%20Wins%203%20-%20Black%20Scatter&jurisdictionID=99&mgckey=stylename@generic~SESSION@demo",
  zeus: "https://demogamesfree.pragmaticplay.net/gs2c/html5Game.do?extGame=1&symbol=vs20olympgate&jurisdictionID=99&mgckey=stylename@generic~SESSION@demo",
  sweet: "https://demogamesfree.pragmaticplay.net/gs2c/html5Game.do?extGame=1&symbol=vs20sweetbonanza&jurisdictionID=99&mgckey=stylename@generic~SESSION@demo"
};

const gameFrame = document.getElementById("gameFrame");
const gameCards = document.querySelectorAll(".game-card");

// fungsi load game
function loadGame(key) {
  gameFrame.src = gameLinks[key];
}

// kasih event click ke semua card
gameCards.forEach(card => {
  card.addEventListener("click", () => {
    const key = card.getAttribute("data-game");
    loadGame(key);
  });
});

// default pertama kali load Mahjong
loadGame("mahjong");
