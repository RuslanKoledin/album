import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'

import { formatKyrgyzPhone, useGetAuthSessionQuery } from '@modules/auth'
import { useGetProjectQuery } from '@modules/project'
import {
  createPriceQuoteRequest,
  useCreatePriceQuoteQuery,
} from '@modules/pricing'
import { useOnlineStatus } from '@shared/hooks'
import { createClientId } from '@shared/lib'

import { useCreateOrderMutation } from '@order/api'
import {
  createOrderRequest,
  getCheckoutFormErrors,
  getOrderErrorMessage,
} from '@order/libs'
import { EMPTY_CHECKOUT_FORM, type CheckoutFormState } from '@order/model'

interface RetryIdentity {
  readonly fingerprint: string
  readonly key: string
}

export const useCheckoutForm = (projectId: string) => {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const projectQuery = useGetProjectQuery(projectId)
  const sessionQuery = useGetAuthSessionQuery()
  const [createOrder, mutation] = useCreateOrderMutation()
  const [formEdits, setFormEdits] = useState<Partial<CheckoutFormState>>({})
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const retryIdentity = useRef<RetryIdentity | null>(null)

  const sessionDefaults = sessionQuery.data?.authenticated
    ? {
        name: sessionQuery.data.user.name ?? '',
        phone: formatKyrgyzPhone(sessionQuery.data.user.phone),
      }
    : { name: '', phone: '' }
  const form: CheckoutFormState = {
    ...EMPTY_CHECKOUT_FORM,
    ...sessionDefaults,
    ...formEdits,
  }

  const project = projectQuery.data?.project
  const revision = projectQuery.data?.latestRevision
  const isApproved = Boolean(
    project?.approvedRevisionId &&
    revision &&
    project.approvedRevisionId === revision.id,
  )
  const priceRequest = useMemo(() => {
    if (!isApproved || !revision) return null
    const selection = revision.document.productSelection

    return createPriceQuoteRequest({
      catalogVersion: selection.catalogVersion,
      deliveryMethod: form.deliveryMethod,
      optionSelections: selection.optionSelections,
      productId: selection.productId,
      productSpecId: selection.productSpecId,
      spreadCount: revision.document.spreads.length,
    })
  }, [form.deliveryMethod, isApproved, revision])
  const priceQuoteQuery = useCreatePriceQuoteQuery(priceRequest ?? skipToken)
  const priceQuote = priceQuoteQuery.currentData
  const currentErrors = getCheckoutFormErrors(form)
  const errors = submitted ? currentErrors : {}
  const canSubmit = Boolean(
    isOnline &&
    isApproved &&
    sessionQuery.data?.authenticated &&
    form.approvedLayoutConfirmed &&
    form.mockConditionsAcknowledged &&
    Object.keys(currentErrors).length === 0 &&
    priceQuote &&
    !priceQuoteQuery.isFetching &&
    !mutation.isLoading,
  )

  const changeForm = <Key extends keyof CheckoutFormState>(
    key: Key,
    value: CheckoutFormState[Key],
  ) => {
    setFormEdits((current) => ({ ...current, [key]: value }))
    setErrorMessage(null)
  }

  const submit = async () => {
    setSubmitted(true)
    const session = sessionQuery.data
    if (
      !canSubmit ||
      !session?.authenticated ||
      !project?.approvedRevisionId ||
      !priceQuote
    ) {
      return
    }

    const body = createOrderRequest(
      projectId,
      project.approvedRevisionId,
      priceQuote.quoteId,
      form,
    )
    if (!body) return

    const fingerprint = JSON.stringify(body)
    if (retryIdentity.current?.fingerprint !== fingerprint) {
      retryIdentity.current = {
        fingerprint,
        key: createClientId('mock-order'),
      }
    }

    setErrorMessage(null)
    try {
      const order = await createOrder({
        body,
        csrfToken: session.csrfToken,
        idempotencyKey: retryIdentity.current.key,
      }).unwrap()
      navigate(`/orders/${encodeURIComponent(order.id)}`)
    } catch (error) {
      setErrorMessage(getOrderErrorMessage(error))
      await Promise.all([projectQuery.refetch(), priceQuoteQuery.refetch()])
    }
  }

  return {
    canSubmit,
    errorMessage,
    errors,
    form,
    isApproved,
    isOnline,
    isSubmitting: mutation.isLoading,
    project,
    projectQuery,
    priceQuote,
    priceQuoteQuery,
    revision,
    sessionQuery,
    changeForm,
    submit,
  }
}
