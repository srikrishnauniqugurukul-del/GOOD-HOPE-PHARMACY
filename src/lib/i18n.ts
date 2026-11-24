import type { LanguageCode } from '../types/domain';

export const LANGUAGES: Array<{ code: LanguageCode; label: string; nativeLabel: string }> = [
  { code: 'en', label: 'English', nativeLabel: 'EN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export interface TranslationBundle {
  nav: {
    home: string;
    about: string;
    pharmacy: string;
    doctors: string;
    specialities: string;
    book: string;
    gallery: string;
    contact: string;
    admin: string;
  };
  hero: {
    headline: string;
    subheading: string;
    supporting: string;
    ctaPrimary: string;
    ctaSecondary: string;
    staticToggleOn: string;
    staticToggleOff: string;
    sceneLabels: [string, string, string, string];
  };
  sections: {
    aboutKicker: string;
    whyKicker: string;
    whyTitle: string;
    servicesKicker: string;
    servicesTitle: string;
    doctorsKicker: string;
    doctorsTitle: string;
    doctorsSubtitle: string;
    bookingKicker: string;
    bookingTitle: string;
    pharmacyKicker: string;
    galleryKicker: string;
    galleryTitle: string;
    reviewsKicker: string;
    reviewsTitle: string;
    contactKicker: string;
    contactTitle: string;
  };
  whyItems: Array<{ title: string; desc: string }>;
  doctorCard: {
    verified: string;
    pendingVerification: string;
    viewProfile: string;
    bookWithDoctor: string;
    regNo: string;
    affiliation: string;
    schedulePending: string;
    scheduleAvailable: string;
  };
  booking: {
    stepDepartment: string;
    stepService: string;
    stepDoctor: string;
    stepDate: string;
    stepSlot: string;
    stepDetails: string;
    stepSummary: string;
    fullName: string;
    mobile: string;
    emailOptional: string;
    messageOptional: string;
    submitBooking: string;
    submitting: string;
    confirmedTitle: string;
    pendingNote: string;
    bookingRef: string;
    statusLabel: string;
    newBooking: string;
    noSlotsConfigured: string;
    requestEnquirySlot: string;
    blockedDateNotice: string;
    privacyNote: string;
    errors: {
      selectDept: string;
      selectService: string;
      selectDoctor: string;
      selectDate: string;
      selectSlot: string;
      enterName: string;
      enterMobile: string;
    };
  };
  contact: {
    callNow: string;
    ownerLabel: string;
    phoneLabel: string;
    addressLabel: string;
    additionalAddressLabel: string;
    openMapSearch: string;
    openVerifiedMap: string;
    mapUnverifiedNote: string;
    enquiryTitle: string;
    sendEnquiry: string;
    enquirySent: string;
    hoursTitle: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    legal: string;
    privacy: string;
    terms: string;
    appointmentPolicy: string;
    cancellationPolicy: string;
    rights: string;
    medicalDisclaimer: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    nav: {
      home: 'Home',
      about: 'About Us',
      pharmacy: 'Pharmacy',
      doctors: 'Our Doctors',
      specialities: 'Specialities',
      book: 'Book Appointment',
      gallery: 'Gallery',
      contact: 'Contact',
      admin: 'Admin',
    },
    hero: {
      headline: 'GOOD HEALTH. GOOD CARE. GOOD HOPE.',
      subheading: 'Your trusted healthcare destination in Kalimpong.',
      supporting:
        'Discover convenient pharmacy services and doctor consultation appointments at Good Hope Pharmacy.',
      ctaPrimary: 'Book an Appointment',
      ctaSecondary: 'Meet Our Doctors',
      staticToggleOn: 'Enable Motion',
      staticToggleOff: 'Static View',
      sceneLabels: [
        'Doctor Consultation',
        'Pharmacy Assistance',
        'Care & Information',
        'Good Hope Pharmacy',
      ],
    },
    sections: {
      aboutKicker: 'About Good Hope Pharmacy',
      whyKicker: 'Patient-First Care',
      whyTitle: 'Why Families in Kalimpong Choose Good Hope',
      servicesKicker: 'Consultation & Pharmacy Services',
      servicesTitle: 'Specialities & Healthcare Services',
      doctorsKicker: 'Specialist Directory',
      doctorsTitle: 'Doctors Available at Good Hope',
      doctorsSubtitle:
        'Browse visiting specialist profiles transcribed from our Kalimpong clinic board. Individual timings and credentials are updated directly by Good Hope Pharmacy administration.',
      bookingKicker: 'Appointment Desk',
      bookingTitle: 'Book a Doctor Consultation',
      pharmacyKicker: 'In-Store Pharmacy',
      galleryKicker: 'Clinic & Pharmacy Gallery',
      galleryTitle: 'Inside Good Hope Pharmacy',
      reviewsKicker: 'Verified Patient Feedback',
      reviewsTitle: 'What Our Visitors Share',
      contactKicker: 'Visit or Call Us',
      contactTitle: 'Location & Contact Details',
    },
    whyItems: [
      {
        title: 'Convenient Pharmacy Access',
        desc: 'Located centrally at KD Pradhan Road, Kalimpong Bazar for dependable in-person pharmacy support.',
      },
      {
        title: 'Doctor Consultation Enquiries',
        desc: 'Clear assistance for outpatient specialist consultations across ENT, Gynaecology, Pediatrics, Medicine, and Surgery.',
      },
      {
        title: 'Multiple Medical Specialities',
        desc: 'Eight visiting doctors spanning core medical and surgical specialities in one familiar location.',
      },
      {
        title: 'Easy Appointment Booking',
        desc: 'Submit your preferred doctor, service, and date online with a clear booking reference and status updates.',
      },
      {
        title: 'Friendly Customer Experience',
        desc: 'Respectful, patient-focused reception and counter care overseen directly by owner Sudarshan Karkee.',
      },
    ],
    doctorCard: {
      verified: 'Verified Profile',
      pendingVerification: 'Pending Owner Verification',
      viewProfile: 'View Profile',
      bookWithDoctor: 'Book Appointment',
      regNo: 'Reg. No.',
      affiliation: 'Affiliation',
      schedulePending: 'Timings confirmed on enquiry',
      scheduleAvailable: 'Scheduled slots available',
    },
    booking: {
      stepDepartment: '1. Department',
      stepService: '2. Service',
      stepDoctor: '3. Doctor',
      stepDate: '4. Date',
      stepSlot: '5. Time Slot',
      stepDetails: '6. Patient Details',
      stepSummary: 'Booking Summary',
      fullName: 'Full Name',
      mobile: 'Mobile Number',
      emailOptional: 'Email Address (Optional)',
      messageOptional: 'Short Booking Note (Optional — avoid sensitive medical details)',
      submitBooking: 'Submit Appointment Request',
      submitting: 'Saving Appointment...',
      confirmedTitle: 'Appointment Request Recorded',
      pendingNote:
        'Your request has been saved with status PENDING. An appointment is confirmed only after Good Hope Pharmacy administration reviews and approves it.',
      bookingRef: 'Booking Reference',
      statusLabel: 'Current Status',
      newBooking: 'Book Another Appointment',
      noSlotsConfigured:
        'Fixed consultation slots for this doctor are awaiting confirmation by Good Hope Pharmacy. You can submit an appointment enquiry for this date and our desk will confirm the timing.',
      requestEnquirySlot: 'Request Appointment Timing (Desk Confirmation)',
      blockedDateNotice: 'This date is blocked or unavailable for booking. Please select another date.',
      privacyNote:
        'We collect only the minimum contact information required to coordinate your appointment. Please do not share sensitive medical records here.',
      errors: {
        selectDept: 'Please choose a department.',
        selectService: 'Please select a service.',
        selectDoctor: 'Please select a doctor.',
        selectDate: 'Please pick an appointment date.',
        selectSlot: 'Please select an available time slot.',
        enterName: 'Please enter your full name.',
        enterMobile: 'Please enter a valid mobile number.',
      },
    },
    contact: {
      callNow: 'Call Now',
      ownerLabel: 'Business Owner',
      phoneLabel: 'Telephone',
      addressLabel: 'Primary Public Address (Plus Code)',
      additionalAddressLabel: 'Additional Street Reference',
      openMapSearch: 'Search Plus Code on Google Maps',
      openVerifiedMap: 'Open Verified Location on Google Maps',
      mapUnverifiedNote:
        'Exact map pin verification is in progress. Use the Plus Code search link above or call us for walking directions.',
      enquiryTitle: 'Send a Message to Good Hope Pharmacy',
      sendEnquiry: 'Send Enquiry',
      enquirySent: 'Your message has been received by Good Hope Pharmacy. We will get back to you shortly.',
      hoursTitle: 'Business & Consultation Hours (IST)',
    },
    footer: {
      tagline: 'Trusted neighbourhood pharmacy and specialist doctor consultation desk in Kalimpong.',
      quickLinks: 'Quick Links',
      legal: 'Policies & Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      appointmentPolicy: 'Appointment Policy',
      cancellationPolicy: 'Cancellation Policy',
      rights: 'All rights reserved.',
      medicalDisclaimer:
        'Informational website only. Good Hope Pharmacy does not provide online medical diagnosis, treatment advice, or online prescription drug sales.',
    },
  },
  bn: {
    nav: {
      home: 'হোম',
      about: 'আমাদের সম্পর্কে',
      pharmacy: 'ফার্মেসি',
      doctors: 'ডাক্তারগণ',
      specialities: 'বিভাগসমূহ',
      book: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      gallery: 'গ্যালারি',
      contact: 'যোগাযোগ',
      admin: 'এডমিন',
    },
    hero: {
      headline: 'সুস্বাস্থ্য। যত্নশীল সেবা। গুড হোপ।',
      subheading: 'কালিম্পং-এ আপনার বিশ্বস্ত স্বাস্থ্যসেবা কেন্দ্র।',
      supporting:
        'গুড হোপ ফার্মেসিতে সুবিধাজনক ফার্মেসি পরিষেবা এবং বিশেষজ্ঞ ডাক্তারদের কনসালটেশন অ্যাপয়েন্টমেন্টের সুবিধা নিন।',
      ctaPrimary: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      ctaSecondary: 'আমাদের ডাক্তারদের দেখুন',
      staticToggleOn: 'অ্যানিমেশন চালু করুন',
      staticToggleOff: 'স্ট্যাটিক ভিউ',
      sceneLabels: ['ডাক্তার পরামর্শ', 'ফার্মেসি সহায়তা', 'স্বাস্থ্য তথ্য', 'গুড হোপ ফার্মেসি'],
    },
    sections: {
      aboutKicker: 'গুড হোপ ফার্মেসি সম্পর্কে',
      whyKicker: 'রোগী-কেন্দ্রিক সেবা',
      whyTitle: 'কেন কালিম্পং-এর পরিবারগুলো গুড হোপ বেছে নেয়',
      servicesKicker: 'পরামর্শ ও ফার্মেসি পরিষেবা',
      servicesTitle: 'বিশেষত্ব ও স্বাস্থ্যসেবা সমূহ',
      doctorsKicker: 'বিশেষজ্ঞ তালিকা',
      doctorsTitle: 'গুড হোপ-এ উপলব্ধ ডাক্তারগণ',
      doctorsSubtitle:
        'আমাদের ক্লিনিক বোর্ড থেকে সংগৃহীত ডাক্তারদের তথ্য। সময়সূচি এবং বিবরণ সরাসরি এডমিন প্যানেল থেকে আপডেট ও যাচাই করা হয়।',
      bookingKicker: 'অ্যাপয়েন্টমেন্ট ডেস্ক',
      bookingTitle: 'ডাক্তার কনসালটেশন বুক করুন',
      pharmacyKicker: 'ইন-স্টোর ফার্মেসি',
      galleryKicker: 'ফটো গ্যালারি',
      galleryTitle: 'গুড হোপ ফার্মেসি গ্যালারি',
      reviewsKicker: 'যাচাইকৃত মতামত',
      reviewsTitle: 'রোগীদের অভিজ্ঞতা',
      contactKicker: 'আমাদের ঠিকানা ও যোগাযোগ',
      contactTitle: 'অবস্থান ও যোগাযোগের তথ্য',
    },
    whyItems: [
      {
        title: 'সহজলভ্য ফার্মেসি সেবা',
        desc: 'কালিম্পং বাজারের কে.ডি. প্রধান রোডে সরাসরি ফার্মেসি সহায়তার নির্ভরযোগ্য ঠিকানা।',
      },
      {
        title: 'ডাক্তার পরামর্শ অনুসন্ধান',
        desc: 'ইএনটি, গাইনি, শিশু বিশেষজ্ঞ, মেডিসিন ও সার্জারি বিভাগের পরামর্শ বুকিং সুবিধা।',
      },
      {
        title: 'একাধিক চিকিৎসা বিভাগ',
        desc: 'একই স্থানে আটজন অভিজ্ঞ চিকিৎসকের পরামর্শের তথ্য ও অ্যাপয়েন্টমেন্ট ব্যবস্থা।',
      },
      {
        title: 'সহজ অনলাইন বুকিং',
        desc: 'পছন্দের ডাক্তার, পরিষেবা ও তারিখ বেছে অনলাইনে রেফারেন্স নম্বরসহ বুকিং অনুরোধ পাঠান।',
      },
      {
        title: 'আন্তরিক গ্রাহক সেবা',
        desc: 'স্বত্বাধিকারী সুদর্শন কার্কির তত্ত্বাবধানে যত্নশীল ও আন্তরিক রোগী সেবা।',
      },
    ],
    doctorCard: {
      verified: 'যাচাইকৃত প্রোফাইল',
      pendingVerification: 'যাচাই প্রক্রিয়াধীন',
      viewProfile: 'প্রোফাইল দেখুন',
      bookWithDoctor: 'অ্যাপয়েন্টমেন্ট নিন',
      regNo: 'রেজি. নং',
      affiliation: 'সংশ্লিষ্ট হাসপাতাল',
      schedulePending: 'অনুসন্ধানের মাধ্যমে সময় নিশ্চিত করা হবে',
      scheduleAvailable: 'নির্ধারিত স্লট উপলব্ধ',
    },
    booking: {
      stepDepartment: '১. বিভাগ',
      stepService: '২. পরিষেবা',
      stepDoctor: '৩. ডাক্তার',
      stepDate: '৪. তারিখ',
      stepSlot: '৫. সময় স্লট',
      stepDetails: '৬. রোগীর তথ্য',
      stepSummary: 'বুকিং সারসংক্ষেপ',
      fullName: 'পূর্ণ নাম',
      mobile: 'মোবাইল নম্বর',
      emailOptional: 'ইমেইল (ঐচ্ছিক)',
      messageOptional: 'সংক্ষিপ্ত বার্তা (ঐচ্ছিক — ব্যক্তিগত চিকিৎসা রিপোর্ট লিখবেন না)',
      submitBooking: 'অ্যাপয়েন্টমেন্ট অনুরোধ পাঠান',
      submitting: 'সংরক্ষণ করা হচ্ছে...',
      confirmedTitle: 'অ্যাপয়েন্টমেন্ট অনুরোধ সংরক্ষিত হয়েছে',
      pendingNote:
        'আপনার অনুরোধটি PENDING অবস্থায় সংরক্ষিত হয়েছে। এডমিন যাচাই করে অনুমোদন করার পরই বুকিং কনফার্ম হবে।',
      bookingRef: 'বুকিং রেফারেন্স',
      statusLabel: 'বর্তমান অবস্থা',
      newBooking: 'নতুন অ্যাপয়েন্টমেন্ট করুন',
      noSlotsConfigured:
        'এই ডাক্তারের নির্দিষ্ট সময়সূচি এখনো চূড়ান্ত হয়নি। আপনি এই তারিখের জন্য অনুসন্ধান অনুরোধ পাঠাতে পারেন।',
      requestEnquirySlot: 'সময়ের জন্য অনুরোধ করুন (ডেস্ক কনফার্মেশন)',
      blockedDateNotice: 'এই তারিখটি বুকিংয়ের জন্য বন্ধ রয়েছে। অনুগ্রহ করে অন্য তারিখ বেছে নিন।',
      privacyNote:
        'শুধুমাত্র অ্যাপয়েন্টমেন্ট পরিচালনার জন্য প্রয়োজনীয় ন্যূনতম তথ্য সংগ্রহ করা হয়।',
      errors: {
        selectDept: 'অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন।',
        selectService: 'অনুগ্রহ করে একটি পরিষেবা নির্বাচন করুন।',
        selectDoctor: 'অনুগ্রহ করে একজন ডাক্তার নির্বাচন করুন।',
        selectDate: 'অনুগ্রহ করে একটি তারিখ নির্বাচন করুন।',
        selectSlot: 'অনুগ্রহ করে একটি সময় স্লট নির্বাচন করুন।',
        enterName: 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।',
        enterMobile: 'অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।',
      },
    },
    contact: {
      callNow: 'এখনই কল করুন',
      ownerLabel: 'স্বত্বাধিকারী',
      phoneLabel: 'টেলিফোন',
      addressLabel: 'ঠিকানা (প্লাস কোড)',
      additionalAddressLabel: 'অতিরিক্ত ঠিকানা',
      openMapSearch: 'গুগল ম্যাপে প্লাস কোড খুঁজুন',
      openVerifiedMap: 'গুগল ম্যাপে অবস্থান দেখুন',
      mapUnverifiedNote:
        'সঠিক ম্যাপ পিন যাচাই চলছে। দিকনির্দেশনার জন্য উপরের প্লাস কোড লিঙ্ক ব্যবহার করুন অথবা কল করুন।',
      enquiryTitle: 'গুড হোপ ফার্মেসিতে বার্তা পাঠান',
      sendEnquiry: 'বার্তা পাঠান',
      enquirySent: 'আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।',
      hoursTitle: 'ব্যবসা ও পরামর্শের সময়সূচি (IST)',
    },
    footer: {
      tagline: 'কালিম্পং-এ নির্ভরযোগ্য ফার্মেসি এবং বিশেষজ্ঞ ডাক্তার পরামর্শ কেন্দ্র।',
      quickLinks: 'দ্রুত লিঙ্ক',
      legal: 'নীতিমালা',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'শর্তাবলী',
      appointmentPolicy: 'অ্যাপয়েন্টমেন্ট নীতি',
      cancellationPolicy: 'বাতিলকরণ নীতি',
      rights: 'সর্বস্বত্ব সংরক্ষিত।',
      medicalDisclaimer:
        'এটি শুধুমাত্র তথ্যমূলক ওয়েবসাইট। এখানে অনলাইনে ওষুধ বিক্রি বা চিকিৎসা পরামর্শ দেওয়া হয় না।',
    },
  },
  ne: {
    nav: {
      home: 'गृहपृष्ठ',
      about: 'हाम्रो बारेमा',
      pharmacy: 'फार्मेसी',
      doctors: 'हाम्रा डाक्टरहरू',
      specialities: 'विशेषताहरू',
      book: 'अपोइन्टमेन्ट बुक',
      gallery: 'ग्यालेरी',
      contact: 'सम्पर्क',
      admin: 'एडमिन',
    },
    hero: {
      headline: 'असल स्वास्थ्य। असल हेरचाह। गुड होप।',
      subheading: 'कालिम्पोङमा तपाईंको विश्वसनीय स्वास्थ्य सेवा केन्द्र।',
      supporting:
        'गुड होप फार्मेसीमा सहज फार्मेसी सेवा र विशेषज्ञ डाक्टरको परामर्श अपोइन्टमेन्ट प्राप्त गर्नुहोस्।',
      ctaPrimary: 'अपोइन्टमेन्ट बुक गर्नुहोस्',
      ctaSecondary: 'हाम्रा डाक्टरहरू हेर्नुहोस्',
      staticToggleOn: 'एनिमेसन खोल्नुहोस्',
      staticToggleOff: 'स्थिर दृश्य',
      sceneLabels: ['डाक्टर परामर्श', 'फार्मेसी सहयोग', 'हेरचाह जानकारी', 'गुड होप फार्मेसी'],
    },
    sections: {
      aboutKicker: 'गुड होप फार्मेसीको बारेमा',
      whyKicker: 'बिरामी-केन्द्रित सेवा',
      whyTitle: 'कालिम्पोङका परिवारहरूले किन गुड होप रोज्छन्',
      servicesKicker: 'परामर्श र फार्मेसी सेवाहरू',
      servicesTitle: 'विशेषताहरू र स्वास्थ्य सेवाहरू',
      doctorsKicker: 'विशेषज्ञ सूची',
      doctorsTitle: 'गुड होपमा उपलब्ध डाक्टरहरू',
      doctorsSubtitle:
        'हाम्रो क्लिनिक बोर्डबाट लिइएका विशेषज्ञ विवरणहरू। समय तालिका र विवरणहरू प्रशासनद्वारा अद्यावधिक गरिन्छन्।',
      bookingKicker: 'अपोइन्टमेन्ट डेस्क',
      bookingTitle: 'डाक्टर परामर्श बुक गर्नुहोस्',
      pharmacyKicker: 'इन-स्टोर फार्मेसी',
      galleryKicker: 'फोटो ग्यालेरी',
      galleryTitle: 'गुड होप फार्मेसी ग्यालेरी',
      reviewsKicker: 'प्रमाणित प्रतिक्रिया',
      reviewsTitle: 'ग्राहकहरूको अनुभव',
      contactKicker: 'भेट्नुहोस् वा फोन गर्नुहोस्',
      contactTitle: 'स्थान र सम्पर्क विवरण',
    },
    whyItems: [
      {
        title: 'सहज फार्मेसी पहुँच',
        desc: 'कालिम्पोङ बजारको के.डी. प्रधान रोडमा भरपर्दो प्रत्यक्ष फार्मेसी सेवा।',
      },
      {
        title: 'डाक्टर परामर्श जानकारी',
        desc: 'इएनटी, स्त्रीरोग, बालरोग, मेडिसिन र सर्जरी परामर्शको सहज व्यवस्था।',
      },
      {
        title: 'बहु-विशेषज्ञ सेवाहरू',
        desc: 'एउटै स्थानमा आठ जना अनुभवी विशेषज्ञ डाक्टरहरूको परामर्श सुविधा।',
      },
      {
        title: 'सजिलो अपोइन्टमेन्ट बुकिङ',
        desc: 'अनलाइन माध्यमबाट आफ्नो रोजाइको डाक्टर, सेवा र मिति छानी बुकिङ अनुरोध पठाउनुहोस्।',
      },
      {
        title: 'आत्मीय ग्राहक अनुभव',
        desc: 'सञ्चालक सुदर्शन कार्कीको नेतृत्वमा सम्मानजनक र सहयोगी सेवा।',
      },
    ],
    doctorCard: {
      verified: 'प्रमाणित प्रोफाइल',
      pendingVerification: 'प्रमाणीकरण बाँकी',
      viewProfile: 'प्रोफाइल हेर्नुहोस्',
      bookWithDoctor: 'अपोइन्टमेन्ट लिनुहोस्',
      regNo: 'दर्ता नं.',
      affiliation: 'सम्बद्ध अस्पताल',
      schedulePending: 'सोधपुछ पछि समय निश्चित हुनेछ',
      scheduleAvailable: 'समय स्लट उपलब्ध छ',
    },
    booking: {
      stepDepartment: '१. विभाग',
      stepService: '२. सेवा',
      stepDoctor: '३. डाक्टर',
      stepDate: '४. मिति',
      stepSlot: '५. समय',
      stepDetails: '६. बिरामी विवरण',
      stepSummary: 'बुकिङ सारांश',
      fullName: 'पूरा नाम',
      mobile: 'मोबाइल नम्बर',
      emailOptional: 'इमेल (ऐच्छिक)',
      messageOptional: 'छोटो सन्देश (ऐच्छिक)',
      submitBooking: 'अपोइन्टमेन्ट अनुरोध पठाउनुहोस्',
      submitting: 'सुरक्षित गरिँदैछ...',
      confirmedTitle: 'अपोइन्टमेन्ट अनुरोध दर्ता भयो',
      pendingNote:
        'तपाईंको अनुरोध PENDING स्थितिमा सुरक्षित भएको छ। गुड होप फार्मेसी प्रशासनले स्वीकृत गरेपछि मात्र निश्चित हुनेछ।',
      bookingRef: 'बुकिङ नम्बर',
      statusLabel: 'हालको स्थिति',
      newBooking: 'अर्को अपोइन्टमेन्ट बुक गर्नुहोस्',
      noSlotsConfigured:
        'यस डाक्टरको नियमित समय तालिका पुष्टि हुन बाँकी छ। तपाईं यस मितिका लागि अनुरोध पठाउन सक्नुहुन्छ।',
      requestEnquirySlot: 'समयका लागि अनुरोध गर्नुहोस्',
      blockedDateNotice: 'यो मिति बुकिङका लागि बन्द छ। कृपया अर्को मिति छान्नुहोस्।',
      privacyNote: 'अपोइन्टमेन्ट समन्वयका लागि आवश्यक न्यूनतम जानकारी मात्र संकलन गरिन्छ।',
      errors: {
        selectDept: 'कृपया विभाग छान्नुहोस्।',
        selectService: 'कृपया सेवा छान्नुहोस्।',
        selectDoctor: 'कृपया डाक्टर छान्नुहोस्।',
        selectDate: 'कृपया मिति छान्नुहोस्।',
        selectSlot: 'कृपया समय स्लट छान्नुहोस्।',
        enterName: 'कृपया पूरा नाम लेख्नुहोस्।',
        enterMobile: 'कृपया मान्य मोबाइल नम्बर दिनुहोस्।',
      },
    },
    contact: {
      callNow: 'अहिले फोन गर्नुहोस्',
      ownerLabel: 'सञ्चालक',
      phoneLabel: 'फोन नम्बर',
      addressLabel: 'मुख्य ठेगाना (प्लस कोड)',
      additionalAddressLabel: 'थप ठेगाना',
      openMapSearch: 'गुगल म्यापमा प्लस कोड खोज्नुहोस्',
      openVerifiedMap: 'गुगल म्यापमा स्थान खोल्नुहोस्',
      mapUnverifiedNote:
        'सही म्याप पिन प्रमाणीकरण भइरहेको छ। दिशाका लागि माथिको प्लस कोड प्रयोग गर्नुहोस् वा फोन गर्नुहोस्।',
      enquiryTitle: 'गुड होप फार्मेसीमा सन्देश पठाउनुहोस्',
      sendEnquiry: 'सन्देश पठाउनुहोस्',
      enquirySent: 'तपाईंको सन्देश प्राप्त भयो। हामी छिट्टै सम्पर्क गर्नेछौं।',
      hoursTitle: 'सञ्चालन र परामर्श समय (IST)',
    },
    footer: {
      tagline: 'कालिम्पोङमा विश्वसनीय फार्मेसी तथा विशेषज्ञ डाक्टर परामर्श केन्द्र।',
      quickLinks: 'छिटो लिङ्कहरू',
      legal: 'नीति तथा शर्तहरू',
      privacy: 'गोपनीयता नीति',
      terms: 'नियम र शर्तहरू',
      appointmentPolicy: 'अपोइन्टमेन्ट नीति',
      cancellationPolicy: 'रद्द गर्ने नीति',
      rights: 'सर्वाधिकार सुरक्षित।',
      medicalDisclaimer:
        'यो वेबसाइट जानकारीको लागि मात्र हो। अनलाइन औषधि बिक्री वा चिकित्सा निदान गरिँदैन।',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      about: 'हमारे बारे में',
      pharmacy: 'फार्मेसी',
      doctors: 'हमारे डॉक्टर',
      specialities: 'विशेषताएं',
      book: 'अपॉइंटमेंट बुक करें',
      gallery: 'गैलरी',
      contact: 'संपर्क',
      admin: 'एडमिन',
    },
    hero: {
      headline: 'अच्छा स्वास्थ्य। अच्छी देखभाल। गुड होप।',
      subheading: 'कलिम्पोंग में आपका विश्वसनीय स्वास्थ्य सेवा केंद्र।',
      supporting:
        'गुड होप फार्मेसी में सुविधाजनक फार्मेसी सेवाएं और विशेषज्ञ डॉक्टर परामर्श अपॉइंटमेंट प्राप्त करें।',
      ctaPrimary: 'अपॉइंटमेंट बुक करें',
      ctaSecondary: 'हमारे डॉक्टरों से मिलें',
      staticToggleOn: 'एनिमेशन चालू करें',
      staticToggleOff: 'स्थिर दृश्य',
      sceneLabels: ['डॉक्टर परामर्श', 'फार्मेसी सहायता', 'देखभाल जानकारी', 'गुड होप फार्मेसी'],
    },
    sections: {
      aboutKicker: 'गुड होप फार्मेसी के बारे में',
      whyKicker: 'रोगी-प्रथम देखभाल',
      whyTitle: 'कलिम्पोंग के परिवार गुड होप क्यों चुनते हैं',
      servicesKicker: 'परामर्श एवं फार्मेसी सेवाएं',
      servicesTitle: 'विशेषताएं और स्वास्थ्य सेवाएं',
      doctorsKicker: 'विशेषज्ञ निर्देशिका',
      doctorsTitle: 'गुड होप में उपलब्ध डॉक्टर',
      doctorsSubtitle:
        'हमारे क्लिनिक बोर्ड से सूचीबद्ध विशेषज्ञ डॉक्टरों की जानकारी। समय और विवरण प्रशासन द्वारा सत्यापित व अपडेट किए जाते हैं।',
      bookingKicker: 'अपॉइंटमेंट डेस्क',
      bookingTitle: 'डॉक्टर परामर्श बुक करें',
      pharmacyKicker: 'इन-स्टोर फार्मेसी',
      galleryKicker: 'फोटो गैलरी',
      galleryTitle: 'गुड होप फार्मेसी की झलक',
      reviewsKicker: 'सत्यापित प्रतिक्रिया',
      reviewsTitle: 'हमारे आगंतुकों के अनुभव',
      contactKicker: 'मिलें या कॉल करें',
      contactTitle: 'स्थान और संपर्क जानकारी',
    },
    whyItems: [
      {
        title: 'सुविधाजनक फार्मेसी पहुंच',
        desc: 'के.डी. प्रधान रोड, कलिम्पोंग बाजार में भरोसेमंद इन-स्टोर फार्मेसी सेवा।',
      },
      {
        title: 'डॉक्टर परामर्श पूछताछ',
        desc: 'ईएनटी, स्त्री रोग, बाल रोग, मेडिसिन और सर्जरी परामर्श के लिए सरल सहायता।',
      },
      {
        title: 'अनेक चिकित्सा विशेषज्ञताएं',
        desc: 'एक ही परिचित स्थान पर आठ अनुभवी विशेषज्ञ डॉक्टरों की जानकारी और अपॉइंटमेंट।',
      },
      {
        title: 'आसान अपॉइंटमेंट बुकिंग',
        desc: 'अपना पसंदीदा डॉक्टर, सेवा और तिथि चुनकर स्पष्ट बुकिंग रेफरेंस प्राप्त करें।',
      },
      {
        title: 'मैत्रीपूर्ण ग्राहक सेवा',
        desc: 'संचालक सुदर्शन कार्की की देखरेख में विनम्र और रोगी-केंद्रित सेवा।',
      },
    ],
    doctorCard: {
      verified: 'सत्यापित प्रोफ़ाइल',
      pendingVerification: 'सत्यापन लंबित',
      viewProfile: 'प्रोफ़ाइल देखें',
      bookWithDoctor: 'अपॉइंटमेंट लें',
      regNo: 'पंजीकरण सं.',
      affiliation: 'संबद्ध अस्पताल',
      schedulePending: 'पूछताछ पर समय पुष्टि',
      scheduleAvailable: 'समय स्लॉट उपलब्ध',
    },
    booking: {
      stepDepartment: '1. विभाग',
      stepService: '2. सेवा',
      stepDoctor: '3. डॉक्टर',
      stepDate: '4. तिथि',
      stepSlot: '5. समय स्लॉट',
      stepDetails: '6. रोगी विवरण',
      stepSummary: 'बुकिंग सारांश',
      fullName: 'पूरा नाम',
      mobile: 'मोबाइल नंबर',
      emailOptional: 'ईमेल (वैकल्पिक)',
      messageOptional: 'संक्षिप्त संदेश (वैकल्पिक)',
      submitBooking: 'अपॉइंटमेंट अनुरोध भेजें',
      submitting: 'सहेजा जा रहा है...',
      confirmedTitle: 'अपॉइंटमेंट अनुरोध दर्ज किया गया',
      pendingNote:
        'आपका अनुरोध PENDING स्थिति में सहेजा गया है। गुड होप फार्मेसी प्रशासन द्वारा स्वीकृत होने पर ही अपॉइंटमेंट कन्फर्म होगा।',
      bookingRef: 'बुकिंग रेफरेंस',
      statusLabel: 'वर्तमान स्थिति',
      newBooking: 'नया अपॉइंटमेंट बुक करें',
      noSlotsConfigured:
        'इस डॉक्टर के निश्चित समय स्लॉट अभी पुष्टि की प्रतीक्षा में हैं। आप इस तिथि के लिए पूछताछ अनुरोध भेज सकते हैं।',
      requestEnquirySlot: 'समय के लिए अनुरोध करें (डेस्क पुष्टि)',
      blockedDateNotice: 'यह तिथि बुकिंग के लिए बंद है। कृपया कोई अन्य तिथि चुनें।',
      privacyNote: 'केवल अपॉइंटमेंट समन्वय हेतु आवश्यक न्यूनतम संपर्क जानकारी एकत्र की जाती है।',
      errors: {
        selectDept: 'कृपया विभाग चुनें।',
        selectService: 'कृपया सेवा चुनें।',
        selectDoctor: 'कृपया डॉक्टर चुनें।',
        selectDate: 'कृपया तिथि चुनें।',
        selectSlot: 'कृपया समय स्लॉट चुनें।',
        enterName: 'कृपया अपना पूरा नाम दर्ज करें।',
        enterMobile: 'कृपया मान्य मोबाइल नंबर दर्ज करें।',
      },
    },
    contact: {
      callNow: 'अभी कॉल करें',
      ownerLabel: 'संचालक',
      phoneLabel: 'फोन नंबर',
      addressLabel: 'मुख्य पता (प्लस कोड)',
      additionalAddressLabel: 'अतिरिक्त पता',
      openMapSearch: 'गूगल मैप्स पर प्लस कोड खोजें',
      openVerifiedMap: 'गूगल मैप्स पर सत्यापित स्थान खोलें',
      mapUnverifiedNote:
        'सटीक मैप पिन का सत्यापन प्रगति पर है। दिशा के लिए ऊपर दिए गए प्लस कोड लिंक का उपयोग करें या कॉल करें।',
      enquiryTitle: 'गुड होप फार्मेसी को संदेश भेजें',
      sendEnquiry: 'संदेश भेजें',
      enquirySent: 'आपका संदेश प्राप्त हो गया है। हम शीघ्र ही आपसे संपर्क करेंगे।',
      hoursTitle: 'व्यावसायिक एवं परामर्श समय (IST)',
    },
    footer: {
      tagline: 'कलिम्पोंग में विश्वसनीय फार्मेसी और विशेषज्ञ डॉक्टर परामर्श केंद्र।',
      quickLinks: 'त्वरित लिंक',
      legal: 'नीतियां और शर्तें',
      privacy: 'गोपनीयता नीति',
      terms: 'नियम एवं शर्तें',
      appointmentPolicy: 'अपॉइंटमेंट नीति',
      cancellationPolicy: 'रद्दीकरण नीति',
      rights: 'सर्वाधिकार सुरक्षित।',
      medicalDisclaimer:
        'यह वेबसाइट केवल सूचना के लिए है। यहाँ ऑनलाइन दवा बिक्री या चिकित्सा निदान प्रदान नहीं किया जाता है।',
    },
  },
};
