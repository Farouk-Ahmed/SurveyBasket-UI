export interface FileResponse {
    id: number;
    fileName: string;
    fileUrl: string;
    contentType: string;
    fileSize: number;
    uploadedByName: string;
    uploadedById: string;
    uploadedOn: string;
    pollId?: number;
}
