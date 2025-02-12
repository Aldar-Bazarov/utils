chrome.storage.local.get(["isBlocking"], async ({ isBlocking }) => {
  console.log('isBlocking', isBlocking)
  if (isBlocking) {
    let { blockedSites } = await chrome.storage.local.get("blockedSites");
    blockedSites = blockedSites || [];
    console.log('blockedSites', blockedSites)

    let rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { url: "https://www.google.com/" }
      },
      condition: { urlFilter: `*${site}*`, resourceTypes: ["main_frame"] }
    }));

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log('oldRules', oldRules)

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
});
