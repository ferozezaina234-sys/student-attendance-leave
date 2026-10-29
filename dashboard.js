
$(function () {
  function logout() {
    $.post("/api/logout").always(() => location.href = "/");
  }

  $("#logoutBtn").on("click", logout);

  $.get("/api/me").done(function (data) {
    if (data.user.role === "admin") {
      location.href = "/admin.html";
      return;
    }
    $("#studentName").text(data.user.name);
  }).fail(() => location.href = "/");

  $.get("/api/dashboard").done(function (data) {
    $("#percentage").text(data.percentage + "%");
    $("#presentCount").text(data.present);
    $("#absentCount").text(data.absent);
    $("#leaveCount").text(data.leaves.length);
  }).fail(function (xhr) {
    if (xhr.status === 401) location.href = "/";
    else $("#message").removeClass("d-none").text("Unable to load dashboard.");
  });
});
