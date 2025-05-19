import Swal from "sweetalert2";

export default class AuthView {
  constructor(container) {
    this.app = container;
  }

  render(html) {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.app.innerHTML = html;
      });
    } else {
      this.app.innerHTML = html;
    }
  }

  loginTemplate() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">Login</h2>
            <p class="auth-subtitle">Welcome back! Log in to continue</p>
          </div>
          
          <form id="form-login">
            <div class="auth-input-group">
              <i class="fas fa-envelope"></i>
              <input type="email" id="email" name="email" class="auth-input" placeholder="Email" required autocomplete="email">
            </div>
            
            <div class="auth-input-group">
              <i class="fas fa-lock"></i>
              <input type="password" id="password" name="password" class="auth-input" placeholder="Password" required autocomplete="current-password">
            </div>
            
            <button type="submit" class="auth-submit-btn">
              <span>Masuk</span>
            </button>
          </form>
          
          <div class="auth-footer">
            <p class="auth-switch">Belum punya akun? <a href="#/register">Register</a></p>
          </div>
        </div>
      </div>
    `;
  }

  registerTemplate() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">Register</h2>
            <p class="auth-subtitle">Create your account</p>
          </div>
          
          <form id="form-register">
            <div class="auth-input-group">
              <i class="fas fa-user"></i>
              <input type="text" id="name" name="name" class="auth-input" placeholder="Nama" required autocomplete="name">
            </div>
            
            <div class="auth-input-group">
              <i class="fas fa-envelope"></i>
              <input type="email" id="email" name="email" class="auth-input" placeholder="Email" required autocomplete="email">
            </div>
            
            <div class="auth-input-group">
              <i class="fas fa-lock"></i>
              <input type="password" id="password" name="password" class="auth-input" placeholder="Password" required autocomplete="new-password">
            </div>
            
            <button type="submit" class="auth-submit-btn">
              <span>Daftar</span>
            </button>
          </form>
          
          <div class="auth-footer">
            <p class="auth-switch">Sudah punya akun? <a href="#/login">Login</a></p>
          </div>
        </div>
      </div>
    `;
  }

  bindLogin(handler) {
    // Tunggu sampai DOM dirender
    requestAnimationFrame(() => {
      const loginForm = this.app.querySelector("#form-login");
      if (loginForm) {
        console.debug("[AuthView] Binding login form submit event");
        loginForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const submitBtn = loginForm.querySelector("button[type='submit']");
          submitBtn.innerHTML =
            '<span class="loading-spinner"></span> <span>Loading...</span>';
          submitBtn.disabled = true;

          const data = {
            email: e.target.email.value,
            password: e.target.password.value,
          };

          handler(data).finally(() => {
            submitBtn.innerHTML = "<span>Masuk</span>";
            submitBtn.disabled = false;
          });
        });
      } else {
        console.error("[AuthView] Cannot find login form element!");
      }
    });
  }

  bindRegister(handler) {
    // Tunggu sampai DOM dirender
    requestAnimationFrame(() => {
      const registerForm = this.app.querySelector("#form-register");
      if (registerForm) {
        console.debug("[AuthView] Binding register form submit event");
        registerForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const submitBtn = registerForm.querySelector("button[type='submit']");
          submitBtn.innerHTML =
            '<span class="loading-spinner"></span> <span>Loading...</span>';
          submitBtn.disabled = true;

          const data = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value,
          };

          handler(data).finally(() => {
            submitBtn.innerHTML = "<span>Daftar</span>";
            submitBtn.disabled = false;
          });
        });
      } else {
        console.error("[AuthView] Cannot find register form element!");
      }
    });
  }

  showSuccess(msg) {
    Swal.fire({
      icon: "success",
      title: msg,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "animate__animated animate__fadeInUp",
      },
    });
  }

  showError(msg) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonColor: "var(--accent)",
    });
  }
}
