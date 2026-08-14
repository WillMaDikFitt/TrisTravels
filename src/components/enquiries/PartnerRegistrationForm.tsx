"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  FormCard,
  FormCheckboxGroup,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/ui/Form";
import { submitEnquiry } from "@/lib/actions/enquiries";

const SERVICE_TYPES = [
  "Homestay / Accommodation",
  "Driver / Taxi & Transport Service",
  "Adventure Activity Provider",
  "Local Food Provider / Traditional Meal Service",
  "Handicrafts / Handlooms",
  "Local Products",
  "Artisan",
  "Cultural Experience",
  "Guide",
  "Other",
] as const;

type ServiceType = (typeof SERVICE_TYPES)[number];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function collectMulti(fd: FormData, key: string) {
  return fd
    .getAll(key)
    .map(String)
    .map((v) => v.trim())
    .filter(Boolean);
}

function SectionFields({ service }: { service: ServiceType }) {
  if (service === "Homestay / Accommodation") {
    return (
      <FormSection title="Homestay or Accommodation">
        <div className="grid gap-5 md:grid-cols-2">
          <FormInput label="Name of your Homestay / Accommodation" name="homestayName" required className="md:col-span-2" />
          <FormInput label="Number of rooms available" name="rooms" type="number" min={1} required />
          <FormSelect
            label="Do you provide meals to guests?"
            name="meals"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
          <FormInput label="Check-in time" name="checkIn" placeholder="e.g. 2:00 PM" required />
          <FormInput label="Check-out time" name="checkOut" placeholder="e.g. 11:00 AM" required />
        </div>
        <FormCheckboxGroup
          label="Facilities provided"
          name="facilities"
          columns={2}
          options={[
            "Attached Bathroom",
            "Hot water",
            "Wifi",
            "Parking",
            "Welcome drinks and snacks",
            "Breakfast",
            "Laundry",
            "Room service",
            "Restaurant",
            "Swimming Pool",
            "Massage center",
            "Guide",
            "Pet friendly",
            "Unique gifts",
            "Activities",
            "Other",
          ]}
        />
        <FormTextarea
          label="Any special house rules or local customs to be respected?"
          name="houseRules"
          required
          rows={3}
        />
      </FormSection>
    );
  }

  if (service === "Driver / Taxi & Transport Service") {
    return (
      <FormSection title="Driver / Taxi Service">
        <FormCheckboxGroup
          label="Which type of vehicles are you providing?"
          name="vehicles"
          required
          options={["Sedan", "SUV", "Sumo", "Innova & Crystal", "Tempo traveller", "Other"]}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormInput label="DL Number" name="dlNumber" />
          <FormSelect
            label="Do you have a Tourist Permit?"
            name="touristPermit"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
        </div>
        <FormTextarea
          label="Places or states where you are comfortable providing services"
          name="serviceAreas"
          required
          rows={3}
        />
      </FormSection>
    );
  }

  if (service === "Adventure Activity Provider") {
    return (
      <FormSection title="Adventure Activity Provider">
        <FormCheckboxGroup
          label="Type of activities you offer"
          name="activities"
          required
          options={["Bon fire", "Camping", "Caving", "Cliff jumping", "River trekking", "Snorkeling", "Trekking", "Other"]}
        />
        <FormTextarea label="Local area(s) of your expertise" name="adventureAreas" required rows={2} />
        <div className="grid gap-5 md:grid-cols-2">
          <FormInput label="Minimum group size" name="minGroup" type="number" min={1} required />
          <FormInput label="Maximum group size" name="maxGroup" type="number" min={1} required />
          <FormSelect
            label="Do you provide safety equipment?"
            name="safetyEquipment"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
          <FormSelect
            label="Certified/Trained in First-aid or Rescue?"
            name="firstAid"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
        </div>
        <FormTextarea label="Please list which safety equipment is provided" name="safetyList" rows={2} />
      </FormSection>
    );
  }

  if (service === "Local Food Provider / Traditional Meal Service") {
    return (
      <FormSection title="Local Food Provider / Traditional Meal Service">
        <div className="grid gap-5 md:grid-cols-2">
          <FormInput label="Which type of cuisine are you serving?" name="cuisine" required />
          <FormInput label="Where do you host travelers for a meal?" name="mealVenue" required />
          <FormSelect
            label="Do you provide vegetarian/vegan options?"
            name="vegOptions"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
          <FormInput
            label="Advance notice required"
            name="foodNotice"
            required
            placeholder="e.g. 24 hours / 2 days"
          />
          <FormInput label="Minimum group size" name="minGroup" type="number" min={1} required />
          <FormInput label="Maximum group size" name="maxGroup" type="number" min={1} required />
        </div>
      </FormSection>
    );
  }

  if (service === "Handicrafts / Handlooms") {
    return (
      <FormSection title="Handicrafts / Handlooms">
        <FormTextarea
          label="Describe the type of crafts or textiles you make"
          name="craftDescribe"
          required
          rows={3}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormSelect
            label="Can travelers visit your workspace?"
            name="workspaceVisit"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
          <FormSelect
            label="Do you sell directly or through shops/markets?"
            name="sellChannel"
            required
            placeholder="Please select"
            options={["Direct", "Shops", "Both"]}
          />
        </div>
      </FormSection>
    );
  }

  if (service === "Local Products") {
    return (
      <FormSection title="Local Products">
        <FormTextarea
          label="What kind of products do you make or sell?"
          name="products"
          required
          rows={3}
          placeholder="Pickles, spices, soaps, honey, wine, juice…"
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormSelect
            label="Ready for retail or pre-order?"
            name="productAvailability"
            required
            placeholder="Please select"
            options={["Retail", "Pre order", "Both"]}
          />
          <FormSelect
            label="Are your products organic or handmade?"
            name="productNature"
            required
            placeholder="Please select"
            options={["Organic", "Handmade", "Both"]}
          />
          <FormSelect
            label="Do you offer packaging for travelers?"
            name="packaging"
            required
            placeholder="Please select"
            options={["Yes", "No", "On Request"]}
          />
          <FormInput label="Minimum quantity for bulk orders" name="bulkMin" required />
        </div>
      </FormSection>
    );
  }

  if (service === "Artisan") {
    return (
      <FormSection title="Artisan">
        <FormCheckboxGroup
          label="In which art or craft are you specialized?"
          name="artisanCraft"
          required
          options={["Weaving", "Woodwork", "Knitting", "Pottery", "Bamboo craft", "Other"]}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormSelect
            label="Do you accept custom orders?"
            name="customOrders"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
          <FormSelect
            label="Can travelers watch or try making something?"
            name="artisanExperience"
            required
            placeholder="Please select"
            options={["Watch", "Try", "Both"]}
          />
        </div>
      </FormSection>
    );
  }

  if (service === "Cultural Experience") {
    return (
      <FormSection title="Cultural Experience">
        <FormCheckboxGroup
          label="Type of experience offered"
          name="cultureType"
          required
          options={["Traditional Dance", "Music Performance", "Storytelling", "Folk Traditions", "Other"]}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormSelect
            label="Can travelers participate or just observe?"
            name="cultureParticipate"
            required
            placeholder="Please select"
            options={["Participate", "Observe", "Both"]}
          />
          <FormSelect
            label="Fixed location or can you move?"
            name="cultureLocation"
            required
            placeholder="Please select"
            options={["Fixed location", "Can move"]}
          />
          <FormInput label="Minimum group size" name="minGroup" type="number" min={1} required />
          <FormInput label="Maximum group size" name="maxGroup" type="number" min={1} required />
        </div>
      </FormSection>
    );
  }

  if (service === "Guide") {
    return (
      <FormSection title="Guide">
        <FormCheckboxGroup
          label="Which types of tour are you offering?"
          name="tourTypes"
          required
          options={["Trekking", "Sightseeing", "Local culture", "Historical", "Birdwatching", "Other"]}
        />
        <FormTextarea
          label="Areas/places you are specialized in guiding"
          name="guideAreas"
          required
          rows={2}
        />
        <FormCheckboxGroup
          label="Type of clients you can guide"
          name="clientTypes"
          required
          options={["Families", "International guests", "Solo", "Groups", "Depends on requirement", "Other"]}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FormSelect
            label="Do you have any training or certification?"
            name="guideCertification"
            required
            placeholder="Please select"
            options={["Yes", "No"]}
          />
          <FormInput label="Range of your service fees" name="guideFees" required placeholder="e.g. ₹2,000–₹4,000 / day" />
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection title="Other">
      <FormTextarea label="Please describe your service" name="otherService" required rows={3} />
      <FormTextarea label="Any special requirements for collaboration?" name="otherRequirements" rows={2} />
    </FormSection>
  );
}

export function PartnerRegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const [service, setService] = useState<ServiceType | "">("");
  const [yearRound, setYearRound] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const showUnavailableMonths = yearRound === "No";

  const serviceHelp = useMemo(() => {
    if (!service) return "Choose your service type to unlock the matching questions.";
    return `Complete the ${service} section below.`;
  }, [service]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const name = [firstName, lastName].filter(Boolean).join(" ");
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const story = String(fd.get("story") || "").trim();
    const serviceType = String(fd.get("serviceType") || "").trim();

    if (!name || !phone || !serviceType || !story) {
      setError("Please complete the required fields.");
      return;
    }
    if (!(form.elements.namedItem("agree") as HTMLInputElement | null)?.checked) {
      setError("Please agree to the registration terms.");
      return;
    }
    if (yearRound === "No" && collectMulti(fd, "unavailableMonths").length === 0) {
      setError("Select the months you are not available.");
      return;
    }

    const payload: Record<string, string | string[]> = {};
    fd.forEach((value, key) => {
      if (key === "agree") return;
      if (typeof value !== "string") return;
      const existing = payload[key];
      if (existing === undefined) payload[key] = value;
      else if (Array.isArray(existing)) existing.push(value);
      else payload[key] = [existing, value];
    });

    // Normalize known multi-selects
    for (const key of [
      "unavailableMonths",
      "facilities",
      "vehicles",
      "activities",
      "artisanCraft",
      "cultureType",
      "tourTypes",
      "clientTypes",
      "languages",
    ]) {
      const values = collectMulti(fd, key);
      if (values.length) payload[key] = values;
    }

    setBusy(true);
    setError("");
    try {
      const res = await submitEnquiry({
        source: "partner",
        name,
        email,
        phone,
        message: story,
        payload: {
          ...payload,
          form: "local-partner-registration",
          serviceType,
          businessName: String(fd.get("businessName") || ""),
          address: [
            String(fd.get("street1") || ""),
            String(fd.get("street2") || ""),
            String(fd.get("city") || ""),
            String(fd.get("state") || ""),
            String(fd.get("postal") || ""),
          ]
            .filter(Boolean)
            .join(", "),
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSuccess();
    } catch {
      setError("Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormCard
      title="Local Partner Registration"
      subtitle='"From one home to many hearts — together, we thrive." This form helps us build meaningful, sustainable tourism partnerships with you.'
      className="md:p-10"
    >
      <form className="space-y-10" onSubmit={onSubmit}>
        <FormSection title="Basic Information">
          <FormSelect
            label="Gender"
            name="gender"
            required
            placeholder="Please select"
            options={["Male", "Female", "Divers"]}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <FormInput label="First name" name="firstName" required autoComplete="given-name" />
            <FormInput label="Last name" name="lastName" required autoComplete="family-name" />
            <FormInput
              label="Name of Business / Service (if any)"
              name="businessName"
              className="md:col-span-2"
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <FormInput label="Street address" name="street1" required className="md:col-span-2" autoComplete="address-line1" />
            <FormInput label="Street address line 2" name="street2" className="md:col-span-2" autoComplete="address-line2" />
            <FormInput label="City" name="city" required autoComplete="address-level2" />
            <FormInput label="State / Province" name="state" required autoComplete="address-level1" />
            <FormInput label="Postal / Zip code" name="postal" autoComplete="postal-code" />
            <FormInput label="Email" name="email" type="email" autoComplete="email" />
            <FormInput
              label="Phone number (WhatsApp preferred)"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
            />
            <FormInput label="Alternative contact number" name="altPhone" type="tel" />
          </div>

          <FormSelect
            label="Type of service you provide"
            name="serviceType"
            required
            placeholder="Please select"
            options={[...SERVICE_TYPES]}
            value={service}
            onChange={(v) => setService(v as ServiceType)}
          />
          <p className="text-xs text-on-surface-variant">{serviceHelp}</p>

          <div className="grid gap-5 md:grid-cols-2">
            <FormSelect
              label="How long have you been offering this service?"
              name="yearsOffering"
              required
              placeholder="Please select"
              options={[
                "Less than 1 year",
                "1 - 2 years",
                "2 - 4 years",
                "4 - 6 years",
                "below 10 years",
                "more than 10 years",
              ]}
            />
            <FormSelect
              label="Do you have the necessary license/permit?"
              name="license"
              required
              placeholder="Please select"
              options={["Yes", "No", "Not required for my service"]}
            />
            <FormSelect
              label="Are you available for collaboration year-round?"
              name="yearRound"
              required
              placeholder="Please select"
              options={["Yes", "No"]}
              value={yearRound}
              onChange={setYearRound}
            />
          </div>

          {showUnavailableMonths ? (
            <FormCheckboxGroup
              label="Months you are not available"
              name="unavailableMonths"
              required
              options={MONTHS}
              columns={3}
            />
          ) : null}
        </FormSection>

        {service ? <SectionFields service={service} /> : null}

        <FormSection title="We would love to learn more about you">
          <FormTextarea
            label="Tell us about yourself, your work, your inspiration or your story"
            name="story"
            required
            rows={5}
          />
          <FormCheckboxGroup
            label="Which languages can you speak?"
            name="languages"
            required
            options={["Khasi", "English", "Hindi", "Bengali", "Assamese", "Other"]}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <FormSelect
              label="Do you have photos/videos of your place/product/service?"
              name="hasMedia"
              required
              placeholder="Please select"
              options={["Yes", "No"]}
            />
            <FormInput
              label="Photo/video link (optional)"
              name="mediaLink"
              placeholder="Google Drive, Dropbox, or WhatsApp note"
              hint="We’ll follow up if we need files directly."
            />
          </div>
        </FormSection>

        <FormSection title="Agreement">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-sm text-on-surface-variant">
            <p className="font-medium text-primary">By submitting this form, I agree that:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>The information provided is true and correct.</li>
              <li>I am interested in collaborating with TRIS Travels to promote sustainable tourism.</li>
              <li>This form is for registration only and does not guarantee bookings.</li>
            </ul>
          </div>
          <label className="flex items-start gap-3 text-sm text-primary">
            <input
              type="checkbox"
              name="agree"
              required
              className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-accent"
            />
            <span>
              I agree to the above <span className="text-accent">*</span>
            </span>
          </label>
        </FormSection>

        <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs text-on-surface-variant">
            Registration starts a conversation — not a contract or booking guarantee.
          </p>
          {error ? <p className="text-sm text-primary">{error}</p> : null}
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "Sending…" : "Submit registration"}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
