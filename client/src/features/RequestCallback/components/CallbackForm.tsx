"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import FormField from "./FormField";
import PhoneInput from "./PhoneInput";
import SubmitButton from "./SubmitButton";
import EnquirySelect from "./EnquirySelect";
import { useCallbackForm } from "../hooks/useCallbackForm";

interface CallbackFormProps {
  onOpenChange: (open: boolean) => void;
}

export default function CallbackForm({ onOpenChange }: CallbackFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSubmit,
    inputClassName,
  } = useCallbackForm(onOpenChange);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full h-fit flex-col gap-3 sm:gap-4"
    >
      {/* Name */}
      <FormField label="Name" error={errors.name}>
        <Input
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          className={inputClassName(!!errors.name)}
        />
      </FormField>

      {/* Phone */}
      <FormField label="Phone Number" error={errors.contact}>
        <PhoneInput
          value={formData.contact}
          onChange={handleChange}
          hasError={!!errors.contact}
        />
      </FormField>

      {/* Date & Time */}
      <FormField label="Preferred Date & Time" error={errors.dateTime}>
        <input
          name="dateTime"
          type="datetime-local"
          value={formData.dateTime}
          onChange={handleChange}
          className={`${inputClassName(!!errors.dateTime)} datetime-input`}
        />
      </FormField>

      {/* Enquiry For */}
      <FormField label="Enquiry For" error={errors.enquiryFor}>
        <EnquirySelect
          value={formData.enquiryFor}
          onValueChange={handleSelectChange}
          hasError={!!errors.enquiryFor}
        />
      </FormField>

      {/* Notes */}
      <FormField label="Notes" error={errors.notes} optional>
        <Textarea
          name="notes"
          rows={2}
          value={formData.notes}
          onChange={handleChange}
          className={`${inputClassName(!!errors.notes)} resize-none`}
          placeholder="Any additional notes..."
        />
      </FormField>

      {/* Submit Button */}
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}
