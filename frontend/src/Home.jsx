import kaiLogo from "./assets/kai_logo.png"
import RegistrationForm from "./components/RegistrationForm"

export default function Home() {
    const bUrl = import.meta.env.DEV
        ? import.meta.env.VITE_DEV_API_BASE_URL
        : ""

    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-[#212121]">
            <div className="flex flex-col gap-4 p-6 md:p-10 text-white">
                <div className="flex justify-center gap-2 md:justify-start">
                    <img src={kaiLogo} alt="logo" className="logo w-[150px]" />
                </div>
                <div className="flex flex-col justify-center items-center h-full max-md:mt-5">
                    <h1 className="text-4xl font-extrabold">
                        Welcome to Kanoon AI 🤗
                    </h1>
                    <p className="text-base mt-2">
                        Empowering citizens and lawyers of Nepal with guidance
                        and research.
                    </p>
                    <ul className="mt-6 text-neutral-400 flex flex-col gap-2">
                        <li>🇳🇵 Q/A in नेपाली</li>
                        <li>👨‍⚖️ Get extensive answers about Nepali Law</li>
                        <li>
                            📃 Excellent sourcing of relevant Laws, Acts and
                            Regulations
                        </li>
                        <li>
                            ⚙️ Separate profiles or modes for Precedent Research
                            and General Q/A
                        </li>
                    </ul>
                    <a
                        href={`${bUrl}/chat`}
                        className="mt-6 text-sm text-white h-10 px-4 py-2 rounded-md w-full sm:w-1/2 lg:w-3/4 text-center bg-[#2460b9] hover:bg-[#2460b9]/90 cursor-pointer"
                    >
                        Login or Open Chat
                    </a>
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
