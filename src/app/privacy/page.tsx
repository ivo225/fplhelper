'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p>
            At FPL Analytics, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
          <p>
            When you use FPL Analytics, we may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Your FPL ID (when provided by you)</li>
            <li>Usage data (pages visited, time spent on the site)</li>
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Provide personalized FPL recommendations and insights</li>
            <li>Improve our website and services</li>
            <li>Analyze usage patterns and trends</li>
            <li>Ensure the security of our services</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Storage and Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            Your FPL ID is stored securely and is only used to retrieve your team data from the 
            official Fantasy Premier League API.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our website. 
            You can set your browser to refuse all or some browser cookies, but this may affect some 
            functionality of our website.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Third-Party Services</h2>
          <p>
            We may use third-party services such as analytics providers and hosting services. 
            These third parties may have access to your information only to perform specific tasks 
            on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Your Data Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal data, 
            including the right to access, correct, or delete your personal information. To exercise 
            these rights, please contact us.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@fplanalytics.com.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 