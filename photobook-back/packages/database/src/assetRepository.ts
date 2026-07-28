import type { PhotobookPrismaClient } from './createPrismaClient.js'
import type {
  AssetTransactionClient,
  CompleteAssetInput,
  ReserveAssetInput,
  ReserveAssetsResult,
} from './assetRepository.types.js'

const MAXIMUM_PROJECT_ASSETS = 50

export class AssetRepository {
  constructor(private readonly client: PhotobookPrismaClient) {}

  async complete(input: CompleteAssetInput) {
    return this.client.asset.update({
      data: {
        etag: input.etag,
        pixelHeight: input.pixelHeight,
        pixelWidth: input.pixelWidth,
        sha256: input.sha256,
        status: input.status,
        storedSize: input.sizeBytes,
      },
      where: { id: input.assetId },
    })
  }

  async findOwnedAsset(projectId: string, assetId: string, ownerId: string) {
    return this.client.asset.findFirst({
      where: {
        deletedAt: null,
        id: assetId,
        project: { deletedAt: null, ownerId },
        projectId,
      },
    })
  }

  async findOwnedAssets(projectId: string, ownerId: string) {
    const project = await this.client.project.findFirst({
      select: { id: true },
      where: { deletedAt: null, id: projectId, ownerId },
    })
    if (!project) return null

    return this.client.asset.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: MAXIMUM_PROJECT_ASSETS,
      where: { deletedAt: null, projectId },
    })
  }

  async markUploading(assetId: string) {
    return this.client.asset.update({
      data: { status: 'UPLOADING' },
      where: { id: assetId },
    })
  }

  async reserve(
    projectId: string,
    ownerId: string,
    files: readonly ReserveAssetInput[],
    transaction: AssetTransactionClient,
  ): Promise<ReserveAssetsResult> {
    const project = await transaction.project.findFirst({
      select: { id: true },
      where: { deletedAt: null, id: projectId, ownerId },
    })
    if (!project) return { kind: 'project_not_found' }
    const [assetCount, duplicateCount] = await Promise.all([
      transaction.asset.count({
        where: { deletedAt: null, projectId },
      }),
      transaction.asset.count({
        where: {
          clientFileId: { in: files.map((file) => file.clientFileId) },
          projectId,
        },
      }),
    ])
    if (assetCount + files.length > MAXIMUM_PROJECT_ASSETS) {
      return { kind: 'limit_exceeded' }
    }
    if (duplicateCount > 0) return { kind: 'client_file_conflict' }

    const assets = []
    for (const file of files) {
      assets.push(
        await transaction.asset.create({
          data: {
            capturedAt: file.capturedAt,
            clientFileId: file.clientFileId,
            expectedSize: file.sizeBytes,
            id: file.assetId,
            mediaType: file.mediaType,
            objectKey: file.objectKey,
            originalFileName: file.fileName,
            projectId,
            status: 'PENDING_UPLOAD',
          },
        }),
      )
    }
    await transaction.project.update({
      data: { status: 'UPLOADING' },
      where: { id: projectId },
    })

    return { assets, kind: 'created' }
  }
}
