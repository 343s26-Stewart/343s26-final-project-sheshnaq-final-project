const container = document.getElementById("placeList");

/* save all cards to storage */
function saveCards() {
    const cards = document.querySelectorAll(".place-card");

    const data = [];

    cards.forEach(card => {
    data.push({
        img: card.querySelector("img").src,
        title: card.querySelector("h2").textContent,
        description: card.querySelector(".description").textContent,
        bestTime: card.querySelector(".best-time").textContent.replace("Best time to visit:", "").trim(),
        notes: card.querySelector(".notes").value,
        visited: card.classList.contains("visited")
    });
    });

    localStorage.setItem("travelCards", JSON.stringify(data));
}

/* create the card given data parsed through JSON */
function createCard(data) {
    const card = document.createElement("div");
    card.className = "place-card";

    if (data.visited) {
        card.classList.add("visited");
    }

    const img = document.createElement("img");
    img.src = data.img;

    const info = document.createElement("div");
    info.className = "place-info";

    const title = document.createElement("h2");
    title.textContent = data.title;

    const description = document.createElement("p");
    description.className = "description";
    description.textContent = data.description;

    const bestTime = document.createElement("p");
    bestTime.className = "best-time";
    bestTime.innerHTML = `<strong>Best time to visit:</strong> ${data.bestTime}`;

  // Notes
    const notesLabel = document.createElement("p");
    notesLabel.textContent = "Notes:";

    const notes = document.createElement("textarea");
    notes.className = "notes";
    notes.rows = 3;
    notes.value = data.notes || "";

  // Buttons
    const btns = document.createElement("div");
    btns.className = "buttons";

    const visitedBtn = document.createElement("button");
    visitedBtn.type = "button";
    visitedBtn.className = "visited-btn";
    visitedBtn.textContent = "Visited";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";

/* adds functionality to Visited button */
    visitedBtn.addEventListener("click", () => {
    card.classList.toggle("visited");

    if (card.classList.contains("visited")) {
        visitedBtn.textContent = "Unmark";
    } else {
        visitedBtn.textContent = "Visited";
    }

    saveCards();
    });

    /* allows remove button to actually remove card. 
    Also removes card from localStorage. */
    removeBtn.addEventListener("click", () => {
        card.remove();
        saveCards();
    });

    notes.addEventListener("input", saveCards);

    btns.appendChild(visitedBtn);
    btns.appendChild(removeBtn);

    info.appendChild(title);
    info.appendChild(description);
    info.appendChild(bestTime);
    info.appendChild(notesLabel);
    info.appendChild(notes);
    info.appendChild(btns);

    card.appendChild(img);
    card.appendChild(info);

    container.appendChild(card);
}

/* load all saved cards */
function loadCards() {
    const saved = localStorage.getItem("travelCards");

    if (!saved) return;

    JSON.parse(saved).forEach(createCard);
}

/* add a new location */
function addLocation(img, description, bestTime, title = "New Location") {
    createCard({
        img,
        description,
        bestTime,
        title,
        notes: "",
        visited: false
        });

    saveCards();
}

/* run loadCards once the page loads */
loadCards();