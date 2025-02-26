import { Button, Prompt } from "@medusajs/ui";

import clsx from "clsx";
import React from "react";
import { useWindowDimensions } from "../../hooks/use-window-dimensions";

export type ModalProps = {
  isLargeModal?: boolean;
  handleClose: () => void;
  open?: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

const Modal = ({
  open = true,
  handleClose,
  isLargeModal = true,
  children,
  title,
  description,
}: ModalProps) => {
  const { height } = useWindowDimensions();

  return (
    <Prompt open={open} onOpenChange={handleClose}>
      <Prompt.Content>
        {title && (
          <Prompt.Header>
            <Prompt.Title>{title}</Prompt.Title>
            {description && (
              <Prompt.Description>{description}</Prompt.Description>
            )}
          </Prompt.Header>
        )}

        <div
          className={clsx("overflow-y-auto px-8 pt-6", {
            ["w-largeModal pb-7"]: isLargeModal,
            ["pb-5"]: !isLargeModal,
          })}
          style={{ maxHeight: height - 90 - 141 }}
        >
          {children}
        </div>

        <Prompt.Footer className="flex justify-end gap-2">
          <Prompt.Cancel>
            <Button variant="secondary">Cancel</Button>
          </Prompt.Cancel>
          <Prompt.Action>
            <Button>Confirm</Button>
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

export default Modal;
