import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  Button,
  Switch,
  Select,
  Input,
  toast,
  FocusModal,
  Heading,
  Label,
} from "@medusajs/ui";

import {
  useAdminCreateWebhook,
  useAdminGetWebhookEvents,
  useAdminUpdateWebhook,
  Webhook,
} from "../hooks/webhooks/mutations";
import { WebhookTestModal } from "./webhook-test-modal";
import { getErrorMessage } from "../utils/error-messages";

type WebhookModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (values: Webhook) => void;
  webhook?: Partial<Webhook> | null;
};

interface WebhookForm {
  event_type: { label: string; value: string };
  target_url: string;
  active: boolean;
}

const defaultValues: WebhookForm = {
  event_type: { label: "", value: "" },
  target_url: "",
  active: true,
};

export const WebhookModal: React.FC<WebhookModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  webhook,
}) => {
  const form = useForm<WebhookForm>({
    defaultValues: webhook
      ? {
          ...webhook,
          event_type: { label: webhook.event_type, value: webhook.event_type },
        }
      : defaultValues,
    mode: "onChange",
  });

  const { register, handleSubmit, control, formState } = form;

  const [openTestModal, setTestModalState] = useState<boolean>(false);

  const createWebhook = useAdminCreateWebhook();
  const updateWebhook = useAdminUpdateWebhook(webhook?.id);
  const getWebhookEvents = useAdminGetWebhookEvents();

  const formIsValid = formState.isValid;

  const submitForm = (formData: WebhookForm) => {
    const data: Partial<Webhook> = {
      target_url: formData.target_url,
      active: formData.active,
      event_type: formData.event_type.value,
    };

    if (webhook) {
      data.id = webhook.id;
    }

    const mutation = webhook?.id
      ? { mutate: updateWebhook.mutate, successMessage: "Webhook Updated" }
      : { mutate: createWebhook.mutate, successMessage: "Webhook Created" };

    return mutation.mutate(data as Webhook, {
      onSuccess: (data: any) => {
        toast.success("Success", {
          description: mutation.successMessage,
        });

        if (onSuccess) onSuccess(data);
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error("Error", {
          description: getErrorMessage(error),
        });
      },
    });
  };

  const closeTestModal = () => {
    setTestModalState(false);
  };

  const options = getWebhookEvents?.data?.options ?? [];

  return (
    <>
      <FocusModal open={open} onOpenChange={onOpenChange}>
        <FocusModal.Content className="flex flex-col h-full">
          <FocusModal.Header></FocusModal.Header>
          <FormProvider {...form}>
            <form
              onSubmit={handleSubmit(submitForm)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (formIsValid) {
                    handleSubmit(submitForm)();
                  }
                }
              }}
              className="flex flex-col h-full"
            >
              <FocusModal.Body className="flex-1">
                <div className="px-8 py-6">
                  <Heading className="mb-2">
                    {webhook ? `Edit Webhook` : "Add Webhook"}
                  </Heading>
                  <div className="text-ui-fg-subtle mb-6">
                    Create and manage webhook subscriptions.
                  </div>

                  <div className="flex flex-col gap-y-6">
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-x-4">
                      <div className="flex flex-col gap-y-3">
                        <Label className="text-gray-400">
                          Event Type<span className="text-rose-500">*</span>
                        </Label>
                        <Controller
                          name="event_type"
                          control={control}
                          render={({ field: { onChange, value } }) => {
                            return (
                              <Select
                                size="small"
                                value={value.value}
                                onValueChange={(value) =>
                                  onChange({ label: value, value })
                                }
                              >
                                <Select.Trigger>
                                  <Select.Value placeholder="Select an event type" />
                                </Select.Trigger>
                                <Select.Content style={{ zIndex: 100 }}>
                                  {options.map((group) => (
                                    <Select.Group key={group.label}>
                                      <Select.Label>{group.label}</Select.Label>
                                      {group.options.map((option) => (
                                        <Select.Item
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </Select.Item>
                                      ))}
                                    </Select.Group>
                                  ))}
                                </Select.Content>
                              </Select>
                            );
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-y-3">
                        <Label className="text-gray-400">
                          Target URL<span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          placeholder="https://example.com/webhook"
                          type="url"
                          required
                          {...register("target_url", {
                            required: "Please enter the target url.",
                            pattern: {
                              value:
                                /^https?:\/\/(?:localhost|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}))(?::(\d+))?(\/[\w .-]*)*\/?(\?[=&\w.-]*)?$/,
                              message: "Please enter a valid URL.",
                            },
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-x-2">
                        <span className="font-semibold">Active</span>
                        <Controller
                          control={control}
                          name="active"
                          render={({ field: { value, onChange } }) => (
                            <Switch
                              checked={value}
                              onCheckedChange={onChange}
                              defaultChecked={true}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FocusModal.Body>
              <FocusModal.Footer>
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="secondary"
                    size="small"
                    type="button"
                    onClick={() => setTestModalState(true)}
                    disabled={!formIsValid}
                  >
                    Test
                  </Button>

                  <Button type="submit" disabled={!formIsValid}>
                    {webhook ? "Save and Close" : "Create Webhook"}
                  </Button>
                </div>
              </FocusModal.Footer>
            </form>
          </FormProvider>
        </FocusModal.Content>
      </FocusModal>
      {openTestModal ? (
        <WebhookTestModal
          event_type={form.getValues("event_type").value}
          target_url={form.getValues("target_url")}
          onClose={closeTestModal}
        />
      ) : null}
    </>
  );
};
