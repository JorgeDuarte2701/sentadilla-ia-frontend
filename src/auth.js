export const auth = {
  set(t) { localStorage.setItem("token", t); },
  clear() { localStorage.removeItem("token"); },
  async me(API) { const { data } = await API.get("/auth/me"); return data; },
};
