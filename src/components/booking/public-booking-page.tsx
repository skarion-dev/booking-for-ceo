"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getApiUrl } from "@/lib/utils";

const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Anchorage", label: "Alaska Time (US & Canada)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (US & Canada)" },
];

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB

type BookingSlot = {
  value: string;
  label: string;
  startAt: string;
  endAt: string;
};

type BookingAvailabilityDay = {
  date: string;
  slots: BookingSlot[];
};

type BookingAvailabilityResponse = {
  timezone: string;
  timezoneLabel: string;
  durationMinutes: number;
  days: BookingAvailabilityDay[];
};

type BookingResponse = {
  id: string;
  fullName: string;
  slotDate: string;
  slotLabel: string;
  slotStartAt: string;
  meetingJoinUrl?: string;
};

const bookingFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/, "Enter a valid 10-digit US phone number"),
  address: z.string().max(255, "Address is too long").optional(),
  note: z.string().max(1000, "Note is too long").optional(),
  slotDate: z.string().min(1, "Please choose a date"),
  slotValue: z.string().min(1, "Please choose a time"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const getApiErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    return payload.message || payload.error || "Something went wrong";
  } catch {
    return "Something went wrong";
  }
};

export function PublicBookingPage() {
  const [availability, setAvailability] =
    useState<BookingAvailabilityResponse | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingResponse | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>("America/New_York");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      note: "",
      slotDate: "",
      slotValue: "",
    },
  });

  const selectedDate = form.watch("slotDate");
  const selectedSlot = form.watch("slotValue");

  const rawAvailableDays = useMemo(() => availability?.days ?? [], [availability]);

  // Only show days/slots that are at least 24 hours from now.
  const cutoff = useMemo(() => {
    const t = new Date();
    t.setHours(t.getHours() + 24);
    return t;
  }, []);

  const availableDays = useMemo(
    () =>
      rawAvailableDays
        .map((day) => ({
          ...day,
          slots: day.slots.filter((slot) => new Date(slot.startAt) > cutoff),
        }))
        .filter((day) => day.slots.length > 0),
    [rawAvailableDays, cutoff],
  );

  const availableDateSet = useMemo(
    () => new Set(availableDays.map((day) => day.date)),
    [availableDays],
  );

  const selectedDay = useMemo(
    () => availableDays.find((day) => day.date === selectedDate),
    [availableDays, selectedDate],
  );

  const loadAvailability = useCallback(async () => {
    setLoadingAvailability(true);

    try {
      const response = await fetch(getApiUrl(`/bookings/availability?timezone=${selectedTimezone}`), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const payload = (await response.json()) as BookingAvailabilityResponse;
      console.log("[DEBUG] API Payload:", payload);
      setAvailability(payload);

      if (payload.days.length && !form.getValues("slotDate")) {
        form.setValue("slotDate", payload.days[0].date, { shouldValidate: true });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load booking times";
      console.error("[DEBUG] API Error:", error);
      toast.error(message);
    } finally {
      setLoadingAvailability(false);
    }
  }, [form, selectedTimezone]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    if (!selectedDay) {
      form.setValue("slotDate", "", { shouldValidate: true });
      form.setValue("slotValue", "", { shouldValidate: true });
      return;
    }

    const slotStillExists = selectedDay.slots.some(
      (slot) => slot.value === selectedSlot,
    );

    if (!slotStillExists) {
      form.setValue("slotValue", "", { shouldValidate: true });
    }
  }, [form, selectedDate, selectedDay, selectedSlot]);

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError("");
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setResumeError("Resume must be under 10 MB");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: BookingFormValues) => {
    // Validate resume before submitting
    if (!resumeFile) {
      setResumeError("Please upload your resume");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName.trim());
      formData.append("email", values.email.trim());
      formData.append("phone", values.phone.trim());
      formData.append("slotDate", values.slotDate);
      formData.append("slotValue", values.slotValue);
      formData.append("timezone", selectedTimezone);

      if (values.address?.trim()) {
        formData.append("address", values.address.trim());
      }
      if (values.note?.trim()) {
        formData.append("note", values.note.trim());
      }

      formData.append("resume", resumeFile);

      const response = await fetch(getApiUrl("/bookings"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const booking = (await response.json()) as BookingResponse;
      setConfirmation(booking);
      toast.success("Your call has been booked");

      form.reset({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        note: "",
        slotDate: "",
        slotValue: "",
      });
      clearResume();

      await loadAvailability();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to book your call";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCalendarDate = selectedDate
    ? parseISO(`${selectedDate}T12:00:00`)
    : undefined;

  const timezoneLabel = availability?.timezoneLabel ?? "Local time";
  const firstAvailableDate = availableDays[0]?.date;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="">
      <div className="mx-auto w-full space-y-6">
        {confirmation && (
          <Card className="">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5" />
                <div className="space-y-2 text-slate-800">
                  <p className="font-semibold">Booking confirmed</p>
                  <p className="text-sm">
                    {confirmation.fullName}, your call is booked for{" "}
                    {format(
                      parseISO(confirmation.slotStartAt),
                      "EEEE, MMM d, yyyy 'at' h:mm a",
                    )}
                    .
                  </p>
                  {confirmation.meetingJoinUrl && (
                    <a
                      href={confirmation.meetingJoinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-medium text-sky-700 underline underline-offset-4"
                    >
                      Open meeting link
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-slate-1">
          <CardHeader className="border-b border-slate-200 px-4 sm:px-6 md:px-8">
            <CardTitle className="text-xl sm:text-2xl text-slate-950">
              Skarion Consultation Call
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {loadingAvailability
                ? "Loading available dates and times..."
                : firstAvailableDate
                  ? `Select from the next available slots in ${timezoneLabel}.`
                  : "There are no open slots right now. Please check back soon."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(300px,420px)_1fr]">
              <section className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner shadow-slate-100">
                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={(date: Date | undefined) => {
                      if (!date) {
                        return;
                      }

                      const nextDate = format(date, "yyyy-MM-dd");
                      form.setValue("slotDate", nextDate, {
                        shouldValidate: true,
                      });
                    }}
                    disabled={(date: Date | undefined) =>
                      !availableDateSet.has(format(date as Date, "yyyy-MM-dd"))
                    }
                    className="w-full rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-2 sm:p-4 [--cell-size:2.4rem] sm:[--cell-size:2.8rem] md:[--cell-size:3.1rem] shadow-[0_18px_45px_-24px_rgba(15,23,42,0.12)]"
                  />

                  {form.formState.errors.slotDate && (
                    <p className="mt-3 text-sm text-destructive">
                      {form.formState.errors.slotDate.message}
                    </p>
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-3xl border bg-white p-5 shadow-sm transition-all duration-300",
                    form.formState.errors.slotValue
                      ? "border-red-500"
                      : "border-slate-200"
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-900">
                        Available times
                      </Label>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedCalendarDate
                          ? format(selectedCalendarDate, "EEEE, MMMM d")
                          : "Select a date to see times"}
                      </p>
                    </div>
                    <div className="w-full mt-1">
                      <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                        <SelectTrigger className="h-9 w-full bg-slate-50">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                    {selectedDay?.slots.length ? (
                      selectedDay.slots.map((slot) => (
                        <Button
                          key={`${selectedDay.date}-${slot.value}`}
                          type="button"
                          variant={selectedSlot === slot.value ? "default" : "outline"}
                          className={cn(
                            "h-auto min-h-[3.25rem] justify-start rounded-2xl whitespace-normal border px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-medium transition-all",
                            selectedSlot === slot.value
                              ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          )}
                          onClick={() =>
                            form.setValue("slotValue", slot.value, {
                              shouldValidate: true,
                            })
                          }
                        >
                          {slot.label}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5 text-sm text-slate-500">
                        {selectedDate
                          ? "No times are left on this day."
                          : "Choose a date to see available times."}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm md:p-6">
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-slate-950">
                    Your details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Fill out the form below to confirm your booking.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="inline-flex items-center gap-2">
                                <User className="size-4" />
                                Full name
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="inline-flex items-center gap-2">
                                <Mail className="size-4" />
                                Email
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
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
                            <FormLabel>
                              <span className="inline-flex items-center gap-2">
                                <Phone className="size-4" />
                                Phone
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="inline-flex items-center gap-2">
                                <MapPin className="size-4" />
                                Address
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Optional"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ── Resume Upload (mandatory) ─────────────────────── */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="resume-upload"
                        className="text-sm font-medium text-slate-900"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FileText className="size-4" />
                          Resume <span className="text-red-500">*</span>
                        </span>
                      </Label>

                      {resumeFile ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                          <FileText className="size-5 shrink-0 text-slate-500" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-700">
                              {resumeFile.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(resumeFile.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={clearResume}
                            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                            aria-label="Remove resume"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="resume-upload"
                          className={cn(
                            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-50",
                            resumeError
                              ? "border-red-400 bg-red-50/50"
                              : "border-slate-300 bg-slate-50/60",
                          )}
                        >
                          <Upload className="size-6 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Click to upload your resume
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              PDF or Word document, up to 10 MB
                            </p>
                          </div>
                        </label>
                      )}

                      <input
                        ref={fileInputRef}
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="sr-only"
                        onChange={handleResumeSelect}
                      />

                      {resumeError && (
                        <p className="text-sm text-destructive">{resumeError}</p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Anything you want us to know before the call"
                              rows={5}
                              className="rounded-2xl border-slate-200 bg-slate-50/60"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs sm:text-sm text-slate-500">
                        Confirmation and calendar details will be sent after booking.
                      </div>
                      <Button
                        type="submit"
                        className="h-11 sm:h-12 w-full rounded-2xl px-6 text-sm sm:text-base font-semibold sm:w-auto"
                        disabled={
                          submitting || loadingAvailability || !availableDays.length
                        }
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Booking your call...
                          </>
                        ) : (
                          "Book call"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
