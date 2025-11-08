import { Link } from "react-router"

import chainlitLogo from "./assets/chainlit_logo.svg"
import RegistrationForm from "./components/RegistrationForm"

export default function Home() {
    const bUrl = import.meta.env.DEV
        ? import.meta.env.VITE_DEV_API_BASE_URL
        : ""

    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-[#212121]">
            <div className="flex flex-col gap-4 p-6 md:p-10 text-white">
                <div className="flex justify-center gap-2 md:justify-start">
                    <img
                        src={chainlitLogo}
                        alt="logo"
                        className="logo w-[150px]"
                    />
                </div>
                <div className="flex flex-col justify-center items-center h-full max-md:mt-5">
                    <h1 className="text-4xl font-extrabold">
                        Welcome to Kanoon AI 🤗
                    </h1>
                    <p className="text-base mt-2">
                        Empowering citizens & lawyers of 🇳🇵 with guidance and
                        research.
                    </p>
                    <ul className="mt-6 text-neutral-400 flex flex-col gap-2">
                        <li>🇳🇵Q/A in नेपाली</li>
                        <li>👨‍⚖️ Get extensive answers about Nepali law</li>
                        <li>
                            📃 Excellent sourcing of relevant laws, acts and
                            regulations.
                        </li>
                    </ul>
                    <Link
                        to={`${bUrl}/chat`}
                        className="mt-6 text-sm text-white h-10 px-4 py-2 rounded-md w-full sm:w-1/2 lg:w-3/4 text-center bg-[#f5145f] hover:bg-[#f5145f]/90 cursor-pointer"
                    >
                        Login or Open Chat
                    </Link>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <RegistrationForm bUrl={bUrl} />
                    </div>
                </div>
            </div>
        </div>
    )
}
