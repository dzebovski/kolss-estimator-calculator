export type IntegrationContext = {
  fileUrl: string | null;
};

/** Payload accepted by all integration services and leads DB. Optional fields have defaults in services. */
export type LeadPayload = {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  preferredContact?: "phone" | "telegram" | "email";
  budget?: string | null;
};
