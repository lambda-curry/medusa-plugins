import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button, Switch, Select, Input, toast } from "@medusajs/ui";
import Modal from "../components/molecules/Modal";
import { Webhook } from "../../models/webhook";
import {
  useAdminCreateWebhook,
  useAdminGetWebhookEvents,
  useAdminUpdateWebhook,
} from "../hooks/webhooks/mutations";
import { WebhookTestModal } from "./webhook-test-modal";
import { getErrorMessage } from "../utils/error-messages";

type WebhookModalProps = {
  onClose: () => void;
  onSuccess?: (values: Webhook) => void;
  webhook?: Webhook | null;
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
  onClose,
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

    const mutation = webhook
      ? { mutate: updateWebhook.mutate, successMessage: "Webhook Updated" }
      : { mutate: createWebhook.mutate, successMessage: "Webhook Created" };

    return mutation.mutate(data, {
      onSuccess: (data: any) => {
        toast.success("Success", {
          description: mutation.successMessage,
        });

        if (onSuccess) onSuccess(data);
        onClose();
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
      <Modal handleClose={onClose}>
        <Modal.Body>
          <Modal.Header handleClose={onClose}>
            <div>
              <h1 className="inter-xlarge-semibold mb-2xsmall">
                {webhook ? `Edit Webhook` : "Add Webhook"}
              </h1>
            </div>
          </Modal.Header>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(submitForm)}>
              <Modal.Content>
                <div>
                  <div>
                    <div className="small:grid-cols-[1fr_2fr] mb-4 grid grid-cols-1 gap-2">
                      <div
                        className="gap-y-2xsmall flex flex-col"
                        style={{ zIndex: 100 }}
                      >
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

                      <div className="col-span-1">
                        <Input
                          placeholder="Target URL"
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

                    <div className="w-[100px] pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="inter-base-semibold mb-2xsmall">
                          Active
                        </h3>
                        <Controller
                          control={control}
                          name={"active"}
                          render={({ field: { value, onChange } }) => {
                            return (
                              <Switch
                                checked={value}
                                onCheckedChange={onChange}
                              />
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Modal.Content>
              <Modal.Footer>
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    type="button"
                    onClick={onClose}
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

                  <Button
                    variant="primary"
                    size="small"
                    disabled={!formIsValid}
                  >
                    {webhook ? "Save and Close" : "Create Webhook"}
                  </Button>
                </div>
              </Modal.Footer>
            </form>
          </FormProvider>
        </Modal.Body>
      </Modal>
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
