import type { FC, HTMLAttributes } from "react";
import { BarChart2, MessageCircle, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const AlternateImageMockup: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
    return (
        <div
            className={cn(
                "size-full rounded-2xl bg-muted/20 p-2 shadow-2xl ring-1 ring-border/50 backdrop-blur-sm md:rounded-[24px] md:p-3 md:ring-2 lg:absolute lg:w-auto lg:max-w-none",
                props.className,
            )}
        >
            <div className="size-full rounded-[14px] bg-background p-1 shadow-inner md:rounded-[20px] md:p-2 border border-border/50">
                <div className="relative size-full overflow-hidden rounded-[10px] ring-1 ring-border/50 md:rounded-[16px]">
                    {props.children}
                </div>
            </div>
        </div>
    );
};

const CheckItemText = ({ text }: { text: string }) => (
    <li className="flex items-start gap-3">
        <div className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 p-1 text-blue-600 dark:text-blue-400">
            <Check className="h-3 w-3" strokeWidth={3} />
        </div>
        <span className="text-muted-foreground">{text}</span>
    </li>
);

export const FeaturesAlternatingLayout01 = () => {
    return (
        <section className="relative z-10 flex flex-col gap-12 overflow-hidden bg-background py-16 sm:gap-16 md:gap-20 md:py-24 lg:gap-24 w-full">
            <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 md:text-base uppercase tracking-wider">Features</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">Authentication, completely reimagined</h2>
                    <p className="mt-4 text-lg text-muted-foreground md:mt-5 md:text-xl">
                        A robust, highly secure, and beautifully designed authentication system ready to be dropped into your next big project. 
                    </p>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 sm:gap-20 md:gap-24 md:px-8 lg:gap-32 pb-24">
                {/* Feature 1: Security */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24 items-center">
                    <div className="max-w-xl flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">Secure by Default</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Industrial-grade encryption and session management right out of the box, keeping your users' data locked down.
                        </p>
                        <ul className="mt-8 flex flex-col gap-4">
                            {[
                                "Full Two-Factor Authentication (2FA) support",
                                "Active device session tracking and management",
                                "Encrypted passwords with bcrypt and secure JWTs",
                            ].map((feat) => (
                                <CheckItemText key={feat} text={feat} />
                            ))}
                        </ul>
                    </div>

                    <div className="relative w-full flex-1 aspect-video lg:aspect-auto lg:h-[32rem]">
                        <AlternateImageMockup className="lg:left-0">
                            <img
                                alt="Authentication Security mockup light"
                                src="/images/mockups/auth-security-light.png"
                                className="h-full w-full object-cover dark:hidden"
                            />
                            <img
                                alt="Authentication Security mockup dark"
                                src="/images/mockups/auth-security-dark.png"
                                className="hidden h-full w-full object-cover dark:block"
                            />
                        </AlternateImageMockup>
                    </div>
                </div>

                {/* Feature 2: Design */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24 items-center">
                    <div className="max-w-xl flex-1 lg:order-last">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">Beautifully Designed</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            A stunning, responsive user interface built with standard React and Tailwind CSS components.
                        </p>
                        <ul className="mt-8 flex flex-col gap-4">
                            {[
                                "Sleek, interactive slide-out menus and dialogs",
                                "Full Dark Mode compatibility with flawless transitions",
                                "Fully branded Handlebars HTML email templates",
                            ].map((feat) => (
                                <CheckItemText key={feat} text={feat} />
                            ))}
                        </ul>
                    </div>

                    <div className="relative w-full flex-1 aspect-video lg:aspect-auto lg:h-[32rem]">
                        <AlternateImageMockup className="lg:right-0">
                            <img
                                alt="Beautiful Design mockup light"
                                src="/images/mockups/auth-design-light.png"
                                className="h-full w-full object-cover dark:hidden"
                            />
                            <img
                                alt="Beautiful Design mockup dark"
                                src="/images/mockups/auth-design-dark.png"
                                className="hidden h-full w-full object-cover dark:block"
                            />
                        </AlternateImageMockup>
                    </div>
                </div>

                {/* Feature 3: OAuth */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24 items-center">
                    <div className="max-w-xl flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <BarChart2 className="h-6 w-6" />
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">Seamless Social OAuth</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Frictionless 1-click onboarding. Easily integrate social providers to dramatically improve your conversion rates.
                        </p>
                        <ul className="mt-8 flex flex-col gap-4">
                            {[
                                "Native Google and GitHub Sign-In support",
                                "Link and unlink providers directly from the settings page",
                                "Graceful fallbacks and robust error handling",
                            ].map((feat) => (
                                <CheckItemText key={feat} text={feat} />
                            ))}
                        </ul>
                    </div>

                    <div className="relative w-full flex-1 aspect-video lg:aspect-auto lg:h-[32rem]">
                        <AlternateImageMockup className="lg:left-0">
                            <img
                                alt="Social OAuth mockup light"
                                src="/images/mockups/auth-oauth-light.png"
                                className="h-full w-full object-cover dark:hidden"
                            />
                            <img
                                alt="Social OAuth mockup dark"
                                src="/images/mockups/auth-oauth-dark.png"
                                className="hidden h-full w-full object-cover dark:block"
                            />
                        </AlternateImageMockup>
                    </div>
                </div>
            </div>
        </section>
    );
};
