"use client";

import { useState } from "react";
import Link from "next/link";
import SunIcon from "@/components/SunIcon";
import { createLead } from "@/lib/api";
import SignatureDish from "@/components/SignatureDish";
import Testimonials from "@/components/Testimonials";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead(formData);
      setSubmitted(true);
      setFormData({
        name: "",
        contactInfo: "",
        message: "",
      });
    } catch (err) {
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
        <div className="text-center">
          <SunIcon className="mx-auto h-14 w-14" />
          <p className="mt-3 font-display text-sm font-bold uppercase tracking-widest text-tomato">
            Get in touch
          </p>
          <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
            Say Hello
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-forest/70">
            Questions, catering requests, or feedback — send us a note. Ready
            to order?{" "}
            <Link
              href="/menu"
              className="focus-ring font-bold text-tomato underline"
            >
              Head to the menu
            </Link>{" "}
            instead.
          </p>
        </div>

        {submitted ? (
          <div className="mt-10 rounded-3xl border-2 border-forest/15 bg-card p-8 text-center">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-tomato">
              Message received
            </p>
            <p className="mt-2 font-script text-4xl text-forest">
              Thank you! We will contact you soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 font-display text-sm font-bold text-tomato underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 rounded-3xl border-2 border-forest/15 bg-card p-6 md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
                  Name
                </span>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
                  Phone or email
                </span>
                <input
                  required
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: e.target.value,
                    })
                  }
                  className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
                  placeholder="How should we reach you?"
                />
              </label>
            </div>

            <label className="block">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
                Message
              </span>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="focus-ring mt-2 w-full resize-none rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
                placeholder="What's on your mind?"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full rounded-full bg-tomato px-8 py-3 font-display text-sm font-bold text-cream transition hover:bg-forest disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </main>

      {/* Signature Dish */}
      <SignatureDish />
      {/*Testimonials */}
      <Testimonials />
    </>
  );
}