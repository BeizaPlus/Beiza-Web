import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import type { MemoirSummary } from "@/types/memoir";

const createTributeFormSchema = (hasDefaultMemoir: boolean) =>
  z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.union([z.string().email("Please enter a valid email address"), z.literal("")]).optional(),
    phone: z.string().min(1, "Please enter a phone number"),
    relationship: z.string().min(1, "Please enter your relationship"),
    message: z.string().min(12, "Message must be at least 12 characters"),
    memoirId: hasDefaultMemoir
      ? z.string().optional()
      : z.string().min(1, "Please select a memoir"),
  });

export type TributeFormValues = {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  message: string;
  memoirId: string;
};

type TributeFormProps = {
  memoirs: MemoirSummary[];
  onSubmit: (values: TributeFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  defaultMemoirId?: string;
  memoirTitle?: string;
};

export const TributeForm = ({ memoirs, onSubmit, isSubmitting, defaultMemoirId = "", memoirTitle }: TributeFormProps) => {
  const hasDefaultMemoir = Boolean(defaultMemoirId);
  const schema = createTributeFormSchema(hasDefaultMemoir);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      relationship: "",
      message: "",
      memoirId: defaultMemoirId || "",
    },
  });

  // Update form when defaultMemoirId changes (e.g., when dialog opens)
  useEffect(() => {
    if (defaultMemoirId)
    {
      form.setValue("memoirId", defaultMemoirId);
    }
  }, [defaultMemoirId, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    // Always use defaultMemoirId if provided, otherwise use the selected value
    const finalValues = {
      ...values,
      email: values.email || "anonymous@tribute.com",
      memoirId: defaultMemoirId || values.memoirId || "",
    };
    const success = await onSubmit(finalValues as TributeFormValues);
    if (success)
    {
      form.reset({
        name: "",
        email: "",
        phone: "",
        relationship: "",
        message: "",
        memoirId: defaultMemoirId || "",
      });
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm uppercase tracking-[0.3em] text-subtle">
          Message
        </Label>
        <Textarea
          id="message"
          {...form.register("message")}
          placeholder="Share your thoughts, memories, or words of tribute..."
          rows={5}
          className="mt-2 bg-white text-black"
          disabled={isSubmitting}
        />
        {form.formState.errors.message && (
          <p className="text-xs text-red-400 mt-1">{form.formState.errors.message.message}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm uppercase tracking-[0.3em] text-subtle">
            Name
          </Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Your name"
            className="mt-2 bg-white text-black"
            disabled={isSubmitting}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm uppercase tracking-[0.3em] text-subtle">
            Email <span className="text-subtle lowercase">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="your.email@example.com"
            className="mt-2 bg-white text-black"
            disabled={isSubmitting}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm uppercase tracking-[0.3em] text-subtle">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            {...form.register("phone")}
            placeholder="+233 20 000 0000"
            className="mt-2 bg-white text-black"
            disabled={isSubmitting}
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship" className="text-sm uppercase tracking-[0.3em] text-subtle">
            Relationship
          </Label>
          <Input
            id="relationship"
            {...form.register("relationship")}
            placeholder="Sibling, Friend, Colleague"
            className="mt-2 bg-white text-black"
            disabled={isSubmitting}
          />
          {form.formState.errors.relationship && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.relationship.message}</p>
          )}
        </div>
      </div>

      {hasDefaultMemoir ? (
        <div className="space-y-2">
          <Label className="text-sm uppercase tracking-[0.3em] text-subtle">
            Memoir
          </Label>
          <div className="mt-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3">
            <p className="text-sm font-medium text-white">{memoirTitle || "Selected Memoir"}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="memoir" className="text-sm uppercase tracking-[0.3em] text-subtle">
            Select Memoir
          </Label>
          <Controller
            name="memoirId"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger className="mt-2 bg-white text-black">
                  <SelectValue placeholder="Choose a memoir..." />
                </SelectTrigger>
                <SelectContent>
                  {memoirs.map((memoir) => (
                    <SelectItem key={memoir.id} value={memoir.id}>
                      {memoir.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.memoirId && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.memoirId.message}</p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="button-pill w-full justify-center"
      >
        <span>{isSubmitting ? "Submitting..." : "Submit Tribute"}</span>
        {!isSubmitting && (
          <span className="ring-background flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight className="h-4 w-4 -rotate-45" />
          </span>
        )}
      </Button>
    </form>
  );
};

