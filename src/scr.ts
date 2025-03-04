document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn") as HTMLButtonElement;
    const registerBtn = document.getElementById("register-btn") as HTMLButtonElement;
    const loginForm = document.getElementById("login-form") as HTMLDivElement;
    const registerForm = document.getElementById("register-form") as HTMLDivElement;

    const loginEmail = document.getElementById("login-email") as HTMLInputElement;
    const loginPassword = document.getElementById("login-password") as HTMLInputElement;
    const registerEmail = document.getElementById("register-email") as HTMLInputElement;
    const registerUsername = document.getElementById("register-username") as HTMLInputElement;
    const registerPassword = document.getElementById("register-password") as HTMLInputElement;

    // Alternar entre formularios
    function toggleForms(isLogin: boolean): void {
        if (isLogin) {
            loginForm.classList.add("active");
            registerForm.classList.remove("active");
            loginBtn.classList.add("active");
            registerBtn.classList.remove("active");
        } else {
            registerForm.classList.add("active");
            loginForm.classList.remove("active");
            registerBtn.classList.add("active");
            loginBtn.classList.remove("active");
        }
    }

    // Validación de correo
    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Mostrar error
    function showError(input: HTMLInputElement, message: string): void {
        clearErrors();
        const errorElement = document.createElement("p");
        errorElement.classList.add("error");
        errorElement.textContent = message;
        input.parentElement?.appendChild(errorElement);
    }

    // Limpiar errores previos
    function clearErrors(): void {
        const errors = document.querySelectorAll(".error");
        errors.forEach((error) => error.remove());
    }

    // Validar el formulario de inicio de sesión
    function validateLoginForm(): boolean {
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
    function validateRegisterForm(): boolean {
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
    loginForm.querySelector("form")?.addEventListener("submit", (e) => {
        if (!validateLoginForm()) {
            e.preventDefault();
        }
    });

    // Validar formulario de registro antes de enviarlo
    registerForm.querySelector("form")?.addEventListener("submit", (e) => {
        if (!validateRegisterForm()) {
            e.preventDefault();
        }
    });
});
