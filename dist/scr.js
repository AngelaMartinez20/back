"use strict";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const registerEmail = document.getElementById("register-email");
    const registerUsername = document.getElementById("register-username");
    const registerPassword = document.getElementById("register-password");
    // Alternar entre formularios
    function toggleForms(isLogin) {
        if (isLogin) {
            loginForm.classList.add("active");
            registerForm.classList.remove("active");
            loginBtn.classList.add("active");
            registerBtn.classList.remove("active");
        }
        else {
            registerForm.classList.add("active");
            loginForm.classList.remove("active");
            registerBtn.classList.add("active");
            loginBtn.classList.remove("active");
        }
    }
    // Validación de correo
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Mostrar error
    function showError(input, message) {
        var _a;
        clearErrors();
        const errorElement = document.createElement("p");
        errorElement.classList.add("error");
        errorElement.textContent = message;
        (_a = input.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(errorElement);
    }
    // Limpiar errores previos
    function clearErrors() {
        const errors = document.querySelectorAll(".error");
        errors.forEach((error) => error.remove());
    }
    // Validar el formulario de inicio de sesión
    function validateLoginForm() {
        clearErrors();
        let isValid = true;
        if (!validateEmail(loginEmail.value)) {
            showError(loginEmail, "Por favor, ingresa un correo válido.");
            isValid = false;
        }
        if (loginPassword.value.trim().length < 6) {
            showError(loginPassword, "La contraseña debe tener al menos 6 caracteres.");
            isValid = false;
        }
        return isValid;
    }
    // Validar el formulario de registro
    function validateRegisterForm() {
        clearErrors();
        let isValid = true;
        if (!validateEmail(registerEmail.value)) {
            showError(registerEmail, "Por favor, ingresa un correo válido.");
            isValid = false;
        }
        if (registerUsername.value.trim() === "") {
            showError(registerUsername, "El nombre de usuario es obligatorio.");
            isValid = false;
        }
        if (registerPassword.value.trim().length < 6) {
            showError(registerPassword, "La contraseña debe tener al menos 6 caracteres.");
            isValid = false;
        }
        return isValid;
    }
    // Alternar entre los formularios al hacer clic
    loginBtn.addEventListener("click", () => toggleForms(true));
    registerBtn.addEventListener("click", () => toggleForms(false));
    // Validar formulario de inicio de sesión antes de enviarlo
    (_a = loginForm.querySelector("form")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (e) => {
        if (!validateLoginForm()) {
            e.preventDefault();
        }
    });
    // Validar formulario de registro antes de enviarlo
    (_b = registerForm.querySelector("form")) === null || _b === void 0 ? void 0 : _b.addEventListener("submit", (e) => {
        if (!validateRegisterForm()) {
            e.preventDefault();
        }
    });
});
