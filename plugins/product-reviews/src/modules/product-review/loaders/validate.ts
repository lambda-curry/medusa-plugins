import { LoaderOptions } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { modduleOptionsSchema, ModuleOptions } from "../service"

export default async function validationLoader({
  options,
}: LoaderOptions<ModuleOptions>) {
  const result = modduleOptionsSchema.safeParse(options);

  if (!result.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Product Review Module. Invalid options: ${JSON.stringify(result.error.flatten().fieldErrors)}`
    )
  }
}
