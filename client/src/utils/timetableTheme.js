const subjectThemes = {
  mathematics: {
    card: "bg-gradient-to-br from-orange-100 to-amber-50 border-orange-200",
    badge: "bg-orange-500 text-white",
    accent: "text-orange-700"
  },
  physics: {
    card: "bg-gradient-to-br from-sky-100 to-cyan-50 border-sky-200",
    badge: "bg-sky-500 text-white",
    accent: "text-sky-700"
  },
  chemistry: {
    card: "bg-gradient-to-br from-emerald-100 to-green-50 border-emerald-200",
    badge: "bg-emerald-500 text-white",
    accent: "text-emerald-700"
  },
  biology: {
    card: "bg-gradient-to-br from-lime-100 to-green-50 border-lime-200",
    badge: "bg-lime-500 text-white",
    accent: "text-lime-700"
  },
  english: {
    card: "bg-gradient-to-br from-violet-100 to-fuchsia-50 border-violet-200",
    badge: "bg-violet-500 text-white",
    accent: "text-violet-700"
  },
  default: {
    card: "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200",
    badge: "bg-slate-700 text-white",
    accent: "text-slate-700"
  }
};

const dayThemes = {
  Monday: "ring-orange-200",
  Tuesday: "ring-sky-200",
  Wednesday: "ring-emerald-200",
  Thursday: "ring-violet-200",
  Friday: "ring-rose-200",
  Saturday: "ring-amber-200",
  Sunday: "ring-slate-200"
};

export const getTimetableTheme = (subject, dayOfWeek) => {
  const key = String(subject || "").trim().toLowerCase();
  const subjectTheme = subjectThemes[key] || subjectThemes.default;
  return {
    ...subjectTheme,
    dayRing: dayThemes[dayOfWeek] || dayThemes.Sunday
  };
};
