"use client";
import Mainheader from "@/components/Mainheader";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import bot3d from "../../public/bot3d.png";
import screenshot from "../../public/screenshot.png";

import { features, plans } from "../../constant/Features";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen '>
      <Mainheader />

      <main className='flex-1 '>
        <section className='pt-8 pb-20  bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#E1B177,transparent_22%)]  md:bg-[radial-gradient(ellipse_200%_100%_at_bottom_right,#E1B177,transparent_22%)] lg:bg-[radial-gradient(ellipse_200%_100%_at_bottom_right,#E1B177,transparent_22%)]'>
          <div className='container'>
            <div className='md:flex items-center overflow-x-clip '>
              <div className='md:w-[478px]'>
                <div className='flex flex-col gap-5 md:gap-7 lg:gap-12'>
                  <h1 className='text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-gray-700 to-[#E1B177] text-transparent bg-clip-text'>
                    Pathway to Smarter Conversations
                  </h1>
                  <h5 className='text-xl text-gray-700 dark:text-gray-400 tracking-tight '>
                    Unlock the power of AI with a platform that lets you chat
                    directly with your PDF documents, create customized sales
                    chatbots, and embed them on your website to capture leads.
                    Whether you&#39;re engaging customers, tracking
                    conversations, or analyzing performance, our app is designed
                    to drive your productivity and enhance your customer
                    interactions.
                  </h5>
                </div>
                {/* below button */}
                <div className='flex items-center gap-5 mt-5 md:mt-7 lg:mt-12'>
                  <Link href='/dashboard'>
                    <Button className='bg-gray-950 dark:text-gray-400 dark:bg-gray-950 dark:hover:text-gray-200 hover:bg-[#E1B177] dark:hover:bg-[#E1B177]'>
                      Get Started
                    </Button>
                  </Link>
                  <Link href='#features'>
                    <Button
                      variant={"ghost"}
                      className='flex items-center gap-2 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] hover:text-gray-100 dark:hover:text-gray-200'
                    >
                      <span>Learn more</span>
                      <ArrowRight />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className='mt-20 md:mt-0 lg:mt-0 md:h-[648px] md:flex-1 relative'>
                <Image
                  src={bot3d}
                  alt='bot3d'
                  className='md:absolute  md:max-w-none  md:h-full md:w-auto md:-left-7 lg:-left-72 '
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id='learn'
          className='md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto p-6 w-full mt-12 flex flex-col gap-5'
        >
          <div className='mx-auto max-w-2xl sm:text-center md:max-w-5xl md:mx-auto lg:max-w-5xl lg:mx-auto'>
            <h2 className='text-base font-semibold leading-7 text-[#E1B177] text-center'>
              Your Interactive Document Companion
            </h2>
            <h1 className='mt-2 text-3xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-gray-400 sm:text-6xl text-center'>
              {/* Transform Your PDFs into Interactive Conversations. Build a
              Powerful Chatbot to Engage Your Clients. 
            Turn PDFs into Conversations. Build a Chatbot to Engage Clients.  */}
              Turn PDFs into Conversations. Build Chatbots to Engage.
            </h1>
          </div>

          <div className='relative overflow-hidden pt-16'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
              {/* <Image
                src={screenshot}
                alt='screenshot'
                width={2432}
                height={1442}
                className='mb-[-0%] rounded-xl shadow-2xl right-1 ring-gray-900/10 dark:shadow-gray-900'
              /> */}

              <video
                autoPlay
                loop
                playsInline
                muted
                no-control
                className='mb-[-0%] rounded-xl shadow-2xl right-1 ring-gray-900/10 dark:shadow-gray-900'
                width={2432}
                height={1442}
              >
                <source
                  src='https://firebasestorage.googleapis.com/v0/b/skybluelounge-aa327.appspot.com/o/users%2Fuser123%2Fvideo%2FLAPtRQ8Ldnj1xIb1bVWO?alt=media&token=9f454d44-4a78-491e-83a2-1d125adc0a08
                  '
                  type='video/mp4'
                />
                Your browser does not support the video tag.
              </video>
              <div aria-hidden='true' className='relative'>
                <div className='absolute bg-gradient-to-t from-gray-100/15  dark:from-gray-400/15 pt-[5%] -inset-32 bottom-0' />
              </div>
            </div>
          </div>
        </section>

        <section
          id='features'
          className='md:max-w-3xl mx-auto lg:max-w-7xl lg:mx-auto w-full p-7 mt-12'
        >
          <div className=''>
            <dl className='mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16'>
              {features.map((feature) => (
                <div key={feature.name} className='relative pl-9'>
                  <dt className='inline font-semibold text-gray-200 dark:text-gray-400'>
                    <feature.icon className='absolute left-1 top-1 h-5 w-5 text-[#E1B177]' />
                  </dt>
                  <dd>{feature?.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id='pricing'>
          <div className='bg-gray-100  py-12 mt-20 dark:bg-gray-950'>
            <div className='md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto w-full text-center px-4'>
              <h1 className='text-4xl font-thin text-[#E1B177]'>
                Pricing Plans
              </h1>
              <h5 className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
                Choose the plan that is right for your business. Our flexible
                pricing options make it easy to get started and scale as you
                grow.
              </h5>

              <div className='mt-10 grid gap-8 md:grid-cols-3'>
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative bg-white rounded-lg shadow-lg p-5 dark:text-gray-400 dark:bg-gray-950 dark:shadow-gray-900 ${
                      plan.isMostPopular ? "ring-2 ring-[#E1B177]" : ""
                    }`}
                  >
                    {plan.isMostPopular && (
                      <span className='absolute top-0 right-0 bg-[#E1B177] text-white text-sm px-3 py-1 rounded-bl-lg'>
                        Most Popular
                      </span>
                    )}
                    <h2 className='text-xl font-semibold text-gray-800'>
                      {plan.name} Plan
                    </h2>
                    <h2 className='mt-4 text-gray-900 dark:text-gray-200 text-3xl font-bold'>
                      {plan.price}
                      {plan.name !== "Basic" && (
                        <span className='text-sm font-semibold leading-6 text-gray-600'>
                          /month
                        </span>
                      )}
                    </h2>

                    <ul className='mt-6 space-y-3'>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className='flex items-center  gap-2'>
                          <CheckIcon className='h-4 w-4 fill-primary' />
                          <p className='text-left'> {feature}</p>
                        </li>
                      ))}
                    </ul>
                    {plan?.buttonText !== "" && (
                      <Link href='/pricing'>
                        <Button
                          // disabled={isPending}
                          //  onClick={() => router.push("/p")}
                          className={`mt-6 block text-center py-2 px-4 rounded-md text-white w-full dark:hover:bg-[#E1B177]/70 ${
                            plan.isMostPopular
                              ? "bg-[#E1B177] hover:bg-[#E1B177]"
                              : "bg-black/50 hover:bg-black"
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='flex flex-col gap-2  py-6 w-full shrink-0 items-center justify-center px-4 md:px-6 border-t'>
        <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
          © 2024 Quiks bot. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
