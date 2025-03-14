export enum Route {
  Login = "/auth/login",
  Logout = "/auth/logout",
  Home = "/channels/me/friends",
}

function get<T extends Record<string, unknown>>(
  target: T,
  key: string,
  receiver: any
): ProxyConstructor | unknown {
  const value = target[key];
  if (typeof value === "object" && value !== null) {
    if ("path" in target && Array.isArray(target.path)) {
      target.path.push(key);
    }

    Object.defineProperty(value, "path", {
      value: target.path || [key],
      writable: true,
    });

    return new Proxy(value, { get });
  }

  const path =
    Array.isArray(target.path) &&
    target.path.push(value) &&
    target.path.join("/");

  return path || value;
}

const r = {
  auth: {
    login: "login",
    register: "register",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password",
    logout: "logout",
  },
} as const;

export const routes = new Proxy(r, {
  get,
  set() {
    return true;
  },
});
