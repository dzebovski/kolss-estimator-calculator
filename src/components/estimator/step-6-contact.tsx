"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useEstimator } from "./estimator-root";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { submitEstimatorLead } from "@/actions/estimator-contact";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  clearContactFormDraft,
  getContactFormDraft,
  setContactFormDraft,
} from "@/lib/estimator/contact-form-draft";
import {
  estimatorContactSchema,
  type EstimatorFormValues,
} from "@/lib/validation/estimator-contact";

const DEFAULT_VALUES: EstimatorFormValues = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  country: "",
  comment: "",
  consent: false,
};

export function Step6Contact() {
  const { dispatch } = useEstimator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const form = useForm<EstimatorFormValues>({
    resolver: zodResolver(estimatorContactSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Restore draft from localStorage on mount (client-only)
  useEffect(() => {
    const draft = getContactFormDraft();
    if (draft) form.reset(draft);
  }, [form]);

  // Persist form values to localStorage when they change
  useEffect(() => {
    const subscription = form.watch((values) => {
      setContactFormDraft(values as EstimatorFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: EstimatorFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitEstimatorLead(data, turnstileToken);
      if (result.success) {
        toast.success(result.message);
        if (result.warnings?.length) {
          result.warnings.forEach((w) => toast.warning(w));
        }
        clearContactFormDraft();
        dispatch({ type: "SET_STEP", payload: 7 });
      } else {
        toast.error(result.message);
        if (result.errors) {
          for (const [field, messages] of Object.entries(result.errors)) {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            if (msg) {
              form.setError(field as keyof EstimatorFormValues, {
                type: "server",
                message: msg,
              });
            }
          }
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-xl space-y-8 duration-500">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Get Your Detailed Quote
        </h2>
        <p className="text-muted-foreground">
          Leave your contact details and our specialist will reach out to
          discuss your estimate and schedule a measurement.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+48 123 456 789"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="john@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Warsaw" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Poland" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Comments</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific requests or questions?"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="bg-muted/30 hover:bg-muted/50 relative flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 shadow-sm transition-colors">
                {/* 
                  Instead of putting onClick on the FormItem and causing update loops, 
                  we wrap the entire visible area with a label element, which natively 
                  toggles the checkbox via the htmlFor attribute.
                */}
                <FormControl>
                  <Checkbox
                    id="consent-checkbox"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="flex-1 space-y-1 leading-none">
                  <FormLabel
                    htmlFor="consent-checkbox"
                    className="block cursor-pointer text-sm leading-tight font-medium after:absolute after:inset-0"
                  >
                    I agree to the processing of my personal data *
                  </FormLabel>
                  <FormDescription className="text-xs">
                    By checking this box, you consent to our privacy policy and
                    terms of service.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: "auto" }}
              />
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Send Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
