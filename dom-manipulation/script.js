let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not take life too seriously. You will never get out of it alive.", category: "Humor" }
];

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Populate dropdown
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

  const saved = localStorage.getItem("selectedCategory");
  if (saved) {
    categoryFilter.value = saved;
    filterQuotes();
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filtered.length > 0) {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  } else {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
  }
}

// Show random quote
function showRandomQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Show last viewed quote
function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>${quote.text}</p><em>Category: ${quote.category}</em>`;
  }
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    alert("Quote added!");
    // Simulate POST to server
    postQuoteToServer(newQuote);
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// Export to JSON
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

// Import from JSON
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

// ✅ Fetch quotes from mock server
function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(res => res.json())
    .then(serverQuotes => serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    })));
}

// ✅ POST a new quote to the server (simulated)
function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Posted to server:", data);
  });
}

// ✅ Sync quotes from server
function syncQuotes() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
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
        showNotification(`✅ Synced ${added} new quotes from server.`);
      } else {
        showNotification("✔️ No new quotes to sync.");
      }
    })
    .catch(() => {
      showNotification("⚠️ Failed to sync with server.");
    });
}

// ✅ Notification message
function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => {
    note.textContent = "";
  }, 5000);
}

// ✅ Periodic Sync (every 2 minutes)
setInterval(syncQuotes, 120000);

// 🚀 DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  loadQuotes();
  showLastViewedQuote();
  populateCategories();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
});
