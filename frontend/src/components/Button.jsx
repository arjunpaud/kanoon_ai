import { cn } from "../lib/utils"

export default function Button({ variant, className, ...props }) {
    const firstAddition =
        variant === "ghost"
            ? "hover:bg-accent hover:text-accent-foreground size-9"
            : "h-10 px-4 py-2"
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                firstAddition,
                className,
            )}
            {...props}
        />
    )
}
