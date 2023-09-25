function showAddConfigForm() {
  document.getElementById("addConfigForm").style.display = "block";
  document.getElementById("updateConfigForm").style.display = "none";
}

function showUpdateConfigForm() {
  document.getElementById("addConfigForm").style.display = "none";
  document.getElementById("updateConfigForm").style.display = "block";
}

document.getElementById("addConfigBtn").addEventListener("click", function () {
  showAddConfigForm();
});

document
  .getElementById("updateConfigBtn")
  .addEventListener("click", function () {
    showUpdateConfigForm();
  });
