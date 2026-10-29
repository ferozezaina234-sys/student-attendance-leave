
$(function () {
  function esc(v) {
    return $("<div>").text(v == null ? "" : String(v)).html();
  }

  $("#logoutBtn").on("click", function () {
    $.post("/api/logout").always(() => location.href = "/");
  });

  $.get("/api/me").done(function (r) {
    if (r.user.role === "admin") location.href = "/admin.html";
  }).fail(() => location.href = "/");

  $.get("/api/dashboard").done(function (d) {
    $("#percentage").text(d.percentage + "%");
    $("#presentCount").text(d.present);
    $("#absentCount").text(d.absent);

    if (!d.records.length) {
      $("#attendanceRows").html('<tr><td colspan="3" class="text-secondary">No attendance records yet.</td></tr>');
      return;
    }

    $("#attendanceRows").html(d.records.map(r => `
      <tr>
        <td>${esc(r.date)}</td>
        <td>${esc(r.subject)}</td>
        <td><span class="status status-${esc(r.status.toLowerCase())}">${esc(r.status)}</span></td>
      </tr>`).join(""));
  }).fail(() => location.href = "/");
});
