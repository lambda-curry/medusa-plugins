
import { Button, DropdownMenu } from "@medusajs/ui"
import { ChevronDown } from "@medusajs/icons"


const postTypes = ["post", "page"]

type CreatePostButtonProps = {
  onSelect: (type: string) => void
}

export const CreatePostButton = ({ onSelect }: CreatePostButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="primary" size="small">Create <ChevronDown className="text-ui-fg-subtle" /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content style={{ minWidth: "auto" }} align="end">
        <DropdownMenu.Group className="space-y-1">
          {postTypes.map((type) => (
            <DropdownMenu.Item key={type} onClick={() => onSelect(type)}>
              <div className="flex items-center gap-x-2">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}