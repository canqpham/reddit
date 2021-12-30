import { UpdatePostInput } from '../types/input/UpdatePostInput'
import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { Post } from '../entities/Post'
import { PostInput } from '../types/input/PostInput'
import { PostMutationResponse } from '../types/mutationResponse/PostMutationResponse'
import { checkAuth } from '../middleware/checkAuth'

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(@Arg('postInput') postInput: PostInput): Promise<PostMutationResponse> {
    try {
      const { title, text } = postInput
      const newPost = Post.create({
        title,
        text,
      })

      await newPost.save()

      return {
        code: 200,
        success: true,
        message: 'Post created successfully',
        post: newPost,
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        message: `Internal server error ${error.message}`,
        success: false,
      }
    }
  }

  @Query((_return) => PostMutationResponse)
  async posts(): Promise<PostMutationResponse> {
    try {
      return {
        code: 200,
        success: true,
        posts: await Post.find(),
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        message: `Internal server error ${error.message}`,
        success: false,
      }
    }
  }

  @Query((_return) => PostMutationResponse)
  async post(@Arg('id', (_type) => ID) id: number): Promise<PostMutationResponse> {
    try {
      return {
        code: 200,
        success: true,
        post: await Post.findOne(id),
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        message: `Internal server error ${error.message}`,
        success: false,
      }
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg('updatePostInput') updatePostInput: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const { id, title, text } = updatePostInput

      const existingPost = await Post.findOne(id)
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: 'Post not found',
        }
      }

      existingPost.title = title
      existingPost.text = text

      return {
        code: 200,
        success: true,
        post: await existingPost.save(),
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        message: `Internal server error ${error.message}`,
        success: false,
      }
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg('id', (_type) => ID) id: number,
    ): Promise<PostMutationResponse> {
    try {
      
      const existingPost = await Post.findOne(id)
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: 'Post not found',
        }
      }
      await Post.delete({ id })

      return {
        code: 200,
        success: true,
        message: 'Post deleted successfully',
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        message: `Internal server error. ${error.message}`,
        success: false,
      }
    }
  }
}
