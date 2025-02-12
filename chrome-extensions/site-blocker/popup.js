const urlInput = document.querySelector(".url-input");
const addButton = document.querySelector(".add-button");
const blockedList = document.querySelector(".blocked-list");
const toggleBlock = document.querySelector(".toggle-block-btn");
const unblockFor10Min = document.querySelector(".unblock-10-min");

async function loadBlockedSites() {
  let { blockedSites } = await chrome.storage.local.get("blockedSites");
  let { isBlocking } = await chrome.storage.local.get("isBlocking");
  toggleBlock.checked = isBlocking
  blockedSites = blockedSites || [];
  blockedList.innerHTML = "";
  blockedSites.forEach((url) => {
    let li = document.createElement("li");
    li.className = "blocked-list-item"
    let span = document.createElement("span");
    span.className = "remove-list-item-title"
    span.textContent = url;
    li.appendChild(span);
    let removeBtn = document.createElement("button");
    removeBtn.className = "remove-list-item-btn"
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => removeSite(url);
    li.appendChild(removeBtn);
    blockedList.appendChild(li);
  });
}

async function addSite() {
  let url = urlInput.value.trim();
  if (!url) return;
  let { blockedSites } = await chrome.storage.local.get("blockedSites");
  blockedSites = blockedSites || [];
  if (!blockedSites.includes(url)) {
    blockedSites.push(url);
    await chrome.storage.local.set({ blockedSites });
    urlInput.value = "";
    loadBlockedSites();
    updateRules();
  }
}

async function removeSite(url) {
  let { blockedSites } = await chrome.storage.local.get("blockedSites");
  blockedSites = blockedSites.filter((site) => site !== url);
  await chrome.storage.local.set({ blockedSites });
  loadBlockedSites();
  updateRules();
}

async function updateRules() {
  let { isBlocking } = await chrome.storage.local.get("isBlocking");
  if (isBlocking) {
    let { blockedSites } = await chrome.storage.local.get("blockedSites");
    blockedSites = blockedSites || [];
    let rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { url: "https://www.google.com/" }
      },
      condition: { urlFilter: `*${site}*`, resourceTypes: ["main_frame"] }
    }));

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules() || [];
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRules.map(rule => rule.id),
      addRules: rules,
    });
  } else {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRules.map(rule => rule.id),
    });
  }
}

addButton.addEventListener("click", addSite);

toggleBlock.addEventListener("change", async () => {
  await chrome.storage.local.set({ isBlocking: toggleBlock.checked });
  updateRules();
});

unblockFor10Min.addEventListener("click", async () => {
  await chrome.storage.local.set({ isBlocking: false });
  toggleBlock.checked = false;
  updateRules();
  setTimeout(
    async () => {
      await chrome.storage.local.set({ isBlocking: true });
      toggleBlock.checked = true;
      updateRules();
    },
    1000,
  )
})

loadBlockedSites();
