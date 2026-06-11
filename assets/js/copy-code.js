document.addEventListener("click", function (e) {
  const btn = e.target.closest(".copy-button");
  if (!btn) return;

  const wrapper = btn.closest(".code-block");
  if (!wrapper) return;

  const code = wrapper.querySelector("pre code");
  if (!code) return;

  navigator.clipboard.writeText(code.textContent).then(function () {
    btn.setAttribute("data-copy-state", "copied");
    setTimeout(function () {
      btn.removeAttribute("data-copy-state");
    }, 1500);
  });
});
