import { EllipsisHorizontal } from '@medusajs/icons';
import { Button, DropdownMenu, clx } from '@medusajs/ui';
import type { FC, MouseEvent, ReactNode } from 'react';

export interface Actionable {
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: 'normal' | 'danger';
}

type ActionablesProps = {
  actions?: Actionable[];
  customTrigger?: ReactNode;
  forceDropdown?: boolean;
};

const Actionables: FC<ActionablesProps> = ({ actions, customTrigger, forceDropdown = false }) => {
  if (actions && (forceDropdown || actions.length > 1)) {
    return (
      <div>
        <DropdownMenu modal={false}>
          <DropdownMenu.Trigger asChild>
            {!customTrigger ? (
              <Button
                className="h-xlarge px-1 w-xlarge focus-visible:shadow-input focus-visible:border-violet-60 focus:shadow-none focus-visible:outline-none"
                size="small"
                variant="transparent"
              >
                <EllipsisHorizontal />
              </Button>
            ) : (
              customTrigger
            )}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="bg-grey-0 border border-grey-20 min-w-[200px] p-xsmall rounded-rounded shadow-dropdown z-30"
            sideOffset={5}
          >
            {actions.map((action, index) => (
              <DropdownMenu.Item key={index} className="mb-1 last:mb-0">
                <Button
                  className={clx('flex justify-start w-full', {
                    'text-rose-50': action?.variant === 'danger',
                    'opacity-50 pointer-events-none select-none': action?.disabled,
                  })}
                  size="small"
                  variant="transparent"
                  onClick={action?.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    );
  }

  if (customTrigger) {
    const triggers = Array.isArray(customTrigger) ? customTrigger : [customTrigger];

    return (
      <div>
        {triggers.map((trigger, index) => (
          <div key={index}>{trigger}</div>
        ))}
      </div>
    );
  }

  const [action] = actions ?? [];

  if (action) {
    return (
      <div>
        <Button className="flex items-center" size="small" type="button" variant="transparent" onClick={action.onClick}>
          {!action.icon ? (
            action.label
          ) : (
            <div className="flex gap-x-2xsmall items-center">
              {action.icon}
              {action.label}
            </div>
          )}
        </Button>
      </div>
    );
  }
};

export default Actionables;
