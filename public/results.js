document.addEventListener("DOMContentLoaded", async function () {
    const races = await fetchRaces();
    fillRaces(races);

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("view-results-button")) {
            const raceId = event.target.dataset.raceId;
            console.log("Race Id:", raceId, " clicked");
            fillRaceResults(raceId);
        }
    });

});

async function fillRaceResults(raceId) {
    const raceResults = await fetchRaceResults(raceId);

    const racesTable = document.querySelector("#races");
    clearChildren(racesTable)
    const raceHeader = document.querySelector(".results-header-template")
    const raceTemplate = document.querySelector(".results-template");

    const rhTemplate = raceHeader.content.cloneNode(true);
    const rhHeader = rhTemplate.querySelector("#results-table-header");
    const rsHeader = rhTemplate.querySelector("#results-table-subheader");
    rsHeader.textContent = "Time";
    rhHeader.textContent = "Position";
    racesTable.appendChild(rhTemplate);

    raceResults.forEach(result => {
        const template = raceTemplate.content.cloneNode(true);
        let positionResult = template.querySelector(".position-result");
        let timeResult = template.querySelector(".time-result");
        positionResult.textContent = result.position;
        timeResult.textContent = setTimer(result.time);
        racesTable.appendChild(template);
    });
}

function fillRaces(races) {
    const racesTable = document.querySelector("#races");
    clearChildren(racesTable)
    const raceHeader = document.querySelector(".results-header-template")
    const raceTemplate = document.querySelector(".races-template");

    const rhTemplate = raceHeader.content.cloneNode(true);
    const rhHeader = rhTemplate.querySelector("#results-table-header");
    rhHeader.textContent = "Previous Races";
    racesTable.appendChild(rhTemplate);

    races.forEach(race => {
        const template = raceTemplate.content.cloneNode(true);
        let raceName = template.querySelector(".race-name");
        let viewResultsButton = template.querySelector(".view-results-button");
        raceName.textContent = race.name;
        viewResultsButton.dataset.raceId = race.id;
        racesTable.appendChild(template);
    });
}

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function setTimer(time){
    let hours = Math.floor(time / 3600000);
    let minutes = Math.floor((time % 3600000) / 60000);
    let seconds = Math.floor((time % 60000) / 1000);
    let milliseconds = Math.floor((time / 10) % 100);
    return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + ":" + milliseconds.toString().padStart(2, "0");
}

async function fetchRaces() {
    try {
        const response = await fetch("/get-races");
        if (!response.ok) {
            throw new Error("Error fetchibg races");
        }
        const data = await response.json();
        console.log("Races fetched:", data);
        return data;
    } catch (err) {
        console.error("Error fetching races:", err);
        throw err;
    }
}

async function fetchRaceResults(raceId) {
    try {
        const response = await fetch(`/get-results/${raceId}`);
        if (!response.ok) {
            throw new Error("Error fetching race results");
        }
        const data = await response.json();
        console.log("Race results fetched:", data);
        return data;
    } catch (err) {
        console.error("Error fetching race results:", err);
        throw err;
    }
}