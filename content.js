function createButton(handle) {
  const button = document.createElement("button");
  button.textContent = "Scan";
  button.className = "scan-btn";

  // move to css later
  button.style.marginLeft = "6px";
  button.style.padding = "2px 5px";
  button.style.border = "2px solid rgb(29, 155, 240)";
  button.style.borderRadius = "20px";
  button.style.cursor = "pointer";
  button.style.backgroundColor = "black";
  button.style.color = "#fff";
  button.style.fontSize = "12px";

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log("Button pressed on ", handle)
    injectPopup(handle);
  })

  return button;
}


function injectPopup(handle) {
  if (document.getElementById("sp-popup-container")) return;

  fetch(chrome.runtime.getURL("popup/popup.html"))
    .then((res) => res.text())
    .then((html) => {
      const container = document.createElement("div");
      container.id = "sp-popup-container";
      container.innerHTML = html;

      // dynamically assinging link to stylesheet for popup
      const link = container.querySelector('link[rel="stylesheet"]');
      if (link) {
        link.href = chrome.runtime.getURL("popup/popup.css");
      }

      document.body.appendChild(container);
      console.log("popup opened for: ", handle)

      const overlay = container.querySelector(".sp-overlay");
      if (overlay) overlay.addEventListener("click", () => container.remove())
    })
    .catch((err) => console.error("Failed to load popup:", err));
}


function injectButtons() {
  const tweets = document.querySelectorAll("article");

  tweets.forEach((tweet) => {
    const spans = tweet.querySelectorAll("span");

    spans.forEach((span) => {
      const text = span.innerText?.trim();

      if (text?.startsWith("@")) {
        if (span.closest("article") !== tweet) return;
        if (span.nextSibling && span.nextSibling.classList?.contains("scan-btn")) return;
        const button = createButton(text); // text is user's handle
        span.insertAdjacentElement("afterend", button);
      }
    });
  });
}


// handling infinite scrolling
const observer = new MutationObserver(() => injectButtons());
observer.observe(document.body, {
  childList: true,
  subtree:true,
});


injectButtons();