const PATTERNS = {
    email: /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    name: /^[a-zA-Z\s'-]{2,60}$/
};

const getUsers = () => JSON.parse(localStorage.getItem('registered_users') || '[]');
const saveUser = u => localStorage.setItem('registered_users', JSON.stringify([...getUsers(), u]));

function clearState(el) {
    el.classList.remove('input-error', 'input-success');
    el.parentElement.querySelector('.error-message')?.remove();
}

function showError(el, msg) {
    clearState(el);
    el.classList.add('input-error');
    const s = document.createElement('small');
    s.className = 'error-message';
    s.setAttribute('role', 'alert');
    s.innerText = msg;
    (el.parentElement.querySelector('.password-hint') || el).insertAdjacentElement('afterend', s);
    return false;
}

function showSuccess(el) {
    clearState(el);
    el.classList.add('input-success');
    return true;
}

function validateName(el) {
    const v = el.value.trim();
    return !v ? showError(el, 'Full name is required.')
        : !PATTERNS.name.test(v) ? showError(el, 'Name must be 2–60 letters, spaces, hyphens or apostrophes.')
        : showSuccess(el);
}

function validateEmail(el) {
    const v = el.value.trim();
    return !v ? showError(el, 'Email address is required.')
        : !PATTERNS.email.test(v) ? showError(el, 'Please enter a valid email address.')
        : showSuccess(el);
}

function validatePassword(el, strict = false) {
    const v = el.value;
    if (!v) return showError(el, 'Password is required.');
    if (strict && v.length < 8) return showError(el, 'Password must be at least 8 characters.');
    if (strict && !PATTERNS.password.test(v)) return showError(el, 'Must include uppercase, lowercase, a digit and a special character.');
    return showSuccess(el);
}

function validateConfirm(el, pwEl) {
    return !el.value ? showError(el, 'Please confirm your password.')
        : el.value !== pwEl.value ? showError(el, 'Passwords do not match.')
        : showSuccess(el);
}

function showBanner(form, type, msg) {
    form.querySelector('.form-banner')?.remove();
    const d = document.createElement('div');
    d.className = `form-banner form-banner--${type}`;
    d.setAttribute('role', 'status');
    d.innerText = msg;
    form.prepend(d);
}

function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const [name, email, pw, cpw] = ['fullname', 'email', 'password', 'confirm-password'].map(id => document.getElementById(id));

    name.addEventListener('blur', () => validateName(name));
    email.addEventListener('blur', () => validateEmail(email));
    pw.addEventListener('blur', () => validatePassword(pw, true));
    cpw.addEventListener('blur', () => validateConfirm(cpw, pw));
    pw.addEventListener('input', () => cpw.value && validateConfirm(cpw, pw));

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (![validateName(name), validateEmail(email), validatePassword(pw, true), validateConfirm(cpw, pw)].every(Boolean)) return;

        const emailVal = email.value.trim().toLowerCase();
        if (getUsers().some(u => u.email === emailVal)) return showError(email, 'An account with this email already exists.');

        saveUser({ fullname: name.value.trim(), email: emailVal, password: pw.value });
        showBanner(form, 'success', 'Account created! Redirecting to login…');
        form.reset();
        [name, email, pw, cpw].forEach(el => el.classList.remove('input-success'));
        setTimeout(() => location.href = 'login.html', 2000);
    });
}

function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    const [email, pw] = ['email', 'password'].map(id => document.getElementById(id));

    email.addEventListener('blur', () => validateEmail(email));
    pw.addEventListener('blur', () => validatePassword(pw));

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (![validateEmail(email), validatePassword(pw)].every(Boolean)) return;

        const match = getUsers().find(u => u.email === email.value.trim().toLowerCase() && u.password === pw.value);
        if (!match) {
            showError(email, 'Invalid email or password.');
            showError(pw, 'Invalid email or password.');
            return;
        }

        showBanner(form, 'success', `Welcome back, ${match.fullname}! Redirecting…`);
        form.reset();
        [email, pw].forEach(el => el.classList.remove('input-success'));
        setTimeout(() => location.href = 'home.html', 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initRegisterForm();
    initLoginForm();
});
