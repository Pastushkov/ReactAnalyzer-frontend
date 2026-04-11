

import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });


  axiosRetry(instance, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 2000,
    retryCondition: (error) => {
      const status = error.response?.status || 400;
      const code = error.code;
      const isTimeout = code === 'ECONNABORTED';
      const isNetworkError = !error.response && !!error.code;
      const isRetryableStatus = [401].includes(status);
      return isTimeout || isNetworkError || isRetryableStatus;
    },
  });

  return instance;
};

export const getApiInstance = () => {
  return createApiInstance(API_BASE_URL);
};


