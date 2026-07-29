interface FieldErrorProps {
  readonly id: string
  readonly message: string | undefined
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null

  return (
    <span className="mt-2 block text-xs text-danger" id={id}>
      {message}
    </span>
  )
}
