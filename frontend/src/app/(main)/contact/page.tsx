'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Thank you for contacting us! We will get back to you shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-12 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400">
            Contact Support
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Let&apos;s Plan Your Next Adventure
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions about a trek, batch availability, or payments? Reach out to us directly. Our team is available 24/7.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Contact Details (Left Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Direct Channels</h2>
              
              <div className="space-y-5">
                <a 
                  href="tel:+918979117745"
                  className="flex items-start gap-4 group p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Call Us</div>
                    <div className="mt-1 text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">
                      +91 89791 17745
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Available for calls 9 AM - 9 PM</div>
                  </div>
                </a>

                <a 
                  href="https://wa.me/918979117745"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</div>
                    <div className="mt-1 text-sm font-semibold text-foreground group-hover:text-green-500 transition-colors">
                      +91 89791 17745
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Quick support & payment proof validation</div>
                  </div>
                </a>

                <a 
                  href="mailto:ukcode07@gmail.com"
                  className="flex items-start gap-4 group p-3 -m-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Us</div>
                    <div className="mt-1 text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                      ukcode07@gmail.com
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Response within 12 hours</div>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-3 -m-3 rounded-xl">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basecamp Office</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      Dehradun, Uttarakhand, India
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">HQ for Himalayan Expeditions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Bank / UPI info for manual verification */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-500/5 to-emerald-500/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl" />
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-brand-500" />
                <h3 className="font-display font-bold text-foreground">Official Payment Accounts</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Make transfers directly to verify your trek bookings. Always specify your Booking Reference as payment remarks.
              </p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">UPI ID</div>
                  <div className="font-mono font-bold text-foreground">8979117745@superyes</div>
                </div>
                <div className="border-t border-border/50 pt-2">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Bank Account Details</div>
                  <div className="font-semibold text-foreground">Uttarakhand Gramin Bank</div>
                  <div className="text-xs text-muted-foreground font-mono">A/C: Ending with 6468</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Official Merchant Account
              </div>
            </div>
          </div>

          {/* Form Column (Right Columns) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Send Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Query regarding Valley of Flowers trek"
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query in detail..."
                    rows={5}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand-500 resize-none transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-colors disabled:opacity-60"
                >
                  {sending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
