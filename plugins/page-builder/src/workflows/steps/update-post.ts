import { StepResponse, createStep } from '@medusajs/workflows-sdk'
import { PAGE_BUILDER_MODULE } from '../../modules/page-builder'
import type PageBuilderService from '../../modules/page-builder/service'
import type { UpdatePostStepInput } from '../../modules/page-builder/types'

export const updatePostStepId = 'update-post-step'

export const updatePostStep = createStep(
  updatePostStepId,
  async (data: UpdatePostStepInput, { container }) => {
    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Get the existing post before updating for rollback
    const existingPost = await pageBuilderService.retrievePost(data.id, {
      relations: ['root', 'featured_image', 'authors', 'sections', 'tags'],
    })

    const post = await pageBuilderService.updatePosts(data)

    return new StepResponse(post, {
      ...existingPost,
      featured_image: existingPost.featured_image?.id,
      authors: existingPost.authors.map((author) => author.id),
      sections: existingPost.sections.map((section) => section.id),
      tags: existingPost.tags.map((tag) => tag.id),
      root: existingPost.root?.id,
    })
  },
  async (existingData, { container }) => {
    if (!existingData) return

    const pageBuilderService =
      container.resolve<PageBuilderService>(PAGE_BUILDER_MODULE)

    // Rollback to the previous state with only the updatable fields
    await pageBuilderService.updatePosts(existingData)
  },
)
