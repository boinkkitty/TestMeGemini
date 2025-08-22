import axios from "axios";

export function handleError(error: unknown): string {
    let errMsg = "An unknown error occurred";

    if (axios.isAxiosError(error)) {
        if (error.response) {
            errMsg = error.response.data?.error || error.response.statusText || errMsg;
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