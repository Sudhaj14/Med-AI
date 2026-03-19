import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "chatbot": "AI Chatbot",
      "symptomChecker": "Symptom Checker",
      "healthMetrics": "Health Metrics",
      "appointments": "Appointments",
      "profile": "Profile",
      "logout": "Logout",
      "bookAppointment": "Book Appointment",
      
      // Role Selection
      "selectRole": "Select Your Role",
      "patient": "Patient",
      "doctor": "Doctor",
      "loginAsPatient": "Login as Patient",
      "loginAsDoctor": "Login as Doctor",
      "yourIntelligentHealthcare": "Your Intelligent Healthcare Platform",
      "chooseRoleToStart": "Choose your role to get started with personalized healthcare experience",
      
      // Patient Features
      "aiMedicalChatbot": "AI Medical Chatbot",
      "symptomCheckerFeature": "Symptom Checker",
      "healthMetricsTracking": "Health Metrics Tracking",
      "appointmentBooking": "Appointment Booking",
      
      // Doctor Features
      "professionalProfile": "Professional Profile",
      "slotManagement": "Slot Management",
      "appointmentDashboard": "Appointment Dashboard",
      "patientDataAccess": "Patient Data Access",
      
      // Common
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "save": "Save",
      "edit": "Edit",
      "delete": "Delete",
      "confirm": "Confirm",
      "search": "Search",
      "filter": "Filter",
      "close": "Close",
      
      // Video Consultationfi
      "startVideoCall": "Start Video Call",
      "joinVideoCall": "Join Video Call",
      "videoConsultation": "Video Consultation",
      "callInProgress": "Call in Progress",
      "endCall": "End Call",
      "mute": "Mute",
      "unmute": "Unmute",
      "videoOff": "Video Off",
      "videoOn": "Video On",
      
      // Pharmacy
      "pharmacy": "Pharmacy",
      "medicines": "Medicines",
      "searchMedicines": "Search Medicines",
      "availableNearby": "Available Nearby",
      "outOfStock": "Out of Stock",
      "prescription": "Prescription",
      
      // Offline
      "offline": "Offline",
      "online": "Online",
      "syncing": "Syncing...",
      "offlineRecords": "Offline Records",
      "syncWhenOnline": "Sync when online",
      
      // Forms
      "name": "Name",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "specialization": "Specialization",
      "experience": "Experience",
      "consultationFee": "Consultation Fee",
      "reason": "Reason",
      "symptoms": "Symptoms",
      "date": "Date",
      "time": "Time",
      
      // Messages
      "welcomeBack": "Welcome back",
      "loginSuccessful": "Login successful",
      "appointmentBooked": "Appointment booked successfully",
      "noAppointments": "No appointments yet",
      "secureHipaa": "Secure • HIPAA Compliant • Available 24/7"
    }
  },
  
  ta: {
    translation: {
      // Navigation
      "dashboard": "டாஷ்போர்டு",
      "chatbot": "AI அரட்டை",
      "symptomChecker": "அறிகுறிகள் சரிபார்ப்பு",
      "healthMetrics": "ஆரோக்கிய அளவுகோல்கள்",
      "appointments": "நியமனங்கள்",
      "profile": "சுயவிவரம்",
      "logout": "வெளியேறு",
      "bookAppointment": "நியமனம் புத்தகம்",
      
      // Role Selection
      "selectRole": "உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்",
      "patient": "நோயாளி",
      "doctor": "மருத்துவர்",
      "loginAsPatient": "நோயாளியாக உள்நுழைய",
      "loginAsDoctor": "மருத்துவராக உள்நுழைய",
      "yourIntelligentHealthcare": "உங்கள் நுண்ணறிவு சுகாதார தளம்",
      "chooseRoleToStart": "தனிப்பயனாக்கப்பட்ட சுகாதார அனுபவத்துடன் தொடங்க உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்",
      
      // Patient Features
      "aiMedicalChatbot": "AI மருத்துவ அரட்டை",
      "symptomCheckerFeature": "அறிகுறிகள் சரிபார்ப்பு",
      "healthMetricsTracking": "ஆரோக்கிய அளவுகோல் கண்காணிப்பு",
      "appointmentBooking": "நியமனம் புத்தகம்",
      
      // Doctor Features
      "professionalProfile": "தொழில்முறை சுயவிவரம்",
      "slotManagement": "ஸ்லாட் மேலாண்மை",
      "appointmentDashboard": "நியமனம் டாஷ்போர்டு",
      "patientDataAccess": "நோயாளி தரவு அணுகல்",
      
      // Common
      "loading": "ஏற்றுகிறது...",
      "error": "பிழை",
      "success": "வெற்றி",
      "cancel": "ரத்துசெய்",
      "save": "சேமி",
      "edit": "திருத்து",
      "delete": "நீக்கு",
      "confirm": "உறுதிப்படுத்து",
      "search": "தேடு",
      "filter": "டிகட்டு",
      "close": "மூடு",
      
      // Video Consultation
      "startVideoCall": "வீடியோ அழைப்பைத் தொடங்கு",
      "joinVideoCall": "வீடியோ அழைப்பில் சேர்",
      "videoConsultation": "வீடியோ ஆலோசனை",
      "callInProgress": "அழைப்பு நடைபெறுகிறது",
      "endCall": "அழைப்பை முடிக்க",
      "mute": "அமைதி",
      "unmute": "ஒலி திற",
      "videoOff": "வீடியோ ஆஃப்",
      "videoOn": "வீடியோ ஆன்",
      
      // Pharmacy
      "pharmacy": "மருந்தகம்",
      "medicines": "மருந்துகள்",
      "searchMedicines": "மருந்துகளைத் தேடு",
      "availableNearby": "அருகில் கிடைக்கிறது",
      "outOfStock": "ஸ்டாக் இல்லை",
      "prescription": "மருந்து சீட்டு",
      
      // Offline
      "offline": "ஆஃப்லைன்",
      "online": "ஆன்லைன்",
      "syncing": "ஒத்திசைக்கிறது...",
      "offlineRecords": "ஆஃப்லைன் பதிவுகள்",
      "syncWhenOnline": "ஆன்லைனில் இருந்து ஒத்திசை",
      
      // Forms
      "name": "பெயர்",
      "email": "மின்னஞ்சல்",
      "password": "கடவுச்சொல்",
      "confirmPassword": "கடவுச்சொல்லை உறுதிப்படுத்து",
      "specialization": "நிபுணத்துவம்",
      "experience": "அனுபவம்",
      "consultationFee": "ஆலோசனை கட்டணம்",
      "reason": "காரணம்",
      "symptoms": "அறிகுறிகள்",
      "date": "தேதி",
      "time": "நேரம்",
      
      // Messages
      "welcomeBack": "மீண்டும் வருகை",
      "loginSuccessful": "உள்நுழைவு வெற்றிகரமாக",
      "appointmentBooked": "நியமனம் வெற்றிகரமாக முடிக்கப்பட்டது",
      "noAppointments": "நியமனங்கள் இல்லை",
      "secureHipaa": "பாதுகாப்பான • HIPAA இணக்கம் • 24/7 கிடைக்கிறது"
    }
  },
  
  hi: {
    translation: {
      // Navigation
      "dashboard": "डैशबोर्ड",
      "chatbot": "AI चैटबॉट",
      "symptomChecker": "लक्षण जांच",
      "healthMetrics": "स्वास्थ्य मेट्रिक्स",
      "appointments": "नियुक्तियां",
      "profile": "प्रोफाइल",
      "logout": "लॉगआउट",
      "bookAppointment": "अपॉइंटमेंट बुक करें",
      
      // Role Selection
      "selectRole": "अपनी भूमिका चुनें",
      "patient": "रोगी",
      "doctor": "डॉक्टर",
      "loginAsPatient": "रोगी के रूप में लॉगिन करें",
      "loginAsDoctor": "डॉक्टर के रूप में लॉगिन करें",
      "yourIntelligentHealthcare": "आपका बुद्धिमान स्वास्थ्य सेवा प्लेटफॉर्म",
      "chooseRoleToStart": "व्यक्तिगत स्वास्थ्य अनुभव के साथ शुरू करने के लिए अपनी भूमिका चुनें",
      
      // Patient Features
      "aiMedicalChatbot": "AI मेडिकल चैटबॉट",
      "symptomCheckerFeature": "लक्षण जांच",
      "healthMetricsTracking": "स्वास्थ्य मेट्रिक्स ट्रैकिंग",
      "appointmentBooking": "अपॉइंटमेंट बुकिंग",
      
      // Doctor Features
      "professionalProfile": "पेशेवर प्रोफाइल",
      "slotManagement": "स्लॉट प्रबंधन",
      "appointmentDashboard": "अपॉइंटमेंट डैशबोर्ड",
      "patientDataAccess": "रोगी डेटा एक्सेस",
      
      // Common
      "loading": "लोड हो रहा है...",
      "error": "त्रुटि",
      "success": "सफलता",
      "cancel": "रद्द करें",
      "save": "सेव करें",
      "edit": "संपादित करें",
      "delete": "हटाएं",
      "confirm": "पुष्टि करें",
      "search": "खोजें",
      "filter": "फ़िल्टर करें",
      "close": "बंद करें",
      
      // Video Consultation
      "startVideoCall": "वीडियो कॉल शुरू करें",
      "joinVideoCall": "वीडियो कॉल में शामिल हों",
      "videoConsultation": "वीडियो परामर्श",
      "callInProgress": "कॉल जारी है",
      "endCall": "कॉल समाप्त करें",
      "mute": "म्यूट करें",
      "unmute": "अनम्यूट करें",
      "videoOff": "वीडियो बंद",
      "videoOn": "वीडियो चालू",
      
      // Pharmacy
      "pharmacy": "फार्मेसी",
      "medicines": "दवाएं",
      "searchMedicines": "दवाएं खोजें",
      "availableNearby": "नजदीक उपलब्ध",
      "outOfStock": "स्टॉक में नहीं",
      "prescription": "प्रिस्क्रिप्शन",
      
      // Offline
      "offline": "ऑफलाइन",
      "online": "ऑनलाइन",
      "syncing": "सिंक हो रहा है...",
      "offlineRecords": "ऑफलाइन रिकॉर्ड्स",
      "syncWhenOnline": "ऑनलाइन होने पर सिंक करें",
      
      // Forms
      "name": "नाम",
      "email": "ईमेल",
      "password": "पासवर्ड",
      "confirmPassword": "पासवर्ड की पुष्टि करें",
      "specialization": "विशेषज्ञता",
      "experience": "अनुभव",
      "consultationFee": "परामर्श शुल्क",
      "reason": "कारण",
      "symptoms": "लक्षण",
      "date": "तारीख",
      "time": "समय",
      
      // Messages
      "welcomeBack": "वापसी पर स्वागत है",
      "loginSuccessful": "लॉगिन सफल",
      "appointmentBooked": "अपॉइंटमेंट सफलतापूर्वक बुक हो गई",
      "noAppointments": "कोई अपॉइंटमेंट नहीं",
      "secureHipaa": "सुरक्षित • HIPAA अनुपालन • 24/7 उपलब्ध"
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
