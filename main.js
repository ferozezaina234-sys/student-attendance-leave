
$(function () {
  const login = $("#loginForm");
  const register = $("#registerForm");

  function showMessage(text, success = false) {
    $("#message")
      .removeClass("d-none alert-success alert-danger")
      .addClass(success ? "alert-success" : "alert-danger")
      .text(text);
  }

  $("#switchForm").on("click", function () {
    const registering = register.hasClass("d-none");

    login.toggleClass("d-none", registering);
    register.toggleClass("d-none", !registering);

    $("#formTitle").text(registering ? "Create your account" : "Welcome back!");
    $("#formSubtitle").text(registering ? "Join the student portal" : "Sign in to your account");
    $("#switchText").text(registering ? "Already registered?" : "New student?");
    $(this).text(registering ? "Sign in" : "Create account");
    $("#message").addClass("d-none");
  });

  function submitForm(url, form) {
    $.ajax({
      url: url,
      method: "POST",
      data: $(form).serialize()
    }).done(function (result) {
      location.href = result.user.role === "admin"
        ? "/admin.html"
        : "/dashboard.html";
    }).fail(function (xhr) {
      showMessage(xhr.responseJSON?.message || "Unable to continue. Please try again.");
    });
  }

  login.on("submit", function (e) {
    e.preventDefault();
    submitForm("/api/login", this);
  });

  register.on("submit", function (e) {
    e.preventDefault();
    submitForm("/api/register", this);
  });
});
