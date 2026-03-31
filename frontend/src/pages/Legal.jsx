import React, { useRef, useLayoutEffect } from "react";
import { ShieldCheck, Lock, FileText } from "lucide-react";
import { gsap } from "gsap";
import { ReactLenis } from '@studio-freight/react-lenis';

import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

// Shared Wrapper Component for all Legal Pages
const LegalPage = ({ title, date, children }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Fade and slide up the content box on load
      gsap.fromTo(".legal-content",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#3b82f6] selection:text-white">
        <Navbar />
        
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#3b82f6]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="legal-content bg-[#1c1c1c] rounded-[2.5rem] p-8 md:p-16 shadow-2xl border-2 border-white/5 relative overflow-hidden">
              
              {/* Top abstract border line */}
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#3b82f6] via-[#0ae448] to-[#ff4a9e]"></div>

              <div className="border-b border-white/10 pb-10 mb-10">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
                  {title}
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                  Last updated: {date}
                </p>
              </div>

              {/* Neo-Brutalist Prose Styling */}
              <div className="prose prose-invert prose-lg max-w-none hover:prose-a:text-[#3b82f6] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-white text-slate-400 prose-p:font-medium prose-li:font-medium prose-a:transition-colors">
                {children}
              </div>
              
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </ReactLenis>
  );
};

// --- EXPORTS ---

export const Privacy = () => (
  <LegalPage title="Privacy Policy" date="Dec 7, 2025">
    <p>
      This Privacy Policy describes how Taskify ("we", "our", "us"), operated by Utkarsh Suryakant Palav, collects, uses, and protects any information that you provide when using our website and services.
    </p>
    <p>
      Utkarsh Suryakant Palav is committed to ensuring that your privacy is
      protected. Should we ask you to provide certain information by which you
      can be identified when using this website, and then you can be assured
      that it will only be used in accordance with this privacy statement.
    </p>
    <p>
    Utkarsh Suryakant Palav may change this policy from time to time by
      updating this page. You should check this page from time to time to ensure
      that you adhere to these changes.
    </p>
    <h3>We may collect the following information:</h3>
    <ul>
      <li>Name</li>
      <li>Contact information including email address</li>
      <li>
        Demographic information such as postcode, preferences and interests, if
        required
      </li>
      <li>Other information relevant to customer surveys and/or offers</li>
    </ul>
    <h3>What we do with the information we gather</h3>
    <p>
      We require this information to understand your needs and provide you with
      a better service, and in particular for the following reasons:
    </p>
    <ul>
      <li>Internal record keeping.</li>
      <li>We may use the information to improve our products and services.</li>
      <li>
        We may periodically send promotional emails about new products, special
        offers or other information which we think you may find interesting
        using the email address which you have provided.
      </li>
      <li>
        From time to time, we may also use your information to contact you for
        market research purposes. We may contact you by email, phone, fax or
        mail. We may use the information to customise the website according to
        your interests.
      </li>
    </ul>
    <p>
      We are committed to ensuring that your information is secure. In order to
      prevent unauthorised access or disclosure we have put in suitable
      measures.
    </p>
    <h3>How we use cookies</h3>
    <p>
      A cookie is a small file which asks permission to be placed on your
      computer's hard drive. Once you agree, the file is added and the cookie
      helps analyze web traffic or lets you know when you visit a particular
      site. Cookies allow web applications to respond to you as an individual.
      The web application can tailor its operations to your needs, likes and
      dislikes by gathering and remembering information about your preferences.
    </p>
    <p>
      We use traffic log cookies to identify which pages are being used. This
      helps us analyze data about webpage traffic and improve our website in
      order to tailor it to customer needs. We only use this information for
      statistical analysis purposes and then the data is removed from the
      system.
    </p>
    <p>
      Overall, cookies help us provide you with a better website, by enabling us
      to monitor which pages you find useful and which you do not. A cookie in
      no way gives us access to your computer or any information about you,
      other than the data you choose to share with us.
    </p>
    <p>
      You can choose to accept or decline cookies. Most web browsers
      automatically accept cookies, but you can usually modify your browser
      setting to decline cookies if you prefer. This may prevent you from taking
      full advantage of the website.
    </p>
    <h3>Controlling your personal information</h3>
    <p>
      You may choose to restrict the collection or use of your personal
      information in the following ways:
    </p>
    <ul>
      <li>
        whenever you are asked to fill in a form on the website, look for the
        box that you can click to indicate that you do not want the information
        to be used by anybody for direct marketing purposes
      </li>
      <li>
        if you have previously agreed to us using your personal information for
        direct marketing purposes, you may change your mind at any time by
        writing to or emailing us at support@utkarshdev.me
      </li>
    </ul>
    <p>
      We will not sell, distribute or lease your personal information to third
      parties unless we have your permission or are required by law to do so. We
      may use your personal information to send you promotional information
      about third parties which we think you may find interesting if you tell us
      that you wish this to happen.
    </p>
    <p>
      If you believe that any information we are holding on you is incorrect or
      incomplete, please write to Ramchandra Plaza, Kashi Nagar, Bhayandar East,
      Thane - 401105 Thane MAHARASHTRA 401105 . or contact us at 7208451005 or
      support@utkarshdev.me as soon as possible. We will promptly correct any
      information found to be incorrect.
    </p>
  </LegalPage>
);

export const Terms = () => (
  <LegalPage title="Terms & Conditions" date="Dec 7, 2025">
    <p>
      For the purpose of these Terms and Conditions, The term "we", "us", "our"
      used anywhere on this page shall mean Utkarsh Suryakant Palav, whose
      registered/operational office is Ramchandra Plaza, Kashi Nagar, Bhayandar
      East, Thane - 401105 Thane MAHARASHTRA 401105 . "you", "your", "user",
      "visitor" shall mean any natural or legal person who is visiting our
      website and/or agreed to purchase from us.
    </p>
    <h3>
      Your use of the website and/or purchase from us are governed by following
      Terms and Conditions:
    </h3>
    <ul>
      <li>
        The content of the pages of this website is subject to change without
        notice.
      </li>
      <li>
        Neither we nor any third parties provide any warranty or guarantee as to
        the accuracy, timeliness, performance, completeness or suitability of
        the information and materials found or offered on this website for any
        particular purpose. You acknowledge that such information and materials
        may contain inaccuracies or errors and we expressly exclude liability
        for any such inaccuracies or errors to the fullest extent permitted by
        law.
      </li>
      <li>
        Your use of any information or materials on our website and/or product
        pages is entirely at your own risk, for which we shall not be liable. It
        shall be your own responsibility to ensure that any products, services
        or information available through our website and/or product pages meet
        your specific requirements.
      </li>
      <li>
        Our website contains material which is owned by or licensed to us. This
        material includes, but are not limited to, the design, layout, look,
        appearance and graphics. Reproduction is prohibited other than in
        accordance with the copyright notice, which forms part of these terms
        and conditions.
      </li>
      <li>
        All trademarks reproduced in our website which are not the property of,
        or licensed to, the operator are acknowledged on the website.
      </li>
      <li>
        Unauthorized use of information provided by us shall give rise to a
        claim for damages and/or be a criminal offense.
      </li>
      <li>
        From time to time our website may also include links to other websites.
        These links are provided for your convenience to provide further
        information.
      </li>
      <li>
        You may not create a link to our website from another website or
        document without Utkarsh Suryakant Palav's prior written consent.
      </li>
      <li>
        Any dispute arising out of use of our website and/or purchase with us
        and/or any engagement with us is subject to the laws of India .
      </li>
      <li>
        We, shall be under no liability whatsoever in respect of any loss or
        damage arising directly or indirectly out of the decline of
        authorization for any Transaction, on Account of the Cardholder having
        exceeded the preset limit mutually agreed by us with our acquiring bank
        from time to time
      </li>
    </ul>
  </LegalPage>
);

export const CancellationRefund = () => (
  <LegalPage title="Cancellation & Refund" date="Dec 7, 2025">
    <p>
    Utkarsh Suryakant Palav believes in helping its customers as far as
      possible, and has therefore a liberal cancellation policy. Under this
      policy:
    </p>
    <ul>
      <li>
        Cancellations will be considered only if the request is made within 2
        days of placing the order. However, the cancellation request may not be
        entertained if the orders have been communicated to the
        vendors/merchants and they have initiated the process of shipping them.
      </li>
      <li>
      Utkarsh Suryakant Palav does not accept cancellation requests for
        perishable items like flowers, eatables etc. However, refund/replacement
        can be made if the customer establishes that the quality of product
        delivered is not good.
      </li>
      <li>
        In case of receipt of damaged or defective items please report the same
        to our Customer Service team. The request will, however, be entertained
        once the merchant has checked and determined the same at his own end.
        This should be reported within 2 days of receipt of the products.
      </li>
      <li>
        In case you feel that the product received is not as shown on the site
        or as per your expectations, you must bring it to the notice of our
        customer service within 2 days of receiving the product. The Customer
        Service Team after looking into your complaint will take an appropriate
        decision.
      </li>
      <li>
        In case of complaints regarding products that come with a warranty from
        manufacturers, please refer the issue to them.
      </li>
      <li>
        In case of any Refunds approved by the Utkarsh Suryakant Palav, it'll
        take 9-15 days for the refund to be processed to the end customer.
      </li>
    </ul>
  </LegalPage>
);

export const ShippingPolicy = () => {
  return (
    <LegalPage title="Shipping & Delivery Policy" date="Dec 7, 2025">
      <p>
        For International buyers, orders are shipped and delivered through
        registered international courier companies and/or International speed post
        only. For domestic buyers, orders are shipped through registered domestic
        courier companies and /or speed post only. Orders are shipped within 0-7
        days or as per the delivery date agreed at the time of order confirmation
        and delivering of the shipment subject to Courier Company / post office
        norms. Utkarsh Suryakant Palav is not liable for any delay in delivery by
        the courier company / postal authorities and only guarantees to hand over
        the consignment to the courier company or postal authorities within 0-7
        days rom the date of the order and payment or as per the delivery date
        agreed at the time of order confirmation. Delivery of all orders will be
        to the address provided by the buyer. Delivery of our services will be
        confirmed on your mail ID as specified during registration. For any issues
        in utilizing our services you may contact our helpdesk on 7208451005 or
        support@utkarshdev.me
      </p>
    </LegalPage>
  );
};