chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

fetch("http://localhost:1399/till-code").then(resp => {
  console.log(resp.status, resp.statusText);
});
