"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const IPhoneMockup = ({ image, imageDark, className }: { image: string; imageDark: string; className?: string }) => (
    <div className={cn("relative z-20 mx-auto w-full max-w-[280px] md:max-w-[320px]", className)}>
        {/* Simple iPhone frame representation */}
        <div className="relative rounded-[40px] border-[8px] border-zinc-900 bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden aspect-[9/19.5]">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-3xl w-1/2 mx-auto z-30" />
            
            <img src={image} alt="App mockup" className="absolute inset-0 h-full w-full object-cover dark:hidden" />
            <img src={imageDark} alt="App mockup dark" className="absolute inset-0 hidden h-full w-full object-cover dark:block" />
        </div>
    </div>
);

export const NewsletterIPhoneMockup01 = () => {
    return (
        <section className="overflow-hidden bg-blue-600 dark:bg-blue-950 pt-16 md:pt-24 mt-24 relative z-10 w-full">
            <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-6 md:px-8 lg:grid-cols-2 lg:items-center">
                <div className="z-20 flex flex-col items-start md:max-w-xl md:pr-10 text-white pb-16 lg:pb-24">
                    <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">Experience mobile auth perfection</h2>
                    <p className="mt-4 text-lg text-blue-100 md:mt-6 md:text-xl">
                        Our platform is fully responsive and looks stunning on any device. Subscribe for updates on our upcoming mobile SDKs.
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const data = Object.fromEntries(new FormData(e.currentTarget));
                            console.log("Form data:", data);
                            alert("Subscribed: " + data.email);
                        }}
                        className="mt-8 flex w-full flex-col gap-4 md:mt-12 md:max-w-md md:flex-row items-start"
                    >
                        <div className="flex-1 w-full">
                            <Input
                                required
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className="h-12 w-full bg-white/10 text-white placeholder:text-blue-200 border-blue-400/30 focus-visible:ring-white"
                            />
                            <p className="mt-2 text-xs text-blue-200">
                                We care about your data in our{" "}
                                <a href="#" className="underline underline-offset-2 hover:text-white transition-colors">
                                    privacy policy
                                </a>.
                            </p>
                        </div>
                        <Button type="submit" className="h-12 bg-white text-blue-600 hover:bg-blue-50 px-8 font-semibold shrink-0 w-full md:w-auto">
                            Subscribe
                        </Button>
                    </form>
                </div>

                <div className="relative h-[400px] md:h-[500px] w-full flex items-end justify-center lg:justify-end lg:pr-10">
                    <svg className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-blue-700/50 dark:text-blue-900/50 w-[150%] max-w-none z-10" viewBox="0 0 532 416" fill="none">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M182.034 461.691C74.9901 428.768 1.32278 329.846 0.0121784 217.408C-1.15817 117.003 82.1936 43.2414 176.777 10.7273C260.07 -17.9056 346.327 12.9156 406.143 77.7959C484.913 163.236 571.343 274.645 512.702 375.097C449.003 484.212 302.448 498.727 182.034 461.691Z"
                            fill="currentColor"
                        />
                    </svg>

                    <IPhoneMockup
                        image="/images/mockups/auth-mobile-light.png"
                        imageDark="/images/mockups/auth-mobile-dark.png"
                        className="absolute bottom-0 lg:right-0 translate-y-24 md:translate-y-32 z-20"
                    />
                </div>
            </div>
        </section>
    );
};
