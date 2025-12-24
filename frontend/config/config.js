/* ============================================
   CONFIGURATION FILE
   Change these settings per website
   ============================================ */

const CONFIG = {
    // Business Information
    businessName: "HealthCare Plus",
    businessType: "healthcare", // healthcare, ecommerce, fashion, etc.
    tagline: "Your Health, Our Priority",
    
    // Contact Information
    contact: {
        phone: "+234 800 123 4567",
        phone2: "+234 800 765 4321",
        email: "info@healthcareplus.com",
        email2: "appointments@healthcareplus.com",
        address: "123 Health Street, Victoria Island, Lagos, Nigeria"
    },
    
    // Working Hours
    workingHours: {
        weekdays: "Monday - Friday: 8:00 AM - 8:00 PM",
        weekends: "Saturday - Sunday: 9:00 AM - 5:00 PM"
    },
    
    // Social Media
    social: {
        facebook: "https://facebook.com/healthcareplus",
        twitter: "https://twitter.com/healthcareplus",
        instagram: "https://instagram.com/healthcareplus",
        linkedin: "https://linkedin.com/company/healthcareplus"
    },
    
    // Payment Settings
    payment: {
        provider: "paystack", // paystack, flutterwave, stripe
        publicKey: "pk_test_YOUR_PAYSTACK_PUBLIC_KEY", // Replace with actual key
        currency: "NGN"
    },
    
    // Features to Enable/Disable
    features: {
        appointments: true,
        payments: true,
        authentication: true,
        newsletter: true,
        blog: false,
        chatbot: false
    },
    
    // Theme Colors (override in theme CSS)
    theme: {
        primaryColor: "#0ea5e9",
        secondaryColor: "#10b981",
        accentColor: "#ef4444"
    },
    
    // Services/Products (Healthcare)
    services: [
        {
            id: 1,
            name: "General Consultation",
            icon: "🩺",
            description: "Expert medical advice for all health concerns",
            price: 5000,
            duration: "30 mins"
        },
        {
            id: 2,
            name: "Laboratory Tests",
            icon: "🧪",
            description: "Accurate diagnostics with modern equipment",
            price: 8000,
            duration: "1 hour"
        },
        {
            id: 3,
            name: "Vaccinations",
            icon: "💉",
            description: "Complete immunization services for all ages",
            price: 3500,
            duration: "15 mins"
        },
        {
            id: 4,
            name: "Emergency Care",
            icon: "🏥",
            description: "24/7 emergency medical services",
            price: 15000,
            duration: "Varies"
        },
        {
            id: 5,
            name: "Dental Care",
            icon: "🦷",
            description: "Complete dental health solutions",
            price: 10000,
            duration: "45 mins"
        },
        {
            id: 6,
            name: "Eye Care",
            icon: "👁️",
            description: "Comprehensive eye examinations and treatments",
            price: 7500,
            duration: "30 mins"
        }
    ],
    
    // Team Members (Doctors/Staff)
    team: [
        {
            id: 1,
            name: "Dr. Chukwu Obi",
            role: "General Physician",
            specialty: "General Physician",
            experience: "15 years experience",
            image: "👨‍⚕️"
        },
        {
            id: 2,
            name: "Dr. Amina Bello",
            role: "Pediatrician",
            specialty: "Pediatrician",
            experience: "12 years experience",
            image: "👩‍⚕️"
        },
        {
            id: 3,
            name: "Dr. Tunde Adeyemi",
            role: "Cardiologist",
            specialty: "Cardiologist",
            experience: "18 years experience",
            image: "👨‍⚕️"
        },
        {
            id: 4,
            name: "Dr. Ngozi Eze",
            role: "Dentist",
            specialty: "Dentist",
            experience: "10 years experience",
            image: "👩‍⚕️"
        }
    ],
    
    // Appointment Time Slots
    timeSlots: [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "14:00",
        "15:00",
        "16:00"
    ],
    
    // Email Templates
    emailTemplates: {
        appointmentConfirmation: {
            subject: "Appointment Confirmation - {businessName}",
            template: `
                Dear {customerName},
                
                Your appointment has been confirmed!
                
                Appointment Details:
                - Service: {service}
                - Date: {date}
                - Time: {time}
                - Amount Paid: {amount}
                - Reference: {reference}
                
                Please arrive 10 minutes before your scheduled time.
                
                Best regards,
                {businessName} Team
            `
        }
    }
};

// For E-commerce websites, use this structure instead:
const ECOMMERCE_CONFIG = {
    businessName: "Fashion Store",
    businessType: "ecommerce",
    products: [
        {
            id: 1,
            name: "Product Name",
            category: "Category",
            price: 5000,
            image: "product-image.jpg",
            description: "Product description"
        }
    ],
    categories: ["Men", "Women", "Kids", "Accessories"],
    shippingFee: 2000,
    freeShippingThreshold: 50000
};

// For Fashion Design websites:
const FASHION_CONFIG = {
    businessName: "Elegant Designs",
    businessType: "fashion",
    services: [
        {
            name: "Custom Design",
            price: 25000,
            description: "Bespoke fashion design service"
        },
        {
            name: "Alterations",
            price: 5000,
            description: "Professional clothing alterations"
        }
    ],
    portfolioItems: [],
    measurementForm: true
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ECOMMERCE_CONFIG, FASHION_CONFIG };
}
