const categoryListingEl = document.querySelector("div.category-listing");
const timesContainerEl = document.querySelector("div.times-container");
const modeEl = document.querySelector("div#mode");

document.querySelector("button#back-to-leaderboard-button").onclick = async function() {
  timesEl.classList.toggle("active", false);

  leaderboardEl.classList.toggle("inactive", false);
  await delay(1000);
  document.querySelectorAll("div.scores").forEach(element => {
    element.classList.toggle("hidden", true);
  });
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function generateLeaderboard()
{
  categoryListingEl.innerHTML = "";
  timesContainerEl.innerHTML = "";

  let json = localStorage.getItem("leaderboard");

  if (!json)
    return

  json = JSON.parse(json);

  for (const [key, value] of Object.entries(json)) {
    let settings = key.split("x");

    let tempCategoryEl = document.createElement("div");

    let tempWidthRowEl = document.createElement("div");
    let tempHeightRowEl = document.createElement("div");
    let tempOddsRowEl = document.createElement("div");
    let tempNextEl = document.createElement("div");

    let tempNextButtonEl = document.createElement("button");

    tempCategoryEl.classList.add("category");

    tempWidthRowEl.classList.add("width-row");
    tempHeightRowEl.classList.add("height-row");
    tempOddsRowEl.classList.add("odds-row");
    tempNextEl.classList.add("next");

    tempNextButtonEl.classList.add("next");
    tempNextButtonEl.id = key;
    tempNextButtonEl.innerHTML = ">";
    tempNextButtonEl.onclick = function() {
      timesEl.classList.toggle("active", true);
      document.getElementById("t" + key).classList.toggle("hidden", false);
      modeEl.innerHTML = key;
      leaderboardEl.classList.toggle("inactive", true);
    }

    tempNextEl.appendChild(tempNextButtonEl);

    tempWidthRowEl.innerHTML = settings[0];
    tempHeightRowEl.innerHTML = settings[1];
    tempOddsRowEl.innerHTML = settings[2] + "%";

    tempCategoryEl.appendChild(tempWidthRowEl);
    tempCategoryEl.appendChild(tempHeightRowEl);
    tempCategoryEl.appendChild(tempOddsRowEl);
    tempCategoryEl.appendChild(tempNextEl);

    categoryListingEl.appendChild(tempCategoryEl);

    // times
    let tempScoresEl = document.createElement("div");
    tempScoresEl.classList.add("scores", "hidden");
    tempScoresEl.id = "t" + key;

    let tempPlacesEl = document.createElement("div");
    tempPlacesEl.classList.add("places");

    let tempTimesEl = document.createElement("div");
    tempTimesEl.classList.add("times");

    value.sort(function(a,b){return a-b});

    let counter = 0;
    value.forEach(timeInMs => {
      counter++;
      let tempTimeEl = document.createElement("div");
      tempTimeEl.classList.add("time");
      tempTimeEl.innerHTML = msToTime(timeInMs);
      tempTimesEl.appendChild(tempTimeEl);

      let tempPlaceEl = document.createElement("div");
      tempPlaceEl.classList.add("place");
      tempPlaceEl.innerHTML = counter;
      tempPlacesEl.appendChild(tempPlaceEl);
    });

    tempScoresEl.appendChild(tempPlacesEl);
    tempScoresEl.appendChild(tempTimesEl);

    timesContainerEl.appendChild(tempScoresEl);
  }
}