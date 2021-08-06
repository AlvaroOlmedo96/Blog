export interface User{
    _id?: string,
    username?: string,
    email?: string,
    password?: string,
    roles?: [],
    profileImg?: string,
    chats?: [],
    contacts?: [],
    posts?: [],
    views?: number,
    likes?: number
}