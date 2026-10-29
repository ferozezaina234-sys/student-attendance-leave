
$(function () {
  $("#logoutBtn").on("click", function () {
    $.post("/api/logout").always(() => location.href = "/");
  });

  $.get("/api/me").done(function (r) {
    if (r.user.role === "admin") {
      location.href = "/admin.html";
      return;
    }

    $.get("/api/dashboard").done(function (d) {
      $("#percentage").text(d.percentage + "%");
      $("#present").text(d.present);
      $("#absent").text(d.absent);
      $("#leaveCount").text(d.leaves.length);
      $("#pending").text(d.leaves.filter(x => x.status === "Pending").length);
      $("#approved").text(d.leaves.filter(x => x.status === "Approved").length);
      $("#rejected").text(d.leaves.filter(x => x.status === "Rejected").length);
    });
  }).fail(() => location.href = "/");
});
