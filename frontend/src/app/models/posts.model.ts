export interface Post{
    title?: string,
    category?: string,
    imgURL?: string,
    description?: string,
    propietaryId?: string,
    propietaryUsername?: string,
    likes?: [],
    comments?: [{
        comment: string,
        writer: string,
        createdAt: Date
    }],
    createdAt?: Date
}