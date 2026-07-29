import { startTransition, useEffect, useMemo } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { useSearchParams } from 'react-router'

import type { BookConfigurationBundle } from '@core/book'
import {
  createPriceQuoteRequest,
  useCreatePriceQuoteQuery,
} from '@modules/pricing'

import {
  getCompatibleTemplates,
  getCreatePriceEstimate,
  getCreateProjectSelection,
} from '@create-project/libs'
import type { CreateProjectStep } from '@create-project/model'

export const useCreateProjectFlow = (catalog: BookConfigurationBundle) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const selection = useMemo(
    () => getCreateProjectSelection(searchParams, catalog),
    [catalog, searchParams],
  )
  const templates = getCompatibleTemplates(catalog, selection.productSpec)
  const priceRequest = useMemo(() => {
    const productSpec = selection.productSpec
    const coverOption = productSpec?.optionSpecs[0]
    if (
      !productSpec ||
      !coverOption ||
      !selection.coverValueId ||
      selection.spreadCount === null
    ) {
      return null
    }

    return createPriceQuoteRequest({
      catalogVersion: catalog.catalogVersion,
      deliveryMethod: 'pickup',
      optionSelections: [
        { optionId: coverOption.id, valueId: selection.coverValueId },
      ],
      productId: productSpec.productId,
      productSpecId: productSpec.id,
      spreadCount: selection.spreadCount,
    })
  }, [catalog.catalogVersion, selection])
  const priceQuery = useCreatePriceQuoteQuery(priceRequest ?? skipToken)
  const priceEstimate = getCreatePriceEstimate(priceQuery.currentData)

  const updateSearch = (update: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams)
    update(next)
    startTransition(() =>
      setSearchParams(next, { preventScrollReset: true, replace: true }),
    )
  }

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (selection.productSpec && !next.has('product')) {
      next.set('product', selection.productSpec.id)
    }
    if (selection.template && !next.has('template')) {
      next.set('template', selection.template.id)
    }
    if (selection.coverValueId && !next.has('cover')) {
      next.set('cover', selection.coverValueId)
    }
    if (selection.spreadCount !== null && !next.has('spreads')) {
      next.set('spreads', String(selection.spreadCount))
    }
    if (next.get('step') !== selection.step) next.set('step', selection.step)
    if (next.toString() === searchParams.toString()) return

    startTransition(() =>
      setSearchParams(next, { preventScrollReset: true, replace: true }),
    )
  }, [searchParams, selection, setSearchParams])

  const goToStep = (step: CreateProjectStep) => {
    if (step === 'template' && !selection.productSpec) return
    if ((step === 'details' || step === 'photos') && !selection.template) return
    updateSearch((next) => next.set('step', step))
  }

  const selectProduct = (productSpecId: string) => {
    updateSearch((next) => {
      next.set('product', productSpecId)
      next.delete('template')
      next.delete('cover')
      next.delete('spreads')
    })
  }

  const toggleCategory = (categoryId: string) => {
    updateSearch((next) => {
      const selected = new Set(next.getAll('category'))
      if (selected.has(categoryId)) selected.delete(categoryId)
      else selected.add(categoryId)

      next.delete('category')
      selected.forEach((id) => next.append('category', id))
    })
  }

  return {
    catalog,
    goToStep,
    priceEstimate,
    priceQuery,
    selectCover: (coverValueId: string) =>
      updateSearch((next) => next.set('cover', coverValueId)),
    selectPhotoSet: (photoSetId: string) =>
      updateSearch((next) => next.set('photos', photoSetId)),
    selectProduct,
    selectSpreadCount: (spreadCount: number) =>
      updateSearch((next) => next.set('spreads', String(spreadCount))),
    selectTemplate: (templateId: string) =>
      updateSearch((next) => next.set('template', templateId)),
    selection,
    templates,
    toggleCategory,
  }
}
