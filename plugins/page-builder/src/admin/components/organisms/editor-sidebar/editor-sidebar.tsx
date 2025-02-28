import {
  ShoppingCart,
  Tag,
  Buildings,
  Users,
  ReceiptPercent,
  CurrencyDollar,
} from "@medusajs/icons"
import { INavItem, NavItem } from "../../../components/molecules/nav-item/nav-item"

/**
 * Sidebar for the page editor with sections menu
 */
export const EditorSidebar = () => {
  return (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <SectionsMenu />
    </aside>
  )
}

const useCoreRoutes = (): Omit<INavItem, "pathname">[] => {
  return [
    {
      icon: <ShoppingCart />,
      label: 'orders',
      to: "/orders",
      items: [
        // TODO: Enable when domin is introduced
        // {
        //   label: 'draftOrders',
        //   to: "/draft-orders",
        // },
      ],
    },
    {
      icon: <Tag />,
      label: 'products',
      to: "/products",
      items: [
        {
          label: 'collections',
          to: "/collections",
        },
        {
          label: 'categories',
          to: "/categories",
        },
        // TODO: Enable when domin is introduced
        // {
        //   label: 'giftCards',
        //   to: "/gift-cards",
        // },
      ],
    },
    {
      icon: <Buildings />,
      label: 'inventory',
      to: "/inventory",
      items: [
        {
          label: 'reservations',
          to: "/reservations",
        },
      ],
    },
    {
      icon: <Users />,
      label: 'customers',
      to: "/customers",
      items: [
        {
          label: 'customerGroups',
          to: "/customer-groups",
        },
      ],
    },
    {
      icon: <ReceiptPercent />,
      label: 'promotions',
      to: "/promotions",
      items: [
        {
          label: 'campaigns',
          to: "/campaigns",
        },
      ],
    },
    {
      icon: <CurrencyDollar />,
      label: 'priceLists',
      to: "/price-lists",
    },
  ]
}

const SectionsMenu = () => {
  const coreRoutes = useCoreRoutes()

  return (
    <nav className="flex flex-col gap-y-1 py-3">
      {coreRoutes.map((route) => {
        return <NavItem key={route.to} {...route} />
      })}
    </nav>
  )
} 