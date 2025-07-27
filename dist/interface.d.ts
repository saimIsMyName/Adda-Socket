export interface UserData {
    _id: string;
    name?: string;
    email?: string;
}
export interface ChatUser {
    _id: string;
    name?: string;
    email?: string;
}
interface Chat {
    _id: string;
    users: ChatUser[];
}
export interface MessageData {
    _id: string;
    sender: ChatUser;
    content: string;
    chat: Chat;
    createdAt: Date;
}
export {};
//# sourceMappingURL=interface.d.ts.map