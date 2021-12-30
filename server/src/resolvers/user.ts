import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import argon2 from 'argon2'
import { User } from '../entities/User'
import { COOKIE_NAME } from '../constants/index'
import { Context } from '../types/Context'
import { LoginInput } from '../types/input/LoginInput'
import { validateRegisterInput } from '../utils/validateRegisterInput'
import { RegisterInput } from '../types/input/RegisterInput'
import { UserMutationResponse } from '../types/mutationResponse/UserMutationResponse'

@Resolver()
export class UserResolver {
  @Mutation((_returns) => UserMutationResponse, { nullable: true })
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() {req}: Context
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput(registerInput)

    if (validateRegisterInputErrors !== null) {
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      }
    }

    try {
      const { email, username, password } = registerInput
      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      })
      if (existingUser)
        return {
          code: 400,
          success: false,
          message: 'The username or email have existed',
          errors: [
            {
              field: existingUser.username === username ? 'username' : 'email',
              message: `${existingUser.username === username ? 'Username' : 'Email'} already taken`,
            },
          ],
        }

      const hashPassword = await argon2.hash(password)

      const newUser = User.create({
        username,
        password: hashPassword,
        email,
      })

      await newUser.save()

      req.session.userId = newUser.id

      return {
        code: 200,
        success: true,
        message: 'User registration successful',
        user: newUser,
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      }
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg('loginInput') loginInput: LoginInput,
    @Ctx() {req}: Context
    ): Promise<UserMutationResponse> {
    try {
      const { usernameOrEmail, password } = loginInput
      const existingUser = await User.findOne(
        usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail }
      )
      if(!existingUser) {
        return {
          code: 400,
          success: false,
          message: 'User not found',
          errors: [
            {field: 'usernameOrEmail', message: 'Username or email incorrect'}
          ]
        }
      }
      const passwordValid = await argon2.verify(existingUser.password, password)
      if(!passwordValid) {
        return {
          code: 400,
          success: false,
          message: 'Wrong password',
          errors: [
            {field: 'password', message: 'Wrong password'}
          ]
        }
      }

      // Create session and return cookie
      req.session.userId = existingUser.id

      return {
        code: 200,
        success: true,
        message: 'Login successfully',
        user: existingUser
      }
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      }
    }
  }

  @Mutation(_return => Boolean)
  logout(
    @Ctx() {req, res}: Context
  ) : Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME)
      req.session.destroy(error => {
        if(error) {
          console.log('Destroying session error ', error)
          resolve(false)
        }
        resolve(true)
      })
    })
  }
}
