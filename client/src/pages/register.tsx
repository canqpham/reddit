import { useMutation } from '@apollo/client'
import {
  Box,
  Button,
} from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import * as React from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { RegisterInput, useRegisterMutation } from '../generated/graphql'

export interface RegisterProps {}



export default function Register(props: RegisterProps) {

  const initialValues: RegisterInput = {
    username: '',
    password: '',
    email: '',
  }

  const [registerUser, { loading: _registerUserLoading, data, error }] = useRegisterMutation()

  const handleSubmit = async (values: RegisterInput) => {
    const res = await registerUser({
      variables: {
        registerInput: values
      },
    })
    console.log('RESPONSE ', res)
    return res
  }

  return (
    <Wrapper>
      {error && <p>Fail register</p>}
      {data && <p>{data?.register?.success ? JSON.stringify(data) : 'Cannot register'}</p>}
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={8}>
              <InputField
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              />
            </Box>
            <Box mt={8}>
              <InputField
                name="username"
                label="Username"
                placeholder="Username"
              />
            </Box>
            <Box mt={8}>
              <InputField
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
              />
            </Box>
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}
