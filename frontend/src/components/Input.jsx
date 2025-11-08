import { cn } from "../lib/utils"

export default function Input({ className, type, ...props }) {
    return (
        <input
            type={type}
            className={cn(
                "text-white border border-[#434242] outline-[#f5145f] h-10 w-full px-3 py-2 rounded-md text-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className,
            )}
            {...props}
        />
    )
}
