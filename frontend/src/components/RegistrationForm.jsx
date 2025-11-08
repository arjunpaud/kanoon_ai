import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router"

import Alert from "./Alert"
import Label from "./Label"
import Input from "./Input"
import Button from "./Button"
import { cn } from "../lib/utils"

export default function RegistrationForm({ bUrl }) {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [errorState, setErrorState] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (d) => {
        setLoading(true)
        try {
            const { email, password, confirmPassword: password2 } = d
            const res = await fetch(`${bUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, password2 }),
            })

            if (res.ok) {
                if (import.meta.env.DEV) {
                    window.location.href = `${bUrl}/chat/login`
                } else {
                    navigate("/chat/login")
                }
            } else {
                console.error(`Server responded with a status of ${res.status}`)
                const { detail } = await res.json()
                const message = Array.isArray(detail) ? detail[0].msg : detail
                if (message.includes("required")) {
                    throw new Error("All fields are required")
                } else if (message.includes("email")) {
                    throw new Error("Ensure valid email")
                } else if (message.includes("must match")) {
                    throw new Error("Ensure passwords match")
                } else if (message.includes("in use")) {
                    throw new Error(message)
                } else {
                    throw new Error("Failed to register user")
                }
            }
        } catch (error) {
            console.error(error)
            if (error instanceof Error) {
                setErrorState(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-white">Register Now</h1>
            </div>

            {errorState && <Alert variant="error">{errorState}</Alert>}

            <div className="grid gap-6">
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">
                            Email
                        </Label>
                        <Input
                            id="email"
                            disabled={loading}
                            type="text"
                            autoFocus
                            placeholder="Enter your email"
                            {...register("email", {
                                required: "Email is required",
                            })}
                            className={cn(
                                touchedFields.email &&
                                    errors.email &&
                                    "border-red-500",
                            )}
                        />
                        {touchedFields.email && errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white">
                                Password
                            </Label>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                disabled={loading}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                                className={cn(
                                    touchedFields.password &&
                                        errors.password &&
                                        "border-red-500",
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {touchedFields.password && errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white">
                                Confirm Password
                            </Label>
                        </div>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                disabled={loading}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                {...register("confirmPassword", {
                                    required:
                                        "Password confirmation is required",
                                })}
                                className={cn(
                                    touchedFields.confirmPassword &&
                                        errors.confirmPassword &&
                                        "border-red-500",
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {touchedFields.confirmPassword &&
                            errors.confirmPassword && (
                                <p className="text-sm text-red-500">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-white bg-[#f5145f] hover:bg-[#f5145f]/90 cursor-pointer"
                        disabled={loading}
                    >
                        Register
                    </Button>
                </>
            </div>
        </form>
    )
}
