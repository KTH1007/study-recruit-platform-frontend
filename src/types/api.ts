export type ApiResponse<T> = {
    data: T;
    message?: string;
};

export type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    last: boolean;
};