$(function () {
  let students = [];

  function esc(value) {
    return $("<div>").text(value == null ? "" : String(value)).html();
  }

  function alertMessage(text, success) {
    $("#message").removeClass("d-none alert-success alert-danger")
      .addClass(success ? "alert-success" : "alert-danger").text(text);
  }

  function badge(status) {
    return `<span class="status status-${status.toLowerCase()}">${esc(status)}</span>`;
  }

  function loadStudents() {
    return $.get("/api/admin/students").done(function (data) {
      students = data;

      $("#studentSelect").html('<option value="">Select a student</option>' +
        data.map(s => `<option value="${esc(s._id)}">${esc(s.name)}${s.registerNo ? " — " + esc(s.registerNo) : ""}</option>`).join(""));

      $("#studentRows").html(data.length ? data.map(s => `
        <tr>
          <td>${esc(s.name)}</td>
          <td>${esc(s.registerNo || "—")}</td>
          <td>${esc(s.email)}</td>
          <td>${esc(s.department || "—")}</td>
        </tr>`).join("") : '<tr><td colspan="4">No students registered.</td></tr>');
    });
  }

  function loadReports() {
    $.get("/api/admin/reports").done(function (r) {
      $("#studentTotal").text(r.students);
      $("#recordTotal").text(r.attendanceRecords);
      $("#pendingTotal").text(r.pending);
      $("#approvedTotal").text(r.approved);
    });
  }

  function loadLeaves() {
    $.get("/api/admin/leaves").done(function (leaves) {
      if (!leaves.length) {
        $("#leaveApplications").html('<p class="text-secondary">No leave applications yet.</p>');
        return;
      }

      $("#leaveApplications").html(leaves.map(l => {
        const student = l.student || {};
        const pending = l.status === "Pending";

        return `<div class="leave-item">
          <div class="d-flex justify-content-between gap-2 flex-wrap">
            <strong>${esc(student.name || "Student")}</strong>
            ${badge(l.status)}
          </div>
          <div class="small text-secondary mt-1">${esc(student.registerNo || student.email || "")}</div>
          <p class="small mt-3 mb-1"><strong>Dates:</strong> ${esc(l.fromDate)} – ${esc(l.toDate)}</p>
          <p class="mb-2">${esc(l.reason)}</p>
          ${l.reviewNote ? `<p class="small text-secondary">Note: ${esc(l.reviewNote)}</p>` : ""}
          ${pending ? `
            <input class="form-control form-control-sm mb-2 review-note" id="note-${esc(l._id)}" placeholder="Optional review note">
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-sm review-btn" data-id="${esc(l._id)}" data-status="Approved">Approve</button>
              <button class="btn btn-outline-danger btn-sm review-btn" data-id="${esc(l._id)}" data-status="Rejected">Reject</button>
            </div>` : ""}
        </div>`;
      }).join(""));
    });
  }

  $("#attendanceForm").on("submit", function (e) {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(this).entries());

    $.ajax({
      url: "/api/admin/attendance",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data)
    }).done(function (r) {
      alertMessage(r.message, true);
      loadReports();
    }).fail(function (xhr) {
      alertMessage(xhr.responseJSON?.message || "Could not save attendance.", false);
    });
  });

  $("#leaveApplications").on("click", ".review-btn", function () {
    const id = $(this).data("id");
    const status = $(this).data("status");
    const reviewNote = $("#note-" + id).val() || "";

    $.ajax({
      url: "/api/admin/leaves/" + encodeURIComponent(id),
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify({ status, reviewNote })
    }).done(function (r) {
      alertMessage(r.message, true);
      loadLeaves();
      loadReports();
    }).fail(function (xhr) {
      alertMessage(xhr.responseJSON?.message || "Could not update leave.", false);
    });
  });

  $("#downloadReport").on("click", function () {
    const header = ["Name", "Register Number", "Email", "Department"];
    const rows = students.map(s => [s.name, s.registerNo, s.email, s.department]);
    const csv = [header, ...rows].map(row =>
      row.map(v => {
        let value = String(v || "");
        if (/^[=+\-@\t\r]/.test(value)) value = "'" + value;
        return '"' + value.replace(/"/g, '""') + '"';
      }).join(",")
    ).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  $("#logoutBtn").on("click", function () {
    $.post("/api/logout").always(function () {
      location.href = "/";
    });
  });

  $("#attendanceDate").val(new Date().toISOString().slice(0, 10));

  $.get("/api/me").done(function (data) {
    if (data.user.role !== "admin") {
      location.href = "/dashboard.html";
      return;
    }

    loadStudents().done(loadReports);
    loadLeaves();
  }).fail(function () {
    location.href = "/";
  });
});
