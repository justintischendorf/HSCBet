enum STRENGTH_LEVEL {
  DEFAULT = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export default function PasswordSafetyLevel({ input }: { input: string }) {
  switch (calculatePasswordStrength(input)) {
    case STRENGTH_LEVEL.LOW:
      return (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="w-full h-2 rounded-full bg-muted">
            <div className="w-8 h-full rounded-full bg-destructive" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Passwort zu unsicher
          </p>
        </div>
      );
    case STRENGTH_LEVEL.MEDIUM:
      return (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="w-full h-2 rounded-full bg-muted">
            <div className="w-2/3 h-full rounded-full bg-warning" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Passwort verbesserungswürdig
          </p>
        </div>
      );
    case STRENGTH_LEVEL.HIGH:
      return (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="w-full h-2 rounded-full bg-muted">
            <div className="w-full h-full rounded-full bg-positive" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Starkes Passwort
          </p>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex w-full h-2 rounded-full bg-muted border"></div>
          <p className="text-xs text-muted-foreground text-center">
            Achte darauf, dass dein Passwort sicher ist.
          </p>
        </div>
      );
  }
}

function calculatePasswordStrength(password: string): STRENGTH_LEVEL {
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasLetters = /[a-zA-Z]/.test(password);

  if (!password) return STRENGTH_LEVEL.DEFAULT;

  if (password.length >= 12 && hasLetters && hasNumbers && hasSpecialChars) {
    return STRENGTH_LEVEL.HIGH;
  }

  if (
    (password.length >= 8 && hasLetters && (hasNumbers || hasSpecialChars)) ||
    (password.length >= 8 && hasNumbers && (hasLetters || hasSpecialChars)) ||
    (password.length >= 8 && hasSpecialChars && (hasLetters || hasNumbers))
  ) {
    return STRENGTH_LEVEL.MEDIUM;
  }

  if (
    password.length < 8 ||
    (hasLetters && !hasNumbers && !hasSpecialChars) ||
    (hasNumbers && !hasLetters && !hasSpecialChars) ||
    (hasSpecialChars && !hasLetters && !hasNumbers)
  ) {
    return STRENGTH_LEVEL.LOW;
  }

  return STRENGTH_LEVEL.DEFAULT;
}
