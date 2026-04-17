"use client";
import Mainheader from "@/components/Mainheader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, CheckIcon, MailIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import bot3d from "../../public/bot3d.png";
import anthropic from "../../public/anthropic.png";
import grok from "../../public/grok.png";
import deepseek from "../../public/deepseek_logo.png";
import openai from "../../public/openai_logo.svg";
import { features, plans } from "../../constant/Features";
import { BASE_URL } from "../../constant/url";
import SocialLinks from "@/components/SocialLinks";
import React from "react";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen '>
      <Mainheader />

      <main className='flex-1 '>
        <section className='pt-2 pb-20  bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#E1B177,transparent_22%)]  md:bg-[radial-gradient(ellipse_200%_100%_at_bottom_right,#E1B177,transparent_22%)] lg:bg-[radial-gradient(ellipse_200%_100%_at_bottom_right,#E1B177,transparent_22%)]'>
          <div className='container'>
            <div className='md:flex items-center overflow-x-clip '>
              <div className='md:w-[478px]'>
                <div className='flex flex-col gap-5 md:gap-7 lg:gap-12'>
                  <h4 className='text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-gray-700 to-[#E1B177] text-transparent bg-clip-text'>
                    Pathway to Smarter Conversations
                  </h4>
                  <h5 className='text-xl text-gray-700 dark:text-gray-400 tracking-tight '>
                    {/* Unlock the power of AI with a platform that enables you to
                    train chatbots using PDFs, website crawls, and text data.
                    Create customized sales chatbots that can be seamlessly
                    embedded on your website to capture leads and engage
                    customers. With Quiksbot, you can efficiently track
                    conversations, analyze performance, and drive productivity,
                    enhancing every customer interaction and streamlining your
                    workflows. */}
                    Unlock the power of AI with Quiksbot — an all-in-one chatbot
                    platform that lets you train bots using PDFs, website
                    crawls, and text data. Create custom sales, support, or
                    appointment chatbots that can be embedded on your website or
                    connected via WhatsApp to engage visitors, capture leads,
                    and streamline workflows. Track conversations, analyze
                    performance, and enhance every customer interaction with
                    ease.
                  </h5>
                  <h6 hidden>
                    ai chatbot, chatbot ai, chat with pdf, chatbot analytics,
                    PDF interaction, chatbot integration, customer service
                    chatbot, chat ai online, ai chat online, user experience,
                    machine learning, natural language, LLM, openai chat,
                    openai, quiksbot, quick ai learning, ai chat, ai bot, ai
                    chat free, ai chatbot free, ai chatbot online, ai chatbot
                    online free, ai texting bot, ai to talk to, artificial
                    intelligence online chat, chat artificial intelligence, talk
                    to artificial intelligence, email campaign, marketing
                    campaign tool, whatsApp Integration
                  </h6>
                </div>

                <div className='flex items-center gap-5 mt-5 md:mt-7 lg:mt-12'>
                  <Link href='/dashboard' title='dashboard'>
                    <Button className='bg-gray-950 dark:text-gray-400 dark:bg-gray-950 dark:hover:text-gray-200 hover:bg-[#E1B177] dark:hover:bg-[#E1B177]'>
                      Get Started
                    </Button>
                  </Link>
                  <Link href='#features' title='features'>
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
              Your Interactive Quiksbot with live chat functionality,
              appointment scheduling, Email Campaign Tools.
            </h2>
            <h1 className='mt-2 text-3xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-gray-400 sm:text-6xl text-center'>
              {/* Transform Your PDFs into Interactive Conversations. Build a
              Powerful Chatbot to Engage Your Clients. 
            Turn PDFs into Conversations. Build a Chatbot to Engage Clients.  */}
              Build a Powerful Chatbot to Engage Your Clients.
              <span hidden>
                Create a chatbot | embed chatbot inside your website | chat with
                pdf File | quiksbot | ai chatbot | chatbot ai | ai to talk to |
                ai chat | chat ai | live chat | email campaign tools
              </span>
            </h1>
          </div>

          <div className='relative overflow-hidden pt-16'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
              <video
                autoPlay
                loop
                playsInline
                muted
                className='mb-[-0%] rounded-xl shadow-2xl right-1 ring-gray-900/10 dark:shadow-gray-900'
                width={2432}
                height={1442}
              >
                <source
                  src='https://firebasestorage.googleapis.com/v0/b/skybluelounge-aa327.appspot.com/o/users%2Fuser123%2Fvideo%2FQuiksbot%20-%20video%20website.mp4?alt=media&token=1a9b5094-178c-4684-9775-c101534c30b1'
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

        {/* <section className='py-16 '>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3'>
                Trusted by 50+ Clients Worldwide
              </h2>
              <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                Join the growing number of businesses that rely on Quiksbot to
                enhance their customer interactions
              </p>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center'>
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className='flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300'
                >
                  <Image
                    src={`${openai}`}
                    alt={`Client ${index + 1}`}
                    width={120}
                    height={60}
                    className='max-h-12 w-auto object-contain'
                  />
                </div>
              ))}
            </div>
          </div>
        </section> */}

        <section className='py-12 w-full overflow-hidden relative'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center w-max animate-scroll-slow space-x-40'>
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className='flex flex-col items-center min-w-[20vw]'>
                    <Image
                      src={openai}
                      alt='ChatGPT Logo'
                      width={150}
                      height={60}
                      className='opacity-80 hover:opacity-100 transition-opacity dark:invert'
                    />
                  </div>
                  <div className='flex flex-col items-center min-w-[20vw]'>
                    <Image
                      src={deepseek}
                      alt='DeepSeek Logo'
                      width={150}
                      height={60}
                      className='opacity-80 hover:opacity-100 transition-opacity '
                    />
                  </div>
                  <div className='flex flex-col items-center min-w-[20vw]'>
                    <Image
                      src={anthropic}
                      alt='Anthropic Logo'
                      width={150}
                      height={60}
                      className='opacity-80 hover:opacity-100 transition-opacity dark:invert'
                    />
                  </div>
                  <div className='flex flex-col items-center min-w-[20vw]'>
                    <Image
                      src={grok}
                      alt='Grok Logo'
                      width={150}
                      height={60}
                      className='opacity-80 hover:opacity-100 transition-opacity invert dark:invert-0'
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section id='pricing'>
          <div className='bg-gray-100  py-12 mt-20 dark:bg-gray-950 '>
            <div className='md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto w-full text-center px-4'>
              <h6 className='text-4xl font-thin text-[#E1B177]'>
                Pricing Plans
              </h6>
              <h5 className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
                Choose the plan that is right for your business. Our flexible
                pricing options make it easy to get started and scale as you
                grow.
              </h5>

              <div className='mt-10 grid gap-8 md:grid-cols-3'>
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative bg-white rounded-lg shadow-lg p-7 dark:text-gray-400 dark:bg-gray-950 dark:shadow-gray-900  ${
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
                    <h2
                      className={`${
                        plan?.name !== "Basic" ? "cross" : ""
                      } mt-4 text-gray-900 dark:text-gray-200 text-3xl font-bold`}
                    >
                      {plan.originalPrice}

                      {plan.name !== "Basic" && (
                        <span className='text-sm font-semibold leading-6 text-gray-600'>
                          /month
                        </span>
                      )}
                    </h2>

                    <h2 className='mt-4 text-gray-900 dark:text-gray-200 text-xl font-bold'>
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
                          {/* <CheckIcon className='h-4 w-4 fill-primary' /> */}
                          <div className='flex-shrink-0 h-5 w-5 rounded-full bg-[#E1B177]/10 flex items-center justify-center'>
                            <Check className='h-3.5 w-3.5 text-[#E1B177]' />
                          </div>
                          <p className='text-left'> {feature}</p>
                        </li>
                      ))}
                    </ul>
                    {plan?.buttonText !== "" && (
                      <Link href={`${BASE_URL}/pricing`} title='pricing'>
                        <Button
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

      <footer className='flex md:flex-row flex-col  gap-2  py-6 md:py-2 w-full shrink-0  items-center md:justify-between px-4 md:px-6 border-t'>
        <SocialLinks />

        <p className='text-xs text-gray-500 dark:text-gray-400 '>
          © 2024 Quiksbot. All rights reserved.
        </p>
        <span className='text-xs text-gray-500 dark:text-gray-400 '>
          (IČO) 21782326.
        </span>

        <p hidden>
          ai chatbot, chatbot ai, chat with pdf, chatbot analytics, PDF
          interaction, chatbot integration, customer service chatbot, chat ai
          online, ai chat online, user experience, machine learning, natural
          language, LLM, openai chat, openai, quiksbot, quick ai learning, ai
          chat, ai bot, ai chat free, ai chatbot free, ai chatbot online, ai
          chatbot online free, ai texting bot, ai to talk to, artificial
          intelligence online chat, chat artificial intelligence, talk to
          artificial intelligence, chat ai
        </p>
      </footer>
    </div>
  );
}
