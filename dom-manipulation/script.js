let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    dropdown.value = savedCategory;
    filterQuotes();
  }
}

function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);

  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filtered.length > 0) {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  } else {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
  }
}

function showRandomQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteDisplay").innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
  }
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    postQuoteToServer(newQuote);
    alert("Quote added!");

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// ✅ Export quotes
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ Import quotes
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      }
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ Show notification
function showNotification(message, color = "green") {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.style.color = color;
  setTimeout(() => {
    note.textContent = "";
  }, 5000);
}

// ✅ POST quote to server (mock)
async function postQuoteToServer(quote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const data = await res.json();
    console.log("Quote posted:", data);
  } catch (error) {
    showNotification("⚠️ Failed to post quote to server", "red");
  }
}

// ✅ GET quotes from server (mock)
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const posts = await res.json();
    return posts.map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch {
    showNotification("⚠️ Failed to fetch from server", "red");
    return [];
  }
}

// ✅ Main sync function
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let added = 0;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(local => local.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
      added++;
    }
  });

  if (added > 0) {
    saveQuotes();
    populateCategories();
    showNotification(`✅ Synced ${added} new quote(s) from server.`);
  } else {
    showNotification("✔️ No new quotes to sync.");
  }
}

// ✅ Periodic sync every 2 minutes
setInterval(syncQuotes, 120000);

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  showLastViewedQuote();
  populateCategories();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
});
