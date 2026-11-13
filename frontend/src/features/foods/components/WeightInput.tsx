import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

type WeightInputProps = {
  value: number | "";
  onChange: (value: number | "") => void;
};

export function WeightInput({ value, onChange }: WeightInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;

    if (next === "") {
      setDraft("");
      onChange("");
      return;
    }

    // A text input rejects letters before number inputs can turn them into an empty value.
    if (!/^\d+(?:\.\d?)?$/.test(next)) {
      return;
    }

    const amount = Number(next);
    if (!Number.isFinite(amount) || amount > 100000) {
      return;
    }

    setDraft(next);
    onChange(amount);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft}
      onChange={handleChange}
      onBlur={() => setDraft(String(value))}
    />
  );
}
