import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react'
import { useField } from 'formik'
import * as React from 'react'

export interface InputFieldProps {
  name: string
  label: string
  placeholder: string
  type?: string
}

export default function InputField(
  props: InputFieldProps
) {
  const [field, { error }] = useField(props)

  return (
    <FormControl>
      <FormLabel htmlFor={field.name}>
        {props.label}
      </FormLabel>
      <Input
        {...field}
        {...props}
        id={field.name}
      />
      {error && (
        <FormErrorMessage>
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  )
}
