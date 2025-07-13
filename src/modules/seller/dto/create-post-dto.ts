

export class CreatePostDto {
  title: string;
  content: string;
  authorId: string; 
  categoryId?: string; 
}