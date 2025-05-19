import AuthModel from "../models/auth-model.js";
import { setToken } from "../utils/storage.js";
import { subscribePush } from "../utils/notification.js";

export default class AuthPresenter {
  constructor(view, router) {
    this.model = new AuthModel();
    this.view = view;
    this.router = router;
  }

  init({ route }) {
    console.debug("[AuthPresenter] Initializing with route:", route);

    if (route === "/login") {
      console.debug("[AuthPresenter] Rendering login template");
      this.view.render(this.view.loginTemplate());

      // Langsung bind event setelah render
      this.view.bindLogin(this.doLogin.bind(this));
    } else if (route === "/register") {
      console.debug("[AuthPresenter] Rendering register template");
      this.view.render(this.view.registerTemplate());

      // Langsung bind event setelah render
      this.view.bindRegister(this.doRegister.bind(this));
    } else {
      console.warn("[AuthPresenter] Unknown route:", route);
      location.hash = "#/login";
    }
  }

  async doLogin(data) {
    try {
      const res = await this.model.login(data);
      if (res.error) {
        this.view.showError(res.message);
        return;
      }

      setToken(res.loginResult.token);
      this.view.showSuccess("Login berhasil!");
      await subscribePush();

      setTimeout(() => {
        location.hash = "#/dashboard";
      }, 500);
    } catch (error) {
      console.error("[AuthPresenter] Login error:", error);
      this.view.showError("Terjadi kesalahan saat login. Coba lagi.");
    }
  }

  async doRegister(data) {
    console.debug("[AuthPresenter] Processing registration for:", data.email);

    try {
      const res = await this.model.register(data);
      if (res.error) {
        this.view.showError(res.message);
        return;
      }

      this.view.showSuccess("Register berhasil! Silakan login.");
      setTimeout(() => {
        console.debug(
          "[AuthPresenter] Redirecting to login after registration"
        );
        location.hash = "#/login";
      }, 500);
    } catch (error) {
      console.error("[AuthPresenter] Registration error:", error);
      this.view.showError("Terjadi kesalahan saat registrasi. Coba lagi.");
    }
  }
}
