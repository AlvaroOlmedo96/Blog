export interface Chats{
    members?: [],
    messages?: [{
        msg?: String,
        emiterUserId?: String,
        emiterUsername?: String,
        receiveUserId?: String,
        receiveUsername?: String,
        createdAt?: Date,
        isReaded?: Boolean
    }],
    typeChat?: string,
    createdAt?: Date
}