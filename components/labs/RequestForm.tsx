"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "./Button";
import styles from "./RequestForm.module.css";

const copy = {
  ad: {
    org: "Studio",
    link: "Link to your game",
    brief: "What the ad should show",
    linkRequired: true,
    orgMissing: "Enter your studio's name.",
    linkMissing: "Enter a link to your game.",
  },
  project: {
    org: "Company",
    link: "Link to your work or references",
    brief: "What you want to make",
    linkRequired: false,
    orgMissing: "Enter your company's name.",
    linkMissing: "Enter a link to your work.",
  },
};

type Field = "name" | "studio" | "email" | "game";

/** What to say when a field is not right, written per field in the page's own voice. */
function problem(el: HTMLInputElement, missing: string): string | null {
  const v = el.validity;
  if (v.valid) return null;
  if (v.valueMissing) return missing;
  if (el.type === "email") return "Enter an email address like name@studio.com.";
  if (el.type === "url") return "Enter a full link, starting with https://.";
  return missing;
}

/** The request form. Staging has nowhere to send it, and says so. */
export function RequestForm({ kind = "ad" }: { kind?: keyof typeof copy }) {
  const c = copy[kind];
  const id = useId();
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const labels: Record<Field, string> = {
    name: "Your name",
    studio: c.org,
    email: "Your email",
    game: c.link,
  };

  const missing: Record<Field, string> = {
    name: "Enter your name.",
    studio: c.orgMissing,
    email: "Enter your email address.",
    game: c.linkMissing,
  };

  const check = (el: HTMLInputElement) => {
    const name = el.name as Field;
    const msg = problem(el, missing[name]);
    setErrors((e) => ({ ...e, [name]: msg ?? undefined }));
    return msg;
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = (["name", "studio", "email", "game"] as Field[]).map((n) => form.elements.namedItem(n) as HTMLInputElement);
    const bad = fields.filter((el) => check(el));
    if (bad.length) {
      setSent(false);
      bad[0].focus();
      return;
    }
    // Nothing is sent, so the answer comes at once: no staged wait.
    setSent(true);
  };

  // Once a field has been flagged, it clears as soon as it is right.
  const recheck = (el: HTMLInputElement) => {
    if (errors[el.name as Field]) check(el);
  };

  const field = (name: Field, input: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label>
      <span>{name === "email" ? "Email" : labels[name]}</span>
      <input
        name={name}
        {...input}
        onChange={(e) => recheck(e.currentTarget)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${id}-${name}` : undefined}
      />
      {errors[name] && (
        <span id={`${id}-${name}`} className={styles.error}>
          {errors[name]}
        </span>
      )}
    </label>
  );

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.pair}>
        {field("name", { autoComplete: "name", required: true })}
        {field("studio", { autoComplete: "organization", required: true })}
      </div>
      {field("email", {
        type: "email",
        autoComplete: "email",
        inputMode: "email",
        required: true,
      })}
      {field("game", {
        type: "url",
        inputMode: "url",
        placeholder: "https://",
        required: c.linkRequired,
      })}
      <label>
        <span>{c.brief}</span>
        <textarea name="brief" rows={4} />
      </label>
      <div className={styles.foot}>
        <Button type="submit">Send request</Button>
        <p className="small muted" role="status">
          {sent ? "This is a preview of the form. Nothing was sent." : ""}
        </p>
      </div>
    </form>
  );
}
