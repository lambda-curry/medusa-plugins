import { clx } from "@medusajs/ui"
import { TriangleRightMini } from "@medusajs/icons"
import { Link, useLoaderData } from "react-router-dom"

type Crumb = {
  label: string
  path: string
}

/**
 * Breadcrumbs component for navigation
 */
export const Breadcrumbs = () => {
  const data = useLoaderData() as any

  const crumbs: Crumb[] = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Pages",
      path: "/pages",
    },
  ]

  if (data?.page) {
    crumbs.push({
      label: data?.page?.title as string,
      path: data?.page?.id as string,
    })
  }
  
  return (
    <ol
      className={clx(
        "text-ui-fg-muted txt-compact-small-plus flex select-none items-center"
      )}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        const isSingle = crumbs.length === 1

        return (
          <li key={index} className={clx("flex items-center")}>
            {!isLast ? (
              <Link
                className="transition-fg hover:text-ui-fg-subtle"
                to={crumb.path}
              >
                {crumb.label}
              </Link>
            ) : (
              <div>
                {!isSingle && <span className="block lg:hidden">...</span>}
                <span
                  key={index}
                  className={clx({
                    "hidden lg:block": !isSingle,
                  })}
                >
                  {crumb.label}
                </span>
              </div>
            )}
            {!isLast && (
              <span className="mx-2">
                <TriangleRightMini />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
} 