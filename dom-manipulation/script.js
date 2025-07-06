let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

// 🧠 Save to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// 📥 Load from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// 🟡 Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}

// 🔍 Filter quotes by selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  let filteredQuotes = quotes;
  if (selected !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selected);
  }

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  } else {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
  }
}

// 🎲 Show a random quote
function showRandomQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// 🧠 Show last viewed quote on load
function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
  }
}

// ➕ Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// 📤 Export quotes to JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// 📥 Import quotes from JSON file
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
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to import file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// 🔁 Sync with mock server (JSONPlaceholder)
function syncWithServer() {
  fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(res => res.json())
    .then(serverQuotes => {
      let newQuotes = [];
      serverQuotes.forEach(post => {
        const quote = {
          text: post.title,
          category: "ServerSync"
        };
        const exists = quotes.some(local => local.text === quote.text);
        if (!exists) {
          newQuotes.push(quote);
        }
      });

      if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        populateCategories();
        showNotification(`✅ Synced ${newQuotes.length} new quotes from server.`);
      } else {
        showNotification("✔️ No new quotes to sync.");
      }
    })
    .catch(() => {
      showNotification("⚠️ Failed to sync with server.");
    });
}

// 🛎 Show notification message
function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => { note.textContent = ""; }, 5000);
}

// 🚀 On page load
document.addEventListener("DOMContentLoaded", function () {
  loadQuotes();
  showLastViewedQuote();
  populateCategories();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
});
