import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "../common/constants";
import {
	getParticipantToken,
	removeParticipantToken,
} from "@/common/helpers";

const attachParticipantToken = (instance: AxiosInstance) => {
	instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		const token = getParticipantToken();
		config.headers = config.headers ?? {};

		if (token) config.headers.Authorization = `Bearer ${token}`;

		return config;
	});

	instance.interceptors.response.use(
		(res) => res,
		(err) => {
			if (err?.response?.status === 401) {
				removeParticipantToken();
			}
			return Promise.reject(err);
		}
	);

	return instance;
};

export const api = attachParticipantToken(
	axios.create({
		baseURL: API_URL,
		withCredentials: true,
		timeout: 60000,
	})
);
