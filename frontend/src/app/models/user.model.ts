export interface User{
    _id?: string,
    username?: string,
    email?: string,
    password?: string,
    roles?: [],
    biography?: string,
    profileImg?: string,
    profileCoverImg?: string,
    notifications?: [],
    chats?: [],
    contacts?: [],
    posts?: [],
    views?: number,
    likes?: number
}