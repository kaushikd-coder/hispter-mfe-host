import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useSession from "./useSession";


export default function Home() {
    const navigate = useNavigate();
    const user = useSession();

    return (
        <div className="relative ">
            {/* soft glows */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
            
            {/* header */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative"
            >
                <h1 className="mb-2 text-3xl font-semibold text-white/90">
                    Welcome back, <span className="text-white">{user?.name}</span> 👋
                </h1>
                <p className="mb-6 text-emerald-50/80">
                    You’re signed in. This is the host’s home page.
                </p>
            </motion.div>

            {/* mini highlight strip */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="mb-6 h-px origin-left bg-gradient-to-r from-emerald-400/60 via-teal-300/40 to-transparent"
            />

            {/* content row */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Card 1 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                    <p className="text-sm text-emerald-50/70">Environment</p>
                    <p className="mt-1 text-lg font-medium text-white">Host Shell</p>
                </motion.div>

                {/* Card 2 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                    <p className="text-sm text-emerald-50/70">Modules</p>
                    <p className="mt-1 text-lg font-medium text-white">
                        Auth · Booking · Reporting
                    </p>
                </motion.div>

                {/* Card 3 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26 }}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                    <p className="text-sm text-emerald-50/70">Status</p>
                    <p className="mt-1 text-lg font-medium text-white">
                        All systems nominal ✅
                    </p>
                </motion.div>
            </div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-7"
            >
                <motion.button
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/booking")}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-300/30 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                    Go to Booking
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="opacity-90"
                    >
                        <path
                            d="M5 12h14M13 5l7 7-7 7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.button>
            </motion.div>
        </div>
    );
}
