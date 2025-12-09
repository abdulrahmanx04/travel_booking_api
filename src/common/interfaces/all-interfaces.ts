
export interface UserData {
    id: string,
    role: string
}


export interface AuthRequest {
    user?: UserData
}

export interface NodeMailerOptions {
    from: string
    to: string
    subject: string
    html: string
}


export interface UploadedMedia {
    fileUrl: string
    fileType: string
}
