"use client";

import { useState, useRef, useEffect } from "react";

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
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// ─── Calendar Picker ─────────────────────────────────────────────────────────

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? today.getMonth(),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    onChange(d.toISOString().split("T")[0]);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected?.getFullYear() === viewYear &&
    selected?.getMonth() === viewMonth &&
    selected?.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select date";

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-sm text-left focus:outline-none group"
      >
        <svg
          className="w-5 h-5 text-accent shrink-0 transition-transform duration-200 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
          />
        </svg>
        <span className={value ? "text-white font-medium" : "text-white/30"}>
          {displayValue}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/60 w-[300px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span className="text-sm font-semibold tracking-wide">
              {MONTHS[viewMonth]}{" "}
              <span className="text-accent">{viewYear}</span>
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold text-white/25 uppercase tracking-widest py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const sel = isSelected(day);
              const tod = isToday(day);
              const past = isPast(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !past && selectDay(day)}
                  disabled={past}
                  className={[
                    "w-9 h-9 mx-auto flex items-center justify-center text-sm rounded-full transition-all duration-150 font-medium",
                    sel
                      ? "bg-accent text-black font-bold shadow-lg shadow-accent/30"
                      : "",
                    !sel && tod ? "ring-1 ring-accent text-accent" : "",
                    !sel && !past && !tod
                      ? "hover:bg-white/10 text-white/80 hover:text-white"
                      : "",
                    past
                      ? "text-white/15 cursor-not-allowed"
                      : "cursor-pointer",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Time Picker ──────────────────────────────────────────────────────────────

interface TimePickerProps {
  value: string; // HH:mm
  onChange: (val: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [selHour, setSelHour] = useState(value ? value.split(":")[0] : "");
  const [selMin, setSelMin] = useState(value ? value.split(":")[1] : "");

  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0"),
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll selected hour/min into view when opening
  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      if (selHour && hourRef.current) {
        const btn = hourRef.current.querySelector(
          `[data-h="${selHour}"]`,
        ) as HTMLElement;
        btn?.scrollIntoView({ block: "center" });
      }
      if (selMin && minRef.current) {
        const btn = minRef.current.querySelector(
          `[data-m="${selMin}"]`,
        ) as HTMLElement;
        btn?.scrollIntoView({ block: "center" });
      }
    }, 50);
  }, [open, selHour, selMin]);

  const select = (h: string, m: string) => {
    setSelHour(h);
    setSelMin(m);
    if (h && m) {
      onChange(`${h}:${m}`);
      setOpen(false);
    }
  };

  const displayValue = value || "Select time";

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-sm text-left focus:outline-none group"
      >
        <svg
          className="w-5 h-5 text-accent shrink-0 transition-transform duration-200 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span
          className={
            value ? "text-white font-medium tabular-nums" : "text-white/30"
          }
        >
          {displayValue}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/60">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 text-center">
            Pick a time
          </p>
          <div className="flex gap-2">
            {/* Hours column */}
            <div
              ref={hourRef}
              className="flex flex-col gap-0.5 h-52 overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              {hours.map((h) => (
                <button
                  key={h}
                  data-h={h}
                  type="button"
                  onClick={() => select(h, selMin || "00")}
                  className={[
                    "w-14 py-2 text-sm rounded-xl transition-all duration-150 font-mono font-semibold",
                    selHour === h
                      ? "bg-accent text-black shadow-lg shadow-accent/20"
                      : "text-white/50 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="flex flex-col items-center justify-center gap-3 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            </div>

            {/* Minutes column */}
            <div
              ref={minRef}
              className="flex flex-col gap-0.5 h-52 overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              {minutes.map((m) => (
                <button
                  key={m}
                  data-m={m}
                  type="button"
                  onClick={() => select(selHour || "08", m)}
                  className={[
                    "w-14 py-2 text-sm rounded-xl transition-all duration-150 font-mono font-semibold",
                    selMin === m
                      ? "bg-accent text-black shadow-lg shadow-accent/20"
                      : "text-white/50 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  :{m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
