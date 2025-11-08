import { cn } from "../lib/utils"

export default function Alert({ variant, children }) {
    const variantStyles = {
        error: {
            light: {
                container:
                    "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900",
                icon: "text-red-400 dark:text-red-300",
                text: "text-red-700 dark:text-red-200",
            },
        },
    }

    const icons = {
        error: (
            <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                />
            </svg>
        ),
    }

    const styles = variantStyles[variant].light

    return (
        <div
            className={cn("border rounded-lg p-4 mb-4 alert", styles.container)}
        >
            <div className="flex">
                <div className={cn("shrink-0", styles.icon)}>
                    {icons[variant]}
                </div>
                <div className="ml-3">
                    <p className={cn("text-sm", styles.text)}>{children}</p>
                </div>
            </div>
        </div>
    )
}
