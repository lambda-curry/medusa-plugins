import { transform } from '@medusajs/framework/workflows-sdk'
import { emitEventStep } from '@medusajs/medusa/core-flows'
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk'

import { pageBuilderModuleEvents } from '../modules/page-builder'
import { DeletePostWorkflowInput } from '../modules/page-builder/types'
import { deletePostStep } from './steps/delete-post'

// Delete post workflow
export const deletePostWorkflow = createWorkflow(
  'delete-post-workflow',
  (input: DeletePostWorkflowInput) => {
    const result = deletePostStep({ id: input.id })

    const emitData = transform({ result }, ({ result }) => {
      return {
        eventName: pageBuilderModuleEvents.POST_DELETED,
        data: { id: result.id },
      }
    })

    emitEventStep(emitData)

    return new WorkflowResponse(result)
  },
)
