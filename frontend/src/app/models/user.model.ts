export interface User{
    _id?: string,
    username?: string,
    email?: string,
    password?: string,
    roles?: [],
    biography?: string,
    profileImg?: string,
    profileCoverImg?: string,
    notifications?: [{
        send: string,
        receive: string,
        isReaded: boolean
    }],
    chats?: [{
        _id: string,
        members: [],
        typeChat: string
    }],
    contacts?: [],
    posts?: [],
    views?: [],
    likes?: [{
        postId: string,
        usersLikedPost: string
    }],
    likedPosts?: []
}