// Handles category navigation
function openCategory(name) {
  window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

// Code for category page content
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("name");

  if (categoryName) {
    const title = document.getElementById("category-title");
    const content = document.getElementById("category-content");
    const entryList = document.getElementById("entry-list");

    if (title) title.textContent = categoryName;
    if (content) content.innerHTML = `<p>Welcome to the ${categoryName} category. Share your thoughts!</p>`;

    // Load saved entries
    const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
    savedEntries.forEach(entry => {
      displayEntry(entry.title, entry.text, entry.user, entry.avatar);
    });
  }
});

// Add new entry
function addEntry() {
  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("name");

  const titleInput = document.getElementById("entry-title");
  const textInput = document.getElementById("entry-text");
  const userInput = document.getElementById("entry-user");
  const avatarInput = document.getElementById("entry-avatar");

  const entryTitle = titleInput.value.trim();
  const entryText = textInput.innerHTML.trim(); // capture HTML for formatting
  const entryUser = userInput.value.trim() || "Anonymous";
  const entryAvatar = avatarInput.value.trim() || "https://via.placeholder.com/40";

  if (!entryTitle || !entryText) {
    alert("Please enter both a title and content.");
    return;
  }

  const newEntry = { title: entryTitle, text: entryText, user: entryUser, avatar: entryAvatar };
  const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
  savedEntries.push(newEntry);
  localStorage.setItem(categoryName, JSON.stringify(savedEntries));

  displayEntry(entryTitle, entryText, entryUser, entryAvatar);

  titleInput.value = "";
  textInput.innerHTML = "";
  userInput.value = "";
  avatarInput.value = "";
}

// Display entry
function displayEntry(title, text, user, avatar) {
  const entryList = document.getElementById("entry-list");
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");

  // Collapsible post
  const previewLength = 200;
  const isLong = text.length > previewLength;
  const previewText = isLong ? text.substring(0, previewLength) + "..." : text;

  entryDiv.innerHTML = `
    <div class="entry-header">
      <img src="${avatar}" alt="avatar" class="avatar">
      <span class="user-name">${user}</span>
    </div>
    <h4>${title}</h4>
    <p class="entry-text">${previewText}</p>
    ${isLong ? '<button class="toggle-btn">Read More</button>' : ""}
  `;

  if (isLong) {
    const btn = entryDiv.querySelector(".toggle-btn");
    const textEl = entryDiv.querySelector(".entry-text");
    let expanded = false;
    btn.addEventListener("click", () => {
      expanded = !expanded;
      textEl.innerHTML = expanded ? text : previewText;
      btn.textContent = expanded ? "Show Less" : "Read More";
    });
  }

  entryList.prepend(entryDiv);
}
