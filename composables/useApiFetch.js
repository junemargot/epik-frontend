import { useFetch } from "#app";
import { useToast } from "~/composables/useToast";
import { generateErrorMessage } from "~/utils/errorHandler";

export const useApiFetch = (url, options = {}) => {
  const { showToast } = useToast();

  return useFetch(url, {
    ...options,

    async onResponseError({ response }) {
      if(process.client) {
        const message = generateErrorMessage(response);
        showToast(message, 'error', 4000);
      }

      if(options?.onResponseError) {
        await options.onResponseError({ response });
      }
    }
  });
}