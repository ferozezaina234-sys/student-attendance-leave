
$(function () {
  function esc(v) {
    return $("<div>").text(v == null ? "" : String(v)).html();
  }

  function showMessage(msg, ok) {
    $("#message").removeClass("d-none alert-success alert-danger")
      .addClass(ok ? "alert-success" : "alert-danger").text(msg);
  }

  const today = new Date().toLocaleDateString("en-CA");
  $("#fromDate, #toDate").attr("min", today);

  $("#fromDate").on("change", function () {
    $("#toDate").attr("min", this.value);
  });

  $("#logoutBtn").on("click", function () {
    $.post("/api/logout").always(() => location.href = "/");
  });

  function loadLeaves() {
    $.get("/api/dashboard").done(function (d) {
      if (!d.leaves.length) {
        $("#leaveRows").html('<tr><td colspan="4" class="text-secondary">No leave requests submitted yet.</td></tr>');
        return;
      }

      $("#leaveRows").html(d.leaves.map(l => `
        <tr>
          <td>${esc(l.fromDate)}</td>
          <td>${esc(l.toDate)}</td>
          <td>${esc(l.reason)}</td>
          <td><span class="status status-${esc(l.status.toLowerCase())}">${esc(l.status)}</span></td>
        </tr>`).join(""));
    }).fail(() => location.href = "/");
  }

  $.get("/api/me").done(function (r) {
    if (r.user.role === "admin") location.href = "/admin.html";
  }).fail(() => location.href = "/");

  $("#leaveForm").on("submit", function (e) {
    e.preventDefault();
    const form = this;
    const d = Object.fromEntries(new FormData(form).entries());

    if (d.fromDate > d.toDate) {
      showMessage("The end date must be on or after the start date.", false);
      return;
    }

    $.ajax({
      url: "/api/leaves",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(d)
    }).done(function (r) {
      showMessage(r.message, true);
      form.reset();
      $("#toDate").attr("min", $("#fromDate").val() || today);
      loadLeaves();
    }).fail(xhr => showMessage(xhr.responseJSON?.message || "Unable to submit leave request.", false));
  });

  loadLeaves();
});
