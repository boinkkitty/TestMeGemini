import axios from "axios";

function flattenApiError(data: unknown): string | null {
    if (!data) return null;

    if (typeof data === "string") {
        return data;
    }

    if (Array.isArray(data)) {
        const messages = data
            .map((item) => flattenApiError(item))
            .filter((item): item is string => Boolean(item));
        return messages.length > 0 ? messages.join(" ") : null;
    }

    if (typeof data === "object") {
        const values = Object.values(data as Record<string, unknown>);
        const messages = values
            .map((value) => flattenApiError(value))
            .filter((item): item is string => Boolean(item));
        return messages.length > 0 ? messages.join(" ") : null;
    }

    return null;
}

export function handleError(error: unknown): string {
    let errMsg = "An unknown error occurred";

    if (axios.isAxiosError(error)) {
        if (error.response) {
            errMsg =
                flattenApiError(error.response.data) ||
                error.response.statusText ||
                errMsg;
        } else if (error.request) {
            errMsg = "No response received from server";
        } else {
            errMsg = error.message;
        }
    } else if (error instanceof Error) {
        // Non-Axios errors
        errMsg = error.message;
    }

    return errMsg;
}
