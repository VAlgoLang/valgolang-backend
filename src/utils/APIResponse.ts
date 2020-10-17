export interface APIResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const failedAPIResponse = (message: string) => {
    return {
        message: message,
        success: false
    } as APIResponse
};

export const successfulAPIResponse = (message: string, data?: any) => {
    return {
        message: message,
        success: true,
        data: data,
    } as APIResponse
}
