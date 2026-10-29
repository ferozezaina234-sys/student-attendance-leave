
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

  $.get("/api/notifications").done(function (items) {
    if (!items.length) {
      $("#notifications").html('<p class="text-secondary">You have no notifications yet.</p>');
      return;
    }

    $("#notifications").html(items.map(n => `
      <div class="notification-item">
        <div class="d-flex gap-3">
          <div class="brand-icon" style="width:42px;height:42px;font-size:1rem">N</div>
          <div>
            <strong>${esc(n.message)}</strong>
            <div class="text-secondary small mt-2">${esc(new Date(n.createdAt).toLocaleString())}</div>
          </div>
        </div>
      </div>`).join(""));
  }).fail(() => $("#notifications").text("Unable to load notifications. Please sign in again."));
});
