import {
  REFERENCE_CATALOG_VERSION,
  useGetCatalogVersionQuery,
} from '@modules/catalog'

import { CreateProjectStatusScreen } from '@create-project-ui/CreateProjectStatusScreen'
import { CreateProjectWizard } from '@create-project-ui/CreateProjectWizard'

export function CreateProjectScreen() {
  const catalogQuery = useGetCatalogVersionQuery(REFERENCE_CATALOG_VERSION)

  if (catalogQuery.isLoading) {
    return (
      <CreateProjectStatusScreen
        isLoading
        description="Загружаем доступный формат, шаблон и настройки комплектации."
        title="Готовим мастер создания…"
      />
    )
  }

  if (catalogQuery.isError || !catalogQuery.data) {
    return (
      <CreateProjectStatusScreen
        description="Не удалось получить настройки книги. Проверьте подключение и повторите загрузку. Ваш выбор в адресе страницы не потеряется."
        title="Мастер пока не открылся"
        onRetry={() => void catalogQuery.refetch()}
      />
    )
  }

  return <CreateProjectWizard catalog={catalogQuery.data} />
}
