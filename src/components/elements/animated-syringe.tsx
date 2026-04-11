import { cn } from "@/lib/utils";

export function AnimatedSyringe({
  fillPercentage,
  units,
  isValid,
  maxUnits,
}: {
  fillPercentage: number;
  units: number;
  isValid: boolean;
  maxUnits: number;
}) {
  const clampedFill = Math.min(Math.max(fillPercentage, 0), 100);

  const majorMarks =
    maxUnits === 100
      ? [0, 20, 40, 60, 80, 100]
      : maxUnits === 50
        ? [0, 10, 20, 30, 40, 50]
        : [0, 10, 20, 30];

  return (
    <div
      className="relative w-full py-2"
      role="img"
      aria-label={`Syringe fill: ${Math.round(clampedFill)}% — ${isValid ? "valid dose" : "exceeds capacity"}`}
    >
      <div className="px-2">
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative h-12 overflow-hidden rounded-none border border-slate-300 bg-slate-100">
            <div
              className={cn(
                "absolute bottom-0 left-0 top-0 z-10 transition-all duration-200 ease-out",
                clampedFill > 0 ? "rounded-none" : "",
                isValid
                  ? "bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-sky-400"
                  : "bg-slate-300",
              )}
              style={{
                width: `${clampedFill}%`,
                ...(!isValid
                  ? {
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 10px, #fde68a 10px, #fde68a 20px)",
                    }
                  : {}),
              }}
            />

            <div className="pointer-events-none absolute inset-y-0 left-1 right-1 z-30">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <span
                    key={mark}
                    className={cn(
                      "absolute top-1/2 text-[10px] font-bold tabular-nums transition-colors duration-300",
                      isInLiquid
                        ? isValid
                          ? "text-white"
                          : "text-amber-800"
                        : "text-slate-500",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {mark}
                  </span>
                );
              })}
            </div>

            {/* Top major marks */}
            <div className="absolute left-1 right-1 top-0 z-20">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={mark}
                    className={cn(
                      "absolute top-0 w-0.5 transition-colors duration-300",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-800"
                        : "bg-slate-400",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      height: "14px",
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>

            {/* Top minor marks */}
            <div className="absolute left-1 right-1 top-0 z-20">
              {[...Array((majorMarks.length - 1) * 5 + 1)].map((_, i) => {
                const markPosition = (i / ((majorMarks.length - 1) * 5)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-0 transition-colors duration-300",
                      i % 5 === 0 ? "h-3.5 w-0.5" : "h-2 w-px",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-700"
                        : "bg-slate-300",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>

            {/* Bottom major marks */}
            <div className="absolute bottom-0 left-1 right-1 z-20">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={mark}
                    className={cn(
                      "absolute bottom-0 w-0.5 transition-colors duration-300",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-800"
                        : "bg-slate-400",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      height: "14px",
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>

            {/* Bottom minor marks */}
            <div className="absolute bottom-0 left-1 right-1 z-20">
              {[...Array((majorMarks.length - 1) * 5 + 1)].map((_, i) => {
                const markPosition = (i / ((majorMarks.length - 1) * 5)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute bottom-0 transition-colors duration-300",
                      i % 5 === 0 ? "h-3.5 w-0.5" : "h-2 w-px",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-700"
                        : "bg-slate-300",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
