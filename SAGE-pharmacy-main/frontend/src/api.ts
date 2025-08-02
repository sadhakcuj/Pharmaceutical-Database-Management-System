import axios, { AxiosError } from "axios";

let requestRetryPoll: {
  url: string;
  data: any;
}[] = [];

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000/api/",
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access-token");
  const refresh = localStorage.getItem("refresh-token");

  if (token && config.headers.Authorization !== `Bearer ${refresh}`) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const req = res.config;
    requestRetryPoll = requestRetryPoll.filter(
      (record) => record.data !== req.data || record.url !== req.url
    );
    return res;
  },
  async (error: AxiosError) => {
    const config = error.config!;
    const req = {
      data: config.data,
      url: config.url!,
    };
    const retry =
      requestRetryPoll.find(
        (record) => record.data === req.data && record.url === req.url
      ) !== undefined;

    if (error.response?.status === 401 && !retry) {
      requestRetryPoll.push(req);

      const refresh = localStorage.getItem("refresh-token");
      if (refresh) {
        const res = await api.get("/auth/refresh-tokens", {
          headers: {
            Authorization: `Bearer ${refresh}`,
          },
        });
        const { accessToken, refreshToken } = res.data;

        localStorage.setItem("access-token", accessToken);
        localStorage.setItem("refresh-token", refreshToken);

        return api(config);
      }
    } else if (retry) {
      const refresh = localStorage.getItem("refresh-token");
      if (config.headers.Authorization === `Bearer ${refresh}`) {
        localStorage.clear();
        requestRetryPoll = requestRetryPoll.filter(
          (record) => record.data !== req.data || record.url !== req.url
        );
      } else {
        const token = localStorage.getItem("access-token");
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      }
    }

    if (error.response?.status === 401) {
      location.href = "/login";
    }

    return Promise.reject(error);
  }
);
